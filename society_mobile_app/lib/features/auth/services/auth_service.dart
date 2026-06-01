import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class AuthService {
  FirebaseAuth get _auth => FirebaseAuth.instance;
  FirebaseFirestore get _db => FirebaseFirestore.instance;

  // Mock data for development when Firebase configurations are not fully wired up
  static const bool _useSimulation = false;

  // Helper: check if phone number is a mock testing number
  bool _isMockNumber(String phone) {
    return phone.replaceAll(' ', '').contains('+1555010');
  }

  /// Verifies if the invite code matches the registered flat number in Firestore
  Future<bool> verifyInviteCode(String flatNumber, String inviteCode) async {
    if (_useSimulation && inviteCode == '123456') {
      return true;
    }
    
    try {
      final doc = await _db.collection('flats').doc(flatNumber).get();
      if (!doc.exists) return false;
      
      final data = doc.data();
      if (data == null) return false;
      
      return data['inviteCode'] == inviteCode;
    } catch (e) {
      debugPrint('Error verifying invite code: $e');
      // If Firestore is not initialized or connected, return true for our developer mock codes
      if (inviteCode == '123456') return true;
      return false;
    }
  }

  /// Triggers Firebase Phone Number authentication or simulates it for mock accounts
  Future<void> signInWithPhone({
    required String phoneNumber,
    required Function(String verificationId) onCodeSent,
    required Function(FirebaseAuthException e) onFailed,
  }) async {
    // If it is a simulation/mock number, immediately trigger onCodeSent with a mock ID
    if (_useSimulation || _isMockNumber(phoneNumber)) {
      await Future.delayed(const Duration(seconds: 1));
      onCodeSent('mock_verification_id_${phoneNumber.replaceAll(' ', '')}');
      return;
    }

    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _auth.signInWithCredential(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          onFailed(e);
        },
        codeSent: (String verificationId, int? resendToken) {
          onCodeSent(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {},
      );
    } catch (e) {
      onFailed(FirebaseAuthException(
        code: 'verify-failed',
        message: e.toString(),
      ));
    }
  }

  /// Verifies the OTP SMS Code and signs the user in
  Future<UserCredential?> verifyOtp(String verificationId, String smsCode) async {
    // Simulation / mock check
    if (verificationId.startsWith('mock_verification_id_')) {
      if (smsCode != '123456') {
        throw FirebaseAuthException(
          code: 'invalid-verification-code',
          message: 'The SMS verification code is invalid.',
        );
      }
      // Return a dummy UserCredential wrapper or simulate success
      await Future.delayed(const Duration(milliseconds: 500));
      return null; // Riverpod provider will handle assigning mock state
    }

    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    return await _auth.signInWithCredential(credential);
  }

  Future<Map<String, dynamic>?> getUserProfile(String uid, {String? simulatedPhone, String? simulatedFlatId}) async {
    // Simulation fallback
    if (uid.isEmpty || uid.startsWith('mock_uid_') || simulatedPhone != null) {
      final phone = simulatedPhone ?? '';
      if (phone.contains('0001')) {
        return {'role': 'resident', 'flatId': simulatedFlatId ?? '1302', 'phone': phone};
      } else if (phone.contains('0002')) {
        return {'role': 'worker', 'category': 'electrical', 'phone': phone};
      } else if (phone.contains('0003')) {
        return {'role': 'worker', 'category': 'plumbing', 'phone': phone};
      } else if (phone.contains('0004')) {
        return {'role': 'worker', 'category': 'housekeeping', 'phone': phone};
      } else if (phone.contains('0005')) {
        return {'role': 'worker', 'category': 'ironing', 'phone': phone};
      }
      return {'role': 'resident', 'flatId': simulatedFlatId ?? '1302', 'phone': phone};
    }

    try {
      final doc = await _db.collection('users').doc(uid).get();
      return doc.data();
    } catch (e) {
      debugPrint('Error getting user profile: $e');
      return null;
    }
  }

  /// Signs the user out
  Future<void> signOut() async {
    if (_useSimulation) return;
    try {
      await _auth.signOut();
    } catch (e) {
      debugPrint('Error signing out: $e');
    }
  }

  /// Get current user UID
  String? get currentUid {
    if (_useSimulation) return null;
    try {
      return _auth.currentUser?.uid;
    } catch (e) {
      return null;
    }
  }
}
