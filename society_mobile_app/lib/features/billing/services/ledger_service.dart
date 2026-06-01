import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../models/ledger_model.dart';

class LedgerService {
  FirebaseFirestore get _db => FirebaseFirestore.instance;
  static const bool _useSimulation = false;
  
  // Simulated memory storage for ledgers keyed by flatId
  static final Map<String, FlatLedger> _mockLedgers = {};

  Stream<FlatLedger?> streamFlatLedger(String flatId) {
    if (_useSimulation) {
      return Stream.periodic(const Duration(seconds: 1), (_) {
        if (!_mockLedgers.containsKey(flatId)) {
          _mockLedgers[flatId] = FlatLedger(flatId: flatId, outstandingBalance: 0.0);
        }
        return _mockLedgers[flatId];
      });
    }

    try {
      return _db
          .collection('flat_ledgers')
          .doc(flatId)
          .snapshots()
          .map((doc) {
            if (!doc.exists) return FlatLedger(flatId: flatId, outstandingBalance: 0.0);
            return FlatLedger.fromMap(doc.data()!, doc.id);
          });
    } catch (e) {
      debugPrint('Firestore streamFlatLedger error: $e');
      return Stream.value(FlatLedger(flatId: flatId, outstandingBalance: 0.0));
    }
  }

  /// Streams all flat ledgers (for workers/admins)
  Stream<List<FlatLedger>> streamAllLedgers() {
    if (_useSimulation) {
      return Stream.periodic(const Duration(seconds: 1), (_) {
        return _mockLedgers.values.toList();
      });
    }

    try {
      return _db
          .collection('flat_ledgers')
          .snapshots()
          .map((snapshot) {
            return snapshot.docs.map((doc) => FlatLedger.fromMap(doc.data(), doc.id)).toList();
          });
    } catch (e) {
      debugPrint('Firestore streamAllLedgers error: $e');
      return Stream.value([]);
    }
  }

  /// Adds a charge to the flat's ledger
  Future<void> addCharge({
    required String flatId,
    required String category,
    required double amount,
    required String description,
    String? relatedComplaintId,
  }) async {
    final now = DateTime.now().toIso8601String();
    final transaction = LedgerTransaction(
      id: 'txn_${DateTime.now().millisecondsSinceEpoch}',
      type: 'charge',
      category: category,
      amount: amount,
      description: description,
      timestamp: now,
      relatedComplaintId: relatedComplaintId,
    );

    if (_useSimulation) {
      if (!_mockLedgers.containsKey(flatId)) {
        _mockLedgers[flatId] = FlatLedger(flatId: flatId, outstandingBalance: 0.0);
      }
      final current = _mockLedgers[flatId]!;
      _mockLedgers[flatId] = current.copyWith(
        outstandingBalance: current.outstandingBalance + amount,
        transactions: [transaction, ...current.transactions],
      );
      return;
    }

    // Firestore implementation
    try {
      final docRef = _db.collection('flat_ledgers').doc(flatId);
      await _db.runTransaction((tx) async {
        final doc = await tx.get(docRef);
        double currentBalance = 0.0;
        List<Map<String, dynamic>> currentHistory = [];

        if (doc.exists) {
          final data = doc.data()!;
          currentBalance = (data['outstandingBalance'] as num?)?.toDouble() ?? 0.0;
          currentHistory = List<Map<String, dynamic>>.from(data['transactions'] ?? []);
        }

        currentHistory.insert(0, {
          'id': transaction.id,
          ...transaction.toMap()
        });

        tx.set(docRef, {
          'outstandingBalance': currentBalance + amount,
          'transactions': currentHistory,
        }, SetOptions(merge: true));
      });
    } catch (e) {
      debugPrint('Firestore addCharge error: $e');
    }
  }

  /// Records a payment towards the flat's ledger
  Future<void> recordPayment({
    required String flatId,
    required String category,
    required double amount,
    required String description,
  }) async {
    final now = DateTime.now().toIso8601String();
    final transaction = LedgerTransaction(
      id: 'txn_${DateTime.now().millisecondsSinceEpoch}',
      type: 'payment',
      category: category,
      amount: amount, // Keeping amount positive, we subtract it from balance
      description: description,
      timestamp: now,
    );

    if (_useSimulation) {
      if (!_mockLedgers.containsKey(flatId)) {
        return; // Nothing to pay
      }
      final current = _mockLedgers[flatId]!;
      // Ensure balance doesn't go below 0 for this simple mock
      final newBalance = (current.outstandingBalance - amount).clamp(0.0, double.infinity);
      _mockLedgers[flatId] = current.copyWith(
        outstandingBalance: newBalance,
        transactions: [transaction, ...current.transactions],
      );
      return;
    }

    // Firestore implementation
    try {
      final docRef = _db.collection('flat_ledgers').doc(flatId);
      await _db.runTransaction((tx) async {
        final doc = await tx.get(docRef);
        if (!doc.exists) return;

        final data = doc.data()!;
        double currentBalance = (data['outstandingBalance'] as num?)?.toDouble() ?? 0.0;
        List<Map<String, dynamic>> currentHistory = List<Map<String, dynamic>>.from(data['transactions'] ?? []);

        currentHistory.insert(0, {
          'id': transaction.id,
          ...transaction.toMap()
        });

        tx.update(docRef, {
          'outstandingBalance': (currentBalance - amount).clamp(0.0, double.infinity),
          'transactions': currentHistory,
        });
      });
    } catch (e) {
      debugPrint('Firestore recordPayment error: $e');
    }
  }

  /// Mocks checking for overdue bills and "sending" push notifications
  /// In reality, a Cloud Function cron job would do this.
  Future<void> triggerWeeklyRemindersMock() async {
    final now = DateTime.now();
    for (var entry in _mockLedgers.entries) {
      final ledger = entry.value;
      if (ledger.outstandingBalance > 0) {
        // If last reminder was > 7 days ago or null
        bool shouldSend = false;
        if (ledger.lastReminderSentAt == null) {
          shouldSend = true;
        } else {
          final lastSent = DateTime.parse(ledger.lastReminderSentAt!);
          if (now.difference(lastSent).inDays >= 7) {
            shouldSend = true;
          }
        }

        if (shouldSend) {
          debugPrint('>>> PUSH NOTIFICATION (Mock) SENT TO FLAT ${ledger.flatId}: "You have an outstanding balance of ₹${ledger.outstandingBalance.toStringAsFixed(0)}! Please clear your dues."');
          _mockLedgers[entry.key] = ledger.copyWith(lastReminderSentAt: now.toIso8601String());
        }
      }
    }
  }
}
