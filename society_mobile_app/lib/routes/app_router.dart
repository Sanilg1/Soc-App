import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/common/screens/splash_screen.dart';
import '../features/auth/screens/invite_code_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/otp_screen.dart';
import '../features/resident/screens/resident_home_screen.dart';
import '../features/worker/screens/worker_home_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/auth/providers/auth_provider.dart';
import '../features/resident/screens/complaint_create_screen.dart';
import '../features/resident/screens/complaint_details_screen.dart';
import '../features/resident/screens/complaint_edit_screen.dart';
import '../features/resident/screens/notices_screen.dart';
import '../features/resident/screens/history_screen.dart';
import '../features/worker/screens/worker_complaint_details_screen.dart';
import '../features/worker/screens/visit_update_screen.dart';
import '../features/worker/screens/need_tools_screen.dart';
import '../features/worker/screens/completion_screen.dart';
import '../features/worker/screens/leave_request_screen.dart';
import '../features/worker/screens/leave_history_screen.dart';
import '../features/worker/screens/pause_request_screen.dart';
import '../features/worker/screens/worker_history_screen.dart';
import '../features/worker/screens/worker_notifications_screen.dart';
import '../features/resident/screens/resident_notifications_screen.dart';
import '../features/resident/screens/complaint_submitted_screen.dart';
import '../features/resident/screens/society_issue_create_screen.dart';
import '../features/billing/screens/resident_bills_screen.dart';
import '../features/billing/screens/worker_dues_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final status = authState.status;
      final currentLoc = state.uri.path;
      final isAuthFlow = currentLoc == '/invite' || 
                         currentLoc == '/login' || 
                         currentLoc == '/otp-setup' || 
                         currentLoc == '/otp-verify';

      if (status == AuthStatus.initial) {
        return '/';
      }

      if (status == AuthStatus.unauthenticated || status == AuthStatus.error) {
        if (!isAuthFlow) {
          return '/invite';
        }
        return null;
      }

      if (status == AuthStatus.authenticatedResident) {
        if (isAuthFlow || currentLoc == '/') {
          return '/resident-home';
        }
        return null;
      }

      if (status == AuthStatus.authenticatedWorker) {
        if (isAuthFlow || currentLoc == '/') {
          return '/worker-home';
        }
        return null;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/invite',
        builder: (context, state) => const InviteCodeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/otp-setup',
        builder: (context, state) => const OtpScreen(
          phone: '',
          isInviteFlow: true,
        ),
      ),
      GoRoute(
        path: '/otp-verify',
        builder: (context, state) {
          final phone = state.uri.queryParameters['phone'] ?? '';
          final isInvite = state.uri.queryParameters['invite'] == 'true';
          return OtpScreen(
            phone: phone,
            isInviteFlow: isInvite,
          );
        },
      ),
      GoRoute(
        path: '/resident-home',
        builder: (context, state) => const ResidentHomeScreen(),
      ),
      GoRoute(
        path: '/worker-home',
        builder: (context, state) => const WorkerHomeScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/complaint-create',
        builder: (context, state) => const ComplaintCreateScreen(),
      ),
      GoRoute(
        path: '/complaint-details/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return ComplaintDetailsScreen(complaintId: id);
        },
      ),
      GoRoute(
        path: '/edit-complaint/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return ComplaintEditScreen(complaintId: id);
        },
      ),
      GoRoute(
        path: '/notices',
        builder: (context, state) => const NoticesScreen(),
      ),
      GoRoute(
        path: '/history',
        builder: (context, state) => const HistoryScreen(),
      ),
      GoRoute(
        path: '/resident-bills',
        builder: (context, state) => const ResidentBillsScreen(),
      ),
      GoRoute(
        path: '/worker-dues',
        builder: (context, state) => const WorkerDuesScreen(),
      ),
      GoRoute(
        path: '/worker-complaint/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return WorkerComplaintDetailsScreen(complaintId: id);
        },
      ),
      GoRoute(
        path: '/worker-visit-update/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return VisitUpdateScreen(complaintId: id);
        },
      ),
      GoRoute(
        path: '/worker-need-tools/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return NeedToolsScreen(complaintId: id);
        },
      ),
      GoRoute(
        path: '/worker-complete/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return CompletionScreen(complaintId: id);
        },
      ),
      GoRoute(
        path: '/worker-leave-request',
        builder: (context, state) => const LeaveRequestScreen(),
      ),
      GoRoute(
        path: '/worker-leave-history',
        builder: (context, state) => const LeaveHistoryScreen(),
      ),
      GoRoute(
        path: '/worker-pause-request',
        builder: (context, state) => const PauseRequestScreen(),
      ),
      GoRoute(
        path: '/worker-history',
        builder: (context, state) => const WorkerHistoryScreen(),
      ),
      GoRoute(
        path: '/worker-notifications',
        builder: (context, state) => const WorkerNotificationsScreen(),
      ),
      GoRoute(
        path: '/resident-notifications',
        builder: (context, state) => const ResidentNotificationsScreen(),
      ),
      GoRoute(
        path: '/society-issue-create',
        builder: (context, state) => const SocietyIssueCreateScreen(),
      ),
      GoRoute(
        path: '/complaint-submitted',
        builder: (context, state) {
          final category = state.uri.queryParameters['category'] ?? '';
          final urgency = state.uri.queryParameters['urgency'] ?? '';
          final complaintId = state.uri.queryParameters['id'] ?? '';
          return ComplaintSubmittedScreen(
            category: category,
            urgency: urgency,
            complaintId: complaintId,
          );
        },
      ),
    ],
  );

  ref.listen(authProvider, (previous, next) {
    router.refresh();
  });

  return router;
});

