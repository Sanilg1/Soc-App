import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../../complaints/providers/complaints_provider.dart';

/// Notification item model for the resident inbox
class ResidentNotification {
  final String id;
  final String type; // complaint_submitted, worker_update, revisit_scheduled, completion_request, resident_unavailable, complaint_reopened, escalation
  final String title;
  final String message;
  final String timestamp;
  final bool read;
  final String? complaintId;

  ResidentNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.timestamp,
    this.read = false,
    this.complaintId,
  });
}

class ResidentNotificationsScreen extends ConsumerWidget {
  const ResidentNotificationsScreen({super.key});

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'complaint_submitted':
        return Icons.assignment_outlined;
      case 'worker_update':
        return Icons.engineering;
      case 'revisit_scheduled':
        return Icons.schedule;
      case 'completion_request':
        return Icons.check_circle_outline;
      case 'resident_unavailable':
        return Icons.person_off_outlined;
      case 'complaint_reopened':
        return Icons.replay;
      case 'escalation':
        return Icons.warning_amber_rounded;
      default:
        return Icons.notifications_outlined;
    }
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'complaint_submitted':
        return Colors.blue;
      case 'worker_update':
        return Colors.purple;
      case 'revisit_scheduled':
        return AppTheme.accentColor;
      case 'completion_request':
        return AppTheme.lowPriorityColor;
      case 'resident_unavailable':
        return AppTheme.highPriorityColor;
      case 'complaint_reopened':
        return AppTheme.emergencyColor;
      case 'escalation':
        return AppTheme.emergencyColor;
      default:
        return Colors.grey;
    }
  }

  String _formatTimestamp(String isoString) {
    try {
      final dt = DateTime.parse(isoString);
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.inMinutes < 60) {
        return '${diff.inMinutes}m ago';
      } else if (diff.inHours < 24) {
        return '${diff.inHours}h ago';
      } else if (diff.inDays < 7) {
        return '${diff.inDays}d ago';
      } else {
        return DateFormat('MMM dd').format(dt.toLocal());
      }
    } catch (_) {
      return isoString;
    }
  }

  /// Generates notifications from complaint timeline events for this flat
  List<ResidentNotification> _buildNotificationsFromComplaints(
    List complaints,
    String flatId,
  ) {
    final notifications = <ResidentNotification>[];

    for (final complaint in complaints) {
      // Generate a notification for each timeline event
      for (int i = 0; i < complaint.timeline.length; i++) {
        final event = complaint.timeline[i];
        String type;
        String title;
        String message;

        // Determine notification type from timeline event
        final action = event.action.toLowerCase();
        if (action.contains('created')) {
          type = 'complaint_submitted';
          title = 'Complaint Submitted';
          message =
              'Your ${complaint.category} complaint has been submitted successfully.';
        } else if (action.contains('visited') ||
            action.contains('inspected')) {
          type = 'worker_update';
          title = 'Worker Visited';
          message =
              '${event.performedBy} has inspected your ${complaint.category} issue.';
        } else if (action.contains('need tools') ||
            action.contains('need_tools')) {
          type = 'worker_update';
          title = 'Parts Required';
          message =
              '${event.performedBy} needs additional tools/parts for your ${complaint.category} complaint.';
        } else if (action.contains('revisit') ||
            action.contains('scheduled')) {
          type = 'revisit_scheduled';
          title = 'Revisit Scheduled';
          message =
              '${event.performedBy} has scheduled a revisit for your ${complaint.category} issue.';
        } else if (action.contains('unavailable')) {
          type = 'resident_unavailable';
          title = 'Resident Unavailable';
          message =
              'Worker visited but you were unavailable. Please update your availability.';
        } else if (action.contains('completed') ||
            action.contains('marked completed')) {
          type = 'completion_request';
          title = 'Resolution Complete';
          message =
              '${event.performedBy} has marked your ${complaint.category} complaint as completed. Please confirm.';
        } else if (action.contains('confirmed')) {
          type = 'completion_request';
          title = 'Issue Resolved';
          message = 'You confirmed the ${complaint.category} issue is resolved.';
        } else if (action.contains('reopened')) {
          type = 'complaint_reopened';
          title = 'Complaint Reopened';
          message = 'Your ${complaint.category} complaint has been reopened.';
        } else if (action.contains('escalat')) {
          type = 'escalation';
          title = 'Complaint Escalated';
          message =
              'Your ${complaint.category} complaint has been escalated to the admin team.';
        } else {
          type = 'worker_update';
          title = 'Update';
          message = event.action;
        }

        notifications.add(ResidentNotification(
          id: '${complaint.id}_${i}',
          type: type,
          title: title,
          message: message,
          timestamp: event.timestamp,
          read: i < complaint.timeline.length - 1, // Only latest is unread
          complaintId: complaint.id,
        ));
      }
    }

    // Sort by timestamp descending (newest first)
    notifications.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return notifications;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);
    final flatId = authState.flatId ?? '';
    final complaintsAsync = ref.watch(complaintsStreamProvider(flatId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'Mark all as read',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('All notifications marked as read')),
              );
            },
          ),
        ],
      ),
      body: complaintsAsync.when(
        data: (complaints) {
          final notifications = _buildNotificationsFromComplaints(complaints, flatId);

          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.notifications_none_rounded,
                    size: 72,
                    color: theme.colorScheme.primary.withValues(alpha: 0.3),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No Notifications Yet',
                    style: theme.textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'You\'ll see updates about your complaints here.',
                    style: theme.textTheme.bodyMedium,
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: notifications.length,
            separatorBuilder: (_, __) => const Divider(height: 1, indent: 72),
            itemBuilder: (context, index) {
              final notif = notifications[index];
              final color = _getNotificationColor(notif.type);

              return ListTile(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getNotificationIcon(notif.type),
                    color: color,
                    size: 22,
                  ),
                ),
                title: Row(
                  children: [
                    Expanded(
                      child: Text(
                        notif.title,
                        style: TextStyle(
                          fontWeight:
                              notif.read ? FontWeight.normal : FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    if (!notif.read)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 2),
                    Text(
                      notif.message,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatTimestamp(notif.timestamp),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey[400],
                      ),
                    ),
                  ],
                ),
                onTap: () {
                  if (notif.complaintId != null) {
                    Navigator.of(context).pushNamed(
                      '/complaint-details/${notif.complaintId}',
                    );
                  }
                },
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
