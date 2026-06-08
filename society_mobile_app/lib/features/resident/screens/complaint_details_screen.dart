import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../../complaints/models/complaint_model.dart';
import '../../complaints/providers/complaints_provider.dart';
import 'package:go_router/go_router.dart';

class ComplaintDetailsScreen extends ConsumerStatefulWidget {
  final String complaintId;

  const ComplaintDetailsScreen({super.key, required this.complaintId});

  @override
  ConsumerState<ComplaintDetailsScreen> createState() => _ComplaintDetailsScreenState();
}

class _ComplaintDetailsScreenState extends ConsumerState<ComplaintDetailsScreen> {
  final _reopenNoteController = TextEditingController();

  @override
  void dispose() {
    _reopenNoteController.dispose();
    super.dispose();
  }

  void _showReopenDialog(BuildContext context, Complaint complaint) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Reopen Complaint'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Explain what is still unresolved or if the issue has returned:'),
              const SizedBox(height: 12),
              TextField(
                controller: _reopenNoteController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Enter reason (optional)...',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                _reopenNoteController.clear();
                Navigator.of(context).pop();
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.emergencyColor,
                foregroundColor: Colors.white,
                minimumSize: const Size(100, 40),
              ),
              onPressed: () async {
                final note = _reopenNoteController.text.trim();
                Navigator.of(context).pop();
                
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Reopening complaint...')),
                );

                await ref.read(complaintServiceProvider).reopenComplaint(complaint.id, note);
                _reopenNoteController.clear();
              },
              child: const Text('Reopen'),
            ),
          ],
        );
      },
    );
  }

  void _confirmCompleted(Complaint complaint) async {
    await ref.read(complaintServiceProvider).confirmComplaintCompleted(complaint.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Complaint marked as resolved!')),
      );
    }
  }

  void _confirmRevisit(Complaint complaint) async {
    await ref.read(complaintServiceProvider).confirmRevisitSchedule(complaint.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Revisit schedule confirmed!')),
      );
    }
  }

  String _getSlaCountdownText(String deadlineIso) {
    try {
      final deadline = DateTime.parse(deadlineIso);
      final now = DateTime.now();
      final diff = deadline.difference(now);
      
      if (diff.isNegative) {
        final overdueBy = diff.abs();
        if (overdueBy.inHours > 0) {
          return 'Overdue by ${overdueBy.inHours}h ${overdueBy.inMinutes % 60}m';
        }
        return 'Overdue by ${overdueBy.inMinutes}m';
      } else {
        if (diff.inHours > 0) {
          return '${diff.inHours}h ${diff.inMinutes % 60}m remaining';
        }
        return '${diff.inMinutes}m remaining';
      }
    } catch (_) {
      return '';
    }
  }

  String _formatDateTime(String isoString) {
    if (isoString.isEmpty) return '';
    try {
      final dt = DateTime.parse(isoString);
      return DateFormat('MMM dd, yyyy • hh:mm a').format(dt.toLocal());
    } catch (_) {
      return isoString;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'submitted':
      case 'queued':
        return Colors.blue;
      case 'accepted':
        return Colors.indigo;
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
    final flatId = authState.flatId ?? '';

    // Watch flat complaints stream
    final complaintsAsync = ref.watch(complaintsStreamProvider(flatId));

    return complaintsAsync.when(
      data: (complaints) {
        final complaintIndex = complaints.indexWhere((c) => c.id == widget.complaintId);
        if (complaintIndex != -1) {
          final complaint = complaints[complaintIndex];
          // Automatically mark all notifications for this complaint as read
          WidgetsBinding.instance.addPostFrameCallback((_) {
            for (int i = 0; i < complaint.timeline.length; i++) {
              ref.read(authProvider.notifier).markNotificationAsRead('${complaint.id}_$i');
            }
          });
        } else {
          return Scaffold(
            appBar: AppBar(title: const Text('Complaint Details')),
            body: const Center(child: Text('Complaint details not found.')),
          );
        }
        
        final complaint = complaints[complaintIndex];
        final canEdit = complaint.status == 'submitted' || complaint.status == 'queued' || complaint.status == 'reopened';

        return Scaffold(
          appBar: AppBar(
            title: const Text('Complaint Details'),
            actions: [
              if (canEdit)
                IconButton(
                  icon: const Icon(Icons.edit),
                  tooltip: 'Edit Complaint',
                  onPressed: () {
                    // Navigate to edit screen
                    context.push('/edit-complaint/${complaint.id}');
                  },
                ),
            ],
          ),
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status Header Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _getStatusColor(complaint.status).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _getStatusColor(complaint.status), width: 1.5),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Current Status', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(height: 4),
                            Text(
                              complaint.status.replaceAll('_', ' ').toUpperCase(),
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: _getStatusColor(complaint.status),
                              ),
                            ),
                          ],
                        ),
                        if (complaint.reopenCount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.emergencyColor.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'REOPENED x${complaint.reopenCount}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppTheme.emergencyColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Info Card
                  Text('Details', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                complaint.category.toUpperCase(),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              if (complaint.category != 'housekeeping' && complaint.category != 'ironing')
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: (complaint.urgency == 'emergency' ? AppTheme.emergencyColor : Colors.grey).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    complaint.urgency.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: complaint.urgency == 'emergency' ? AppTheme.emergencyColor : Colors.grey[700],
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Divider(),
                          const SizedBox(height: 12),
                          Text(complaint.description, style: theme.textTheme.bodyLarge),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Icon(Icons.access_time, size: 16, color: Colors.grey),
                              const SizedBox(width: 8),
                              Text(
                                'Logged: ${_formatDateTime(complaint.createdAt)}',
                                style: const TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                          if (complaint.slaDeadline != null && complaint.status != 'closed') ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.timer_outlined, size: 16, color: AppTheme.highPriorityColor),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    'SLA Target: ${_formatDateTime(complaint.slaDeadline!)} (${_getSlaCountdownText(complaint.slaDeadline!)})',
                                    style: const TextStyle(fontSize: 12, color: AppTheme.highPriorityColor, fontWeight: FontWeight.w500),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Ironing Details Section
                  if (complaint.category == 'ironing' && complaint.ironingDetails != null) ...[
                    Text('Ironing Details & Payment', style: theme.textTheme.titleLarge),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.orange.shade300),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Bill:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              Text('₹${complaint.ironingDetails!['totalCost']?.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.orange)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if (complaint.ironingDetails!['clothesReturned'] == true)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(4)),
                              child: const Text('Clothes Returned! Bill added to Ledger.', style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                            )
                          else if (complaint.ironingDetails!['countConfirmedByWorker'] == false)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.orange.shade100, borderRadius: BorderRadius.circular(4)),
                              child: const Text('Pending Worker Pickup & Confirmation', style: TextStyle(color: Colors.deepOrange, fontSize: 12, fontWeight: FontWeight.bold)),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.blue.shade100, borderRadius: BorderRadius.circular(4)),
                              child: const Text('Ironing in Progress...', style: TextStyle(color: Colors.blue, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Actions Section (Only visible when awaiting confirmation)
                  if (complaint.status == 'awaiting_confirmation') ...[
                    Text('Resolution Awaiting Confirmation', style: theme.textTheme.titleLarge),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.emergencyColor,
                              foregroundColor: Colors.white,
                            ),
                            onPressed: () => _showReopenDialog(context, complaint),
                            child: const Text('Reopen Issue'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.lowPriorityColor,
                              foregroundColor: Colors.white,
                            ),
                            onPressed: () => _confirmCompleted(complaint),
                            child: const Text('Confirm Done'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Actions Section (Need Tools)
                  if (complaint.status == 'need_tools' && complaint.toolsResponsibility != null) ...[
                    Text('Tools / Parts Needed', style: theme.textTheme.titleLarge),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.orange.shade300),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.handyman, color: Colors.orange),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  complaint.toolsDescription ?? 'Tools requested',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          if (complaint.toolsResponsibility == 'worker')
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.blue.shade100, borderRadius: BorderRadius.circular(4)),
                              child: const Text('Worker is procuring the parts', style: TextStyle(color: Colors.blue, fontSize: 12, fontWeight: FontWeight.bold)),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.red.shade100, borderRadius: BorderRadius.circular(4)),
                              child: const Text('You need to procure these parts', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          
                          if (complaint.toolsResponsibility == 'resident' && !complaint.toolsProcured) ...[
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.orange,
                                  foregroundColor: Colors.white,
                                ),
                                icon: const Icon(Icons.shopping_bag),
                                label: const Text('I Have Procured The Tools'),
                                onPressed: () async {
                                  await ref.read(complaintServiceProvider).markToolsProcured(
                                    complaint.id,
                                    authState.flatId ?? 'Resident',
                                    'resident',
                                    complaint.flatId,
                                    complaint.category,
                                  );
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Worker notified! They will schedule a revisit soon.')),
                                    );
                                  }
                                },
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Actions Section (Revisit Scheduled)
                  if (complaint.status == 'revisit_scheduled') ...[
                    Text('Revisit Scheduled', style: theme.textTheme.titleLarge),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accentColor,
                          foregroundColor: Colors.white,
                        ),
                        onPressed: () => _confirmRevisit(complaint),
                        child: const Text('Confirm Visit Time'),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Assigned Worker Profile Card
                  if (complaint.assignedWorker != null || complaint.status == 'accepted' || complaint.status == 'visited' || complaint.status == 'need_tools' || complaint.status == 'revisit_scheduled' || complaint.eta != null) ...[
                    Text('Assigned Worker', style: theme.textTheme.titleLarge),
                    const SizedBox(height: 12),
                    Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 30,
                              backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.1),
                              child: const Icon(Icons.person, size: 30, color: AppTheme.primaryColor),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    complaint.assignedWorker ?? 'Worker Assigned',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    complaint.category.toUpperCase(),
                                    style: TextStyle(color: Colors.grey[600], fontSize: 13),
                                  ),
                                  if (complaint.eta != null && (complaint.status == 'accepted' || complaint.status == 'queued' || complaint.status == 'submitted')) ...[
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade50,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(Icons.timer, size: 14, color: Colors.blue),
                                          const SizedBox(width: 4),
                                          Text(
                                            'ETA: ${complaint.eta}',
                                            style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 12),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            IconButton(
                              onPressed: () {
                                final number = complaint.assignedWorker ?? 'Unknown';
                                Clipboard.setData(ClipboardData(text: number));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Copied $number to clipboard')),
                                );
                              },
                              icon: const Icon(Icons.call),
                              color: Colors.green,
                              style: IconButton.styleFrom(
                                backgroundColor: Colors.green.shade50,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Timeline Step Stepper
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: List.generate(complaint.timeline.length, (index) {
                          final event = complaint.timeline[index];
                          final isLast = index == complaint.timeline.length - 1;
                          
                          return IntrinsicHeight(
                            child: Row(
                              children: [
                                Column(
                                  children: [
                                    Container(
                                      width: 16,
                                      height: 16,
                                      decoration: BoxDecoration(
                                        color: isLast ? _getStatusColor(complaint.status) : Colors.grey[400],
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    if (!isLast)
                                      Expanded(
                                        child: Container(
                                          width: 2,
                                          color: Colors.grey[300],
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.only(bottom: 16.0),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          event.action,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'By ${event.performedBy} (${event.role.toUpperCase()}) • ${_formatDateTime(event.timestamp)}',
                                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                                        ),
                                        if (event.note != null && event.note!.isNotEmpty) ...[
                                          const SizedBox(height: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                            decoration: BoxDecoration(
                                              color: theme.colorScheme.surfaceContainerHighest,
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              'Note: ${event.note}',
                                              style: TextStyle(fontSize: 12, color: theme.textTheme.bodyMedium?.color, fontStyle: FontStyle.italic),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
          ),
        );
      },
      loading: () => Scaffold(appBar: AppBar(title: const Text('Complaint Details')), body: const Center(child: CircularProgressIndicator())),
      error: (err, stack) => Scaffold(appBar: AppBar(title: const Text('Complaint Details')), body: Center(child: Text('Error: $err'))),
    );
  }
}
