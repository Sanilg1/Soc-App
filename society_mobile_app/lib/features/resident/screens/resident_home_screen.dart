import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../../complaints/providers/complaints_provider.dart';
import '../../notices/providers/notice_provider.dart';
import '../../notices/models/notice_model.dart';
import '../../../core/providers/network_provider.dart';
import '../../visitors/providers/visitor_provider.dart';
import '../../../core/services/messaging_service.dart';

class ResidentHomeScreen extends ConsumerStatefulWidget {
  const ResidentHomeScreen({super.key});

  @override
  ConsumerState<ResidentHomeScreen> createState() => _ResidentHomeScreenState();
}

class _ResidentHomeScreenState extends ConsumerState<ResidentHomeScreen> {
  int _previousNoticeCount = 0;

  Color _getStatusColor(String status) {
    switch (status) {
      case 'submitted':
      case 'queued':
        return Colors.blue;
      case 'visited':
      case 'revisit_scheduled':
        return Colors.purple;
      case 'need_tools':
        return AppTheme.highPriorityColor;
      case 'awaiting_confirmation':
        return Colors.teal;
      case 'closed':
        return AppTheme.lowPriorityColor;
      case 'reopened':
      case 'escalated':
        return AppTheme.emergencyColor;
      default:
        return Theme.of(context).colorScheme.onSurfaceVariant;
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = ref.read(authProvider);
      if (authState.userId != null) {
        ref.read(messagingServiceProvider).init(authState.userId!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);
    final flatId = authState.flatId ?? 'Unknown';

    // Watch complaints stream
    final complaintsAsync = ref.watch(complaintsStreamProvider(flatId));
    
    // Watch notices stream
    final noticesAsync = ref.watch(noticesStreamProvider);

    // Watch visitors stream
    final visitorsAsync = ref.watch(visitorStreamProvider(flatId));

    // Watch network status
    final networkStatus = ref.watch(networkProvider);

    // Push notification mock listener
    ref.listen<AsyncValue<List<Notice>>>(noticesStreamProvider, (previous, next) {
      if (next.hasValue && next.value != null) {
        final currentNotices = next.value!;
        if (_previousNoticeCount > 0 && currentNotices.length > _previousNoticeCount) {
          // A new notice was added!
          final newNotice = currentNotices.first;
          WidgetsBinding.instance.addPostFrameCallback((_) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('New notice from admin on topic: ${newNotice.topic} - ${newNotice.title}'),
                behavior: SnackBarBehavior.floating,
                backgroundColor: Colors.blue.shade800,
                duration: const Duration(seconds: 5),
              ),
            );
          });
        }
        _previousNoticeCount = currentNotices.length;
      }
    });

    // Calculate unread notifications count from complaints timeline
    int unreadNotificationsCount = 0;
    complaintsAsync.whenData((complaintsList) {
      for (final complaint in complaintsList) {
        for (int i = 0; i < complaint.timeline.length; i++) {
          final notifId = '${complaint.id}_$i';
          if (!authState.readNotifications.contains(notifId)) {
            unreadNotificationsCount++;
          }
        }
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: Text('Flat $flatId Dashboard'),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.notifications_outlined),
                onPressed: () => context.push('/resident-notifications'),
              ),
              if (unreadNotificationsCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 16,
                      minHeight: 16,
                    ),
                    child: Text(
                      '$unreadNotificationsCount',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          if (networkStatus == NetworkStatus.offline)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              color: Colors.red.shade600,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.wifi_off, color: Colors.white, size: 16),
                  SizedBox(width: 8),
                  Text(
                    'You are offline. Operating from cache.',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(complaintsStreamProvider(flatId));
                ref.invalidate(noticesStreamProvider);
                ref.invalidate(visitorStreamProvider(flatId));
                await Future.delayed(const Duration(milliseconds: 600));
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  // Welcome Header Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [theme.colorScheme.primary, theme.colorScheme.primary.withValues(alpha: 0.8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome, Resident!',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Sanil Grover • Flat $flatId',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 14),
                  ),
                  SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: theme.colorScheme.primary,
                      minimumSize: const Size(180, 44),
                    ),
                    onPressed: () => context.push('/complaint-create'),
                    icon: Icon(Icons.add_circle_outline),
                    label: Text('New Complaint'),
                  ),
                    SizedBox(height: 8),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        minimumSize: const Size(180, 44),
                      ),
                      onPressed: () => context.push('/society-issue-create'),
                      icon: Icon(Icons.campaign_outlined),
                      label: Text('Report Society Issue'),
                    ),
                    SizedBox(height: 8),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        foregroundColor: Colors.white,
                        elevation: 0,
                        minimumSize: const Size(180, 44),
                      ),
                      onPressed: () => context.push('/hall-bookings'),
                      icon: Icon(Icons.event_available),
                      label: Text('Book Community Hall'),
                    ),
                  ],
              ),
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.orange.shade100, foregroundColor: Colors.orange.shade900),
                    icon: Icon(Icons.receipt_long),
                    label: Text('Ironing Bills'),
                    onPressed: () => context.push('/resident-bills'),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green.shade100, foregroundColor: Colors.green.shade900),
                    icon: Icon(Icons.contact_phone),
                    label: Text('Worker Contacts'),
                    onPressed: () => context.push('/worker-directory'),
                  ),
                ),
              ],
            ),
            SizedBox(height: 28),

            // Section: Gate Visitors
            visitorsAsync.when(
              data: (visitors) {
                final pendingVisitors = visitors.where((v) => v.status == 'pending').toList();
                if (pendingVisitors.isEmpty) return const SizedBox.shrink();

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Visitors at Gate', style: theme.textTheme.titleLarge?.copyWith(color: Colors.red.shade700)),
                    SizedBox(height: 12),
                    ...pendingVisitors.map((visitor) => Card(
                          color: Colors.red.shade50,
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(visitor.name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)),
                                      child: Text('PENDING', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                                SizedBox(height: 4),
                                Text('${visitor.company} • ${visitor.purpose}'),
                                SizedBox(height: 16),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red)),
                                        onPressed: () => ref.read(visitorServiceProvider).updateVisitorStatus(visitor.id, 'denied'),
                                        child: Text('Deny'),
                                      ),
                                    ),
                                    SizedBox(width: 12),
                                    Expanded(
                                      child: ElevatedButton(
                                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                                        onPressed: () => ref.read(visitorServiceProvider).updateVisitorStatus(visitor.id, 'approved'),
                                        child: Text('Approve'),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        )),
                    SizedBox(height: 24),
                  ],
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (e, st) => const SizedBox.shrink(),
            ),
            
            // Section: Active Complaints
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Active Complaints', style: theme.textTheme.titleLarge),
                TextButton(
                  onPressed: () => context.push('/history'),
                  child: Text('View History'),
                ),
              ],
            ),
            SizedBox(height: 12),
            
            complaintsAsync.when(
              data: (complaints) {
                // Filter active complaints (status is not 'closed')
                final activeComplaints = complaints.where((c) => c.status != 'closed').toList();

                if (activeComplaints.isEmpty) {
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 36.0, horizontal: 16.0),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(
                              Icons.assignment_turned_in_outlined, 
                              size: 48, 
                              color: theme.colorScheme.primary.withValues(alpha: 0.5)
                            ),
                            SizedBox(height: 12),
                            Text(
                              'No complaints made',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Any issues? Tap "New Complaint" to log an issue.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: activeComplaints.length,
                  itemBuilder: (context, index) {
                    final complaint = activeComplaints[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        onTap: () => context.push('/complaint-details/${complaint.id}'),
                        title: Text(
                          complaint.category.toUpperCase(),
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          complaint.description,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getStatusColor(complaint.status).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            complaint.status.replaceAll('_', ' ').toUpperCase(),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: _getStatusColor(complaint.status),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error loading complaints: $err')),
            ),
            
            SizedBox(height: 28),
            
            // Section: Official Notices
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Official Notices', style: theme.textTheme.titleLarge),
                TextButton(
                  onPressed: () => context.push('/notices'),
                  child: Text('View All'),
                ),
              ],
            ),
            SizedBox(height: 12),
            noticesAsync.when(
              data: (notices) {
                if (notices.isEmpty) {
                  return Text('No recent notices.', style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant));
                }
                return Column(
                  children: notices.take(3).map((notice) {
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.shade50,
                          child: Icon(Icons.campaign, color: Colors.blue.shade700),
                        ),
                        title: Text(notice.title, style: TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(
                          notice.content, 
                          maxLines: 2, 
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Text(
                          notice.topic,
                          style: TextStyle(fontSize: 12, color: Colors.blue.shade700, fontWeight: FontWeight.bold),
                        ),
                        isThreeLine: true,
                        onTap: () {
                          context.push('/notice-details/${notice.id}');
                        },
                      ),
                    );
                  }).toList(),
                );
              },
              loading: () => Center(child: CircularProgressIndicator()),
              error: (err, stack) => Text('Error: $err'),
            ),
          ],
        ),
      ),
      ),
      ),
        ],
      ),
    );
  }
}
