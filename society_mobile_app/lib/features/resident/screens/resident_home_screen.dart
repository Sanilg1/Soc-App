import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../../complaints/providers/complaints_provider.dart';
import '../../notices/providers/notice_provider.dart';
import '../../notices/models/notice_model.dart';

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
        return Colors.grey;
    }
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

    return Scaffold(
      appBar: AppBar(
        title: Text('Flat $flatId Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push('/resident-notifications'),
          ),
          IconButton(
            icon: const Icon(Icons.person_outline_rounded),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: SingleChildScrollView(
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
                  const Text(
                    'Welcome, Resident!',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Sanil Grover • Flat $flatId',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 14),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: theme.colorScheme.primary,
                      minimumSize: const Size(180, 44),
                    ),
                    onPressed: () => context.push('/complaint-create'),
                    icon: const Icon(Icons.add_circle_outline),
                    label: const Text('New Complaint'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange.shade100, foregroundColor: Colors.orange.shade900),
                icon: const Icon(Icons.receipt_long),
                label: const Text('My Ironing Bills'),
                onPressed: () => context.push('/resident-bills'),
              ),
            ),
            const SizedBox(height: 28),
            
            // Section: Active Complaints
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Active Complaints', style: theme.textTheme.titleLarge),
                TextButton(
                  onPressed: () => context.push('/history'),
                  child: const Text('View History'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            
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
                            const SizedBox(height: 12),
                            const Text(
                              'No complaints made',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Any issues? Tap "New Complaint" to log an issue.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey),
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
                          style: const TextStyle(fontWeight: FontWeight.bold),
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
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error loading complaints: $err')),
            ),
            
            const SizedBox(height: 28),
            
            // Section: Official Notices
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Official Notices', style: theme.textTheme.titleLarge),
                TextButton(
                  onPressed: () => context.push('/notices'),
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            noticesAsync.when(
              data: (notices) {
                if (notices.isEmpty) {
                  return const Text('No recent notices.', style: TextStyle(color: Colors.grey));
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
                        title: Text(notice.title, style: const TextStyle(fontWeight: FontWeight.w600)),
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
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: Text(notice.title),
                              content: SingleChildScrollView(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(color: Colors.blue.shade100, borderRadius: BorderRadius.circular(4)),
                                      child: Text(notice.topic, style: TextStyle(color: Colors.blue.shade800, fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(notice.content),
                                    const SizedBox(height: 16),
                                    Text('From: ${notice.author}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                  ],
                                ),
                              ),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))
                              ],
                            ),
                          );
                        },
                      ),
                    );
                  }).toList(),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Text('Error: $err'),
            ),
          ],
        ),
      ),
    );
  }
}
