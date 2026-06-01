import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../../complaints/models/complaint_model.dart';
import '../providers/worker_provider.dart';

enum TaskFilter { all, critical, pending, revisits, scheduled }

class WorkerHomeScreen extends ConsumerStatefulWidget {
  const WorkerHomeScreen({super.key});

  @override
  ConsumerState<WorkerHomeScreen> createState() => _WorkerHomeScreenState();
}

class _WorkerHomeScreenState extends ConsumerState<WorkerHomeScreen> {
  TaskFilter _currentFilter = TaskFilter.all;

  Color _getUrgencyColor(String urgency) {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return AppTheme.emergencyColor;
      case 'high':
        return AppTheme.highPriorityColor;
      case 'medium':
        return AppTheme.mediumPriorityColor;
      default:
        return AppTheme.lowPriorityColor;
    }
  }

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
    final category = authState.category ?? 'electrical';
    final workerPhone = authState.phone ?? 'Worker';

    // Watch complaints for this worker's category
    final complaintsAsync = ref.watch(workerComplaintsStreamProvider(category));

    // Watch pauses to show if the worker is currently paused
    final pausesAsync = ref.watch(workerPausesStreamProvider(authState.userId ?? ''));
    final isPaused = pausesAsync.maybeWhen(
      data: (pauses) => pauses.any((p) => p.status == 'approved'),
      orElse: () => false,
    );

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: Text(
          'Workboard',
          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push('/worker-notifications'),
          ),
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
        ],
      ),
      endDrawer: _buildDrawer(context, category, workerPhone),
      body: complaintsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (complaints) {
          // Categorize data
          final critical = complaints.where((c) =>
              (c.urgency == 'emergency' || c.urgency == 'high') &&
              (c.status == 'submitted' || c.status == 'queued' || c.status == 'reopened')).toList();

          final pending = complaints.where((c) =>
              (c.urgency == 'medium' || c.urgency == 'low') &&
              (c.status == 'submitted' || c.status == 'queued')).toList();

          final revisits = complaints.where((c) =>
              c.status == 'reopened' || c.status == 'need_tools').toList();

          final scheduled = complaints.where((c) =>
              c.status == 'revisit_scheduled' || c.availability.type == 'custom').toList();

          // Apply current filter
          List<Complaint> filteredComplaints;
          switch (_currentFilter) {
            case TaskFilter.critical:
              filteredComplaints = critical;
              break;
            case TaskFilter.pending:
              filteredComplaints = pending;
              break;
            case TaskFilter.revisits:
              filteredComplaints = revisits;
              break;
            case TaskFilter.scheduled:
              filteredComplaints = scheduled;
              break;
            case TaskFilter.all:
            default:
              filteredComplaints = complaints.where((c) => c.status != 'closed').toList();
              // Sort overall list: Critical first, then pending
              filteredComplaints.sort((a, b) {
                final aUrgency = _getUrgencyScore(a.urgency);
                final bUrgency = _getUrgencyScore(b.urgency);
                return bUrgency.compareTo(aUrgency);
              });
              break;
          }

          return SafeArea(
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeaderProfile(theme, category, isPaused),
                        const SizedBox(height: 24),
                        Text('Quick Stats', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        _buildStatsGrid(theme, critical.length, pending.length, scheduled.length, revisits.length),
                        const SizedBox(height: 16),
                        if (category == 'ironing')
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade50, foregroundColor: Colors.red.shade900),
                              icon: const Icon(Icons.currency_rupee),
                              label: const Text('Resident Dues (Ledger)'),
                              onPressed: () => context.push('/worker-dues'),
                            ),
                          ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _getFilterTitle(),
                              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            if (_currentFilter != TaskFilter.all)
                              TextButton(
                                onPressed: () => setState(() => _currentFilter = TaskFilter.all),
                                child: const Text('View All'),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                      ],
                    ),
                  ),
                ),
                filteredComplaints.isEmpty
                    ? SliverFillRemaining(
                        hasScrollBody: false,
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle_outline, size: 64, color: Colors.grey.shade400),
                              const SizedBox(height: 16),
                              Text('No ${_getFilterTitle().toLowerCase()} found.', style: const TextStyle(color: Colors.grey)),
                            ],
                          ),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 20.0),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              return _buildPremiumTaskCard(context, filteredComplaints[index]);
                            },
                            childCount: filteredComplaints.length,
                          ),
                        ),
                      ),
                const SliverToBoxAdapter(child: SizedBox(height: 40)), // Bottom padding
              ],
            ),
          );
        },
      ),
    );
  }

  int _getUrgencyScore(String urgency) {
    switch (urgency.toLowerCase()) {
      case 'emergency': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      default: return 1;
    }
  }

  String _getFilterTitle() {
    switch (_currentFilter) {
      case TaskFilter.critical: return 'Critical Tasks';
      case TaskFilter.pending: return 'Pending Tasks';
      case TaskFilter.revisits: return 'Revisits Needed';
      case TaskFilter.scheduled: return 'Scheduled Visits';
      case TaskFilter.all: return 'All Active Tasks';
    }
  }

  Widget _buildHeaderProfile(ThemeData theme, String category, bool isPaused) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [theme.colorScheme.primary, theme.colorScheme.primary.withValues(alpha: 0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.primary.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.white.withValues(alpha: 0.2),
            child: Icon(
              category == 'electrical' 
                  ? Icons.electrical_services 
                  : category == 'plumbing' 
                      ? Icons.plumbing 
                      : category == 'ironing' 
                          ? Icons.iron 
                          : Icons.cleaning_services,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Good Morning,',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14),
                ),
                Text(
                  category == 'electrical' 
                      ? 'Electrician Pro' 
                      : category == 'plumbing' 
                          ? 'Plumbing Pro' 
                          : category == 'ironing' 
                              ? 'Ironing Pro' 
                              : 'Housekeeping Pro',
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                if (isPaused)
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.orangeAccent.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.orangeAccent, width: 1),
                    ),
                    child: const Text('WORKBOARD PAUSED', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(ThemeData theme, int critical, int pending, int scheduled, int revisits) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.6,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildStatCard(
          theme, 
          title: 'Critical', 
          count: critical, 
          icon: Icons.warning_amber_rounded, 
          color: AppTheme.emergencyColor,
          filter: TaskFilter.critical,
        ),
        _buildStatCard(
          theme, 
          title: 'Pending', 
          count: pending, 
          icon: Icons.hourglass_empty_rounded, 
          color: Colors.blue,
          filter: TaskFilter.pending,
        ),
        _buildStatCard(
          theme, 
          title: 'Scheduled', 
          count: scheduled, 
          icon: Icons.calendar_month_rounded, 
          color: Colors.teal,
          filter: TaskFilter.scheduled,
        ),
        _buildStatCard(
          theme, 
          title: 'Revisits', 
          count: revisits, 
          icon: Icons.build_circle_outlined, 
          color: Colors.purple,
          filter: TaskFilter.revisits,
        ),
      ],
    );
  }

  Widget _buildStatCard(ThemeData theme, {required String title, required int count, required IconData icon, required Color color, required TaskFilter filter}) {
    final isSelected = _currentFilter == filter;
    
    return InkWell(
      onTap: () => setState(() => _currentFilter = filter),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? color : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? color : Colors.grey.withValues(alpha: 0.2), width: 1.5),
          boxShadow: isSelected ? [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))] : [],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: isSelected ? Colors.white : color, size: 24),
                Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white.withValues(alpha: 0.9) : Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPremiumTaskCard(BuildContext context, Complaint complaint) {
    final theme = Theme.of(context);
    final isEmergency = complaint.urgency == 'emergency';
    final urgencyColor = _getUrgencyColor(complaint.urgency);
    final statusColor = _getStatusColor(complaint.status);
    final formattedDate = DateFormat('MMM dd, hh:mm a').format(DateTime.parse(complaint.createdAt));

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: isEmergency ? urgencyColor.withValues(alpha: 0.5) : Colors.transparent,
          width: 1.5,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () => context.push('/worker-complaint/${complaint.id}'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top strip indicator for urgency
              Container(
                height: 4,
                decoration: BoxDecoration(
                  color: urgencyColor,
                  borderRadius: const BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Flat Info
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primaryContainer.withValues(alpha: 0.5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Flat ${complaint.flatId}',
                            style: TextStyle(
                              color: theme.colorScheme.onPrimaryContainer,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        // Status Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            complaint.status.replaceAll('_', ' ').toUpperCase(),
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      complaint.category.toUpperCase(),
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade500, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      complaint.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Action Footer
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.access_time_rounded, size: 14, color: Colors.grey.shade400),
                            const SizedBox(width: 4),
                            Text(formattedDate, style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
                          ],
                        ),
                        Row(
                          children: [
                            Text(
                              'View Details',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.primary,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(Icons.arrow_forward_rounded, size: 16, color: theme.colorScheme.primary),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, String category, String workerPhone) {
    final theme = Theme.of(context);
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(color: theme.colorScheme.primaryContainer),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                CircleAvatar(
                  backgroundColor: theme.colorScheme.primary,
                  radius: 28,
                  child: Icon(
                    category == 'electrical' 
                        ? Icons.electrical_services 
                        : category == 'plumbing' 
                            ? Icons.plumbing 
                            : category == 'ironing' 
                                ? Icons.iron 
                                : Icons.cleaning_services,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  category == 'electrical' 
                      ? 'Electrician Specialist' 
                      : category == 'plumbing' 
                          ? 'Plumbing Specialist' 
                          : category == 'ironing' 
                              ? 'Ironing Specialist' 
                              : 'Housekeeping Specialist',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(workerPhone, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard_outlined),
            title: const Text('Workboard'),
            onTap: () => context.pop(),
          ),
          ListTile(
            leading: const Icon(Icons.pause_circle_outline),
            title: const Text('Request Pause'),
            onTap: () {
              context.pop();
              context.push('/worker-pause-request');
            },
          ),
          ListTile(
            leading: const Icon(Icons.date_range_outlined),
            title: const Text('Apply for Leave'),
            onTap: () {
              context.pop();
              context.push('/worker-leave-request');
            },
          ),
          ListTile(
            leading: const Icon(Icons.history_toggle_off_outlined),
            title: const Text('Leave History'),
            onTap: () {
              context.pop();
              context.push('/worker-leave-history');
            },
          ),
          ListTile(
            leading: const Icon(Icons.history_outlined),
            title: const Text('Task History'),
            onTap: () {
              context.pop();
              context.push('/worker-history');
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: const Text('My Profile'),
            onTap: () {
              context.pop();
              context.push('/profile');
            },
          ),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Sign Out', style: TextStyle(color: Colors.red)),
            onTap: () async {
              context.pop();
              await ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
    );
  }
}
