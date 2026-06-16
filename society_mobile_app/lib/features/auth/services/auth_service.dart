import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class InviteVerificationResult {
  final bool isValid;
  final String? errorMessage;
  InviteVerificationResult({required this.isValid, this.errorMessage});
}

class AuthService {
  FirebaseAuth get _auth => FirebaseAuth.instance;
  FirebaseFirestore get _db => FirebaseFirestore.instance;

  // Mock data for development when Firebase configurations are not fully wired up
  static const bool _useSimulation = false;

  // Helper: check if phone number is a mock testing number
  bool _isMockNumber(String phone) {
    return phone.replaceAll(' ', '').contains('+1555010');
  }

  // Robust phone comparison helper
  bool _comparePhones(String phone1, String phone2) {
    final clean1 = phone1.replaceAll(RegExp(r'\D'), '');
    final clean2 = phone2.replaceAll(RegExp(r'\D'), '');
    if (clean1.length >= 10 && clean2.length >= 10) {
      return clean1.endsWith(clean2) || clean2.endsWith(clean1);
    }
    return clean1 == clean2;
  }

  /// Verifies if the invite code matches the registered flat number in Firestore
  Future<InviteVerificationResult> verifyInviteCode(String flatNumber, String inviteCode, String phone) async {
    if (_useSimulation && inviteCode == '123456') {
      return InviteVerificationResult(isValid: true);
    }
    
    try {
      final doc = await _db.collection('flats').doc(flatNumber).get();
      if (!doc.exists) {
        return InviteVerificationResult(
          isValid: false,
          errorMessage: 'Flat $flatNumber does not exist in the society database.',
        );
      }
      
      final data = doc.data();
      if (data == null) {
        return InviteVerificationResult(isValid: false, errorMessage: 'Flat data is empty.');
      }
      
      if (data['inviteCode'] != inviteCode) {
        return InviteVerificationResult(
          isValid: false,
          errorMessage: 'Incorrect invite code for Flat $flatNumber.',
        );
      }

      final List<dynamic> registeredPhones = data['phoneNumbers'] ?? [];
      final hasMatchingPhone = registeredPhones.any((registeredPhone) => 
        _comparePhones(registeredPhone.toString(), phone)
      );

      if (!hasMatchingPhone) {
        return InviteVerificationResult(
          isValid: false,
          errorMessage: 'Phone number $phone is not registered for Flat $flatNumber by the administrator.',
        );
      }

      return InviteVerificationResult(isValid: true);
    } catch (e) {
      debugPrint('Error verifying invite code: $e');
      return InviteVerificationResult(
        isValid: false,
        errorMessage: 'Unable to verify invite. Please check your connection and try again.',
      );
    }
  }

  /// Registers a new user via Invite Code (using Email/Password under the hood)
  Future<UserCredential> registerWithInvite({
    required String name,
    required String flatNumber,
    required String phone,
    required String inviteCode,
  }) async {
    final email = '${phone.replaceAll(' ', '').replaceAll('+', '')}@society.app';
    
    try {
      // 1. Create account using Phone as Email, and Invite Code as Password
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: inviteCode,
      );

      // 2. Save profile in Firestore
      if (credential.user != null) {
        await _db.collection('users').doc(credential.user!.uid).set({
          'name': name,
          'phone': phone,
          'flatId': flatNumber,
          'role': 'resident',
          'createdAt': FieldValue.serverTimestamp(),
          'status': 'active',
        });
      }

      return credential;
    } on FirebaseAuthException catch (e) {
      if (e.code == 'email-already-in-use') {
        // If they already registered, just log them in instead and update flatId
        final credential = await loginWithPhoneAndCode(phone, inviteCode);
        if (credential.user != null) {
          await _db.collection('users').doc(credential.user!.uid).set({
            'name': name,
            'phone': phone,
            'flatId': flatNumber,
            'role': 'resident',
            'status': 'active',
          }, SetOptions(merge: true));
        }
        return credential;
      }
      throw Exception(e.message ?? 'Registration failed');
    }
  }

  /// Logs in an existing user or worker using their Phone and Passcode/Invite Code
  Future<UserCredential> loginWithPhoneAndCode(String phone, String code) async {
    final email = '${phone.replaceAll(' ', '').replaceAll('+', '')}@society.app';
    
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: code,
      );
    } on FirebaseAuthException catch (e) {
      throw Exception(e.message ?? 'Login failed. Check your phone number and code.');
    }
  }

  Future<Map<String, dynamic>?> getUserProfile(String uid, {String? simulatedPhone, String? simulatedFlatId}) async {
    // Simulation fallback
    if (uid.isEmpty || uid.startsWith('mock_uid_') || simulatedPhone != null) {
      final phone = simulatedPhone ?? '';
      if (phone.endsWith('01')) {
        return {'role': 'resident', 'flatId': simulatedFlatId ?? '1302', 'phone': phone};
      } else if (phone.endsWith('02')) {
        return {'role': 'worker', 'category': 'electrical', 'phone': phone};
      } else if (phone.endsWith('03')) {
        return {'role': 'worker', 'category': 'plumbing', 'phone': phone};
      } else if (phone.endsWith('04')) {
        return {'role': 'worker', 'category': 'housekeeping', 'phone': phone};
      } else if (phone.endsWith('05')) {
        return {'role': 'worker', 'category': 'ironing', 'phone': phone};
      } else if (phone.endsWith('06')) {
        return {'role': 'guard', 'phone': phone};
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
