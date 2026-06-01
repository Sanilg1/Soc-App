class LedgerTransaction {
  final String id;
  final String type; // 'charge' or 'payment'
  final String category; // 'ironing', 'maintenance', etc.
  final double amount;
  final String description;
  final String timestamp;
  final String? relatedComplaintId; // Link to the specific ironing task

  LedgerTransaction({
    required this.id,
    required this.type,
    required this.category,
    required this.amount,
    required this.description,
    required this.timestamp,
    this.relatedComplaintId,
  });

  factory LedgerTransaction.fromMap(Map<String, dynamic> map, String docId) {
    return LedgerTransaction(
      id: docId,
      type: map['type'] as String? ?? 'charge',
      category: map['category'] as String? ?? 'ironing',
      amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
      description: map['description'] as String? ?? '',
      timestamp: map['timestamp'] as String? ?? '',
      relatedComplaintId: map['relatedComplaintId'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type,
      'category': category,
      'amount': amount,
      'description': description,
      'timestamp': timestamp,
      if (relatedComplaintId != null) 'relatedComplaintId': relatedComplaintId,
    };
  }
}

class FlatLedger {
  final String flatId;
  final double outstandingBalance;
  final String? lastReminderSentAt;
  final List<LedgerTransaction> transactions;

  FlatLedger({
    required this.flatId,
    required this.outstandingBalance,
    this.lastReminderSentAt,
    this.transactions = const [],
  });

  factory FlatLedger.fromMap(Map<String, dynamic> map, String docId) {
    return FlatLedger(
      flatId: docId,
      outstandingBalance: (map['outstandingBalance'] as num?)?.toDouble() ?? 0.0,
      lastReminderSentAt: map['lastReminderSentAt'] as String?,
      transactions: (map['transactions'] as List? ?? [])
          .map((e) => LedgerTransaction.fromMap(Map<String, dynamic>.from(e), e['id'] ?? ''))
          .toList(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'outstandingBalance': outstandingBalance,
      if (lastReminderSentAt != null) 'lastReminderSentAt': lastReminderSentAt,
      'transactions': transactions.map((t) => {
        'id': t.id,
        ...t.toMap()
      }).toList(),
    };
  }

  FlatLedger copyWith({
    String? flatId,
    double? outstandingBalance,
    String? lastReminderSentAt,
    List<LedgerTransaction>? transactions,
  }) {
    return FlatLedger(
      flatId: flatId ?? this.flatId,
      outstandingBalance: outstandingBalance ?? this.outstandingBalance,
      lastReminderSentAt: lastReminderSentAt ?? this.lastReminderSentAt,
      transactions: transactions ?? this.transactions,
    );
  }
}
