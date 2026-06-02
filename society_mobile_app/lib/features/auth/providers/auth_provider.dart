import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb;
import '../services/auth_service.dart';

enum AuthStatus {
  initial,
  authenticating,
  authenticatedResident,
  authenticatedWorker,
  authenticatedGuard,
  unauthenticated,
  error,
}

class AuthState {
  final AuthStatus status;
  final String? userId;
  final String? flatId;
  final String? role;
  final String? phone;
  final String? category;
  final String? errorMessage;

  AuthState({
    required this.status,
    this.userId,
    this.flatId,
    this.role,
    this.phone,
    this.category,
    this.errorMessage,
  });

  factory AuthState.initial() => AuthState(status: AuthStatus.initial);

  AuthState copyWith({
    AuthStatus? status,
    String? userId,
    String? flatId,
    String? role,
    String? phone,
    String? category,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      userId: userId ?? this.userId,
      flatId: flatId ?? this.flatId,
      role: role ?? this.role,
      phone: phone ?? this.phone,
      category: category ?? this.category,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  late final AuthService _authService;
  String? _verificationId;

  @override
  AuthState build() {
    _authService = ref.watch(authServiceProvider);
    
    // Check persisted session asynchronously after initialization
    Future.microtask(() => _checkPersistedSession());
    
    return AuthState.initial();
  }

  void _checkPersistedSession() async {
    final uid = _authService.currentUid;
    if (uid == null) {
      state = AuthState(status: AuthStatus.unauthenticated);
      return;
    }

    try {
      final profile = await _authService.getUserProfile(uid);
      if (profile != null) {
        _setAuthenticatedState(uid, profile);
      } else {
        state = AuthState(status: AuthStatus.unauthenticated);
      }
    } catch (e) {
      state = AuthState(status: AuthStatus.unauthenticated);
    }
  }

  void _setAuthenticatedState(String uid, Map<String, dynamic> profile) {
    final role = profile['role'] as String?;
    final flatId = profile['flatId'] as String?;
    final category = profile['category'] as String?;
    final phone = profile['phone'] as String?;

    if (role == 'worker') {
      state = AuthState(
        status: AuthStatus.authenticatedWorker,
        userId: uid,
        role: role,
        phone: phone,
        category: category,
      );
    } else if (role == 'guard') {
      state = AuthState(
        status: AuthStatus.authenticatedGuard,
        userId: uid,
        role: role,
        phone: phone,
      );
    } else {
      state = AuthState(
        status: AuthStatus.authenticatedResident,
        userId: uid,
        role: role,
        phone: phone,
        flatId: flatId ?? 'Unknown',
      );
    }
  }

  /// Step 1: Resident Invite Code Check
  Future<bool> verifyInvite(String flatNumber, String inviteCode) async {
    state = state.copyWith(status: AuthStatus.authenticating);
    final isValid = await _authService.verifyInviteCode(flatNumber, inviteCode);
    if (!isValid) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        errorMessage: 'Invalid Flat Number or Invite Code',
      );
      return false;
    }
    state = state.copyWith(status: AuthStatus.unauthenticated, flatId: flatNumber);
    return true;
  }

  /// Step 2: Request OTP for Login
  Future<void> sendOtp(String phone) async {
    state = state.copyWith(status: AuthStatus.authenticating, phone: phone);
    await _authService.signInWithPhone(
      phoneNumber: phone,
      onCodeSent: (verificationId) {
        _verificationId = verificationId;
        state = state.copyWith(status: AuthStatus.unauthenticated);
      },
      onFailed: (e) {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: e.message ?? 'Phone verification failed',
        );
      },
    );
  }

  /// Step 3: Verify OTP and log in
  Future<void> verifyOtpCode(String smsCode) async {
    if (_verificationId == null) {
      state = state.copyWith(status: AuthStatus.error, errorMessage: 'Verification session expired');
      return;
    }

    state = state.copyWith(status: AuthStatus.authenticating);
    try {
      final userCred = await _authService.verifyOtp(_verificationId!, smsCode);
      
      // Simulate or read from Firestore profile
      final uid = userCred?.user?.uid ?? 'mock_uid_${state.phone?.replaceAll(' ', '')}';
      final profile = await _authService.getUserProfile(uid, simulatedPhone: state.phone, simulatedFlatId: state.flatId);
      
      if (profile != null) {
        _setAuthenticatedState(uid, profile);
      } else {
        // Create a default profile if missing (Resident default)
        final defaultProfile = {
          'role': 'resident',
          'flatId': state.flatId ?? '1302',
          'phone': state.phone,
        };
        _setAuthenticatedState(uid, defaultProfile);
      }
    } on fb.FirebaseAuthException catch (e) {
      state = state.copyWith(status: AuthStatus.error, errorMessage: e.message);
    } catch (e) {
      state = state.copyWith(status: AuthStatus.error, errorMessage: e.toString());
    }
  }

  /// Sign out
  Future<void> logout() async {
    state = state.copyWith(status: AuthStatus.authenticating);
    await _authService.signOut();
    state = AuthState(status: AuthStatus.unauthenticated);
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}

// Service provider
final authServiceProvider = Provider<AuthService>((ref) => AuthService());

// Auth state provider using new NotifierProvider
final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
