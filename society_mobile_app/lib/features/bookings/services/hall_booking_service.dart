import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/hall_booking_model.dart';

class HallBookingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'hall_bookings';

  Stream<List<HallBooking>> getUserBookings(String flatId) {
    return _firestore
        .collection(_collection)
        .where('flatId', isEqualTo: flatId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs
          .map((doc) => HallBooking.fromMap(doc.data(), doc.id))
          .toList();
    });
  }

  Future<void> createBooking(HallBooking booking) async {
    await _firestore.collection(_collection).add(booking.toMap());
  }

  Future<void> updateBooking(HallBooking booking) async {
    await _firestore.collection(_collection).doc(booking.id).update(booking.toMap());
  }

  Future<bool> isSlotAvailable(String startDateStr, String endDateStr, String timeSlot) async {
    final snapshot = await _firestore
        .collection(_collection)
        .where('status', isEqualTo: 'approved')
        .get();

    for (var doc in snapshot.docs) {
      final data = doc.data();
      final existingStartStr = data['date'] as String;
      final existingEndStr = (data['endDate'] ?? data['date']) as String;
      final existingSlot = data['timeSlot'] as String;

      // Lexicographical overlap check: (S1 <= E2) && (E1 >= S2)
      final bool datesOverlap = startDateStr.compareTo(existingEndStr) <= 0 && 
                                 endDateStr.compareTo(existingStartStr) >= 0;

      if (datesOverlap) {
        if (existingSlot == 'Full Day' || timeSlot == 'Full Day' || existingSlot == timeSlot) {
          return false; // Conflicting slot found
        }
      }
    }
    return true;
  }

  Future<void> updateBookingStatus(String bookingId, String status) async {
    await _firestore.collection(_collection).doc(bookingId).update({
      'status': status,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }
}
