import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/visitor_model.dart';

final visitorStreamProvider = StreamProvider.family<List<Visitor>, String?>((ref, flatId) {
  if (flatId == null || flatId.isEmpty) return const Stream.empty();
  
  return FirebaseFirestore.instance
      .collection('visitors')
      .where('flatId', isEqualTo: flatId)
      .orderBy('timestamp', descending: true)
      .snapshots()
      .map((snapshot) {
    return snapshot.docs.map((doc) => Visitor.fromMap(doc.data(), doc.id)).toList();
  });
});

final allVisitorStreamProvider = StreamProvider<List<Visitor>>((ref) {
  // Guard sees all visitors to manage today
  // In a real app we'd filter by today's date
  return FirebaseFirestore.instance
      .collection('visitors')
      .orderBy('timestamp', descending: true)
      .limit(50)
      .snapshots()
      .map((snapshot) {
    return snapshot.docs.map((doc) => Visitor.fromMap(doc.data(), doc.id)).toList();
  });
});

class VisitorService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<void> addVisitor(Visitor visitor) async {
    await _db.collection('visitors').add(visitor.toMap());
  }

  Future<void> updateVisitorStatus(String visitorId, String newStatus) async {
    await _db.collection('visitors').doc(visitorId).update({
      'status': newStatus,
    });
  }
}

final visitorServiceProvider = Provider((ref) => VisitorService());
