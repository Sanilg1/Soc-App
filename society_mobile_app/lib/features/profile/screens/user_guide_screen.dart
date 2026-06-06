import 'package:flutter/material.dart';

class UserGuideScreen extends StatelessWidget {
  const UserGuideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Guide'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20.0),
        children: [
          Text(
            'Application User Guide',
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Learn how to get the most out of your Society Portal.',
            style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          _buildGuideCard(
            context,
            theme,
            '1',
            'Raising Complaints',
            Icons.build_circle_outlined,
            'Navigate to the home dashboard and click the plus (+) button in the navigation bar. '
            'Select "Add Complaint", choose a category (e.g. Electrical, Plumbing), urgency level, and add a description. '
            'You can also take a photo to attach it to the complaint. Workers will update the status as they work.',
          ),
          _buildGuideCard(
            context,
            theme,
            '2',
            'Booking Community Hall',
            Icons.meeting_room_outlined,
            'Tap the plus (+) button in the navigation bar and select "Book Community Hall". '
            'Fill out the event details, choose a date range, and submit. The admin committee will review your request. '
            'You can monitor the approval status directly from the Hall Booking list.',
          ),
          _buildGuideCard(
            context,
            theme,
            '3',
            'Managing Visitors',
            Icons.security_outlined,
            'When a guest or delivery agent arrives at the main gate, the security guard logs their details. '
            'You will receive a real-time push notification requesting approval. You can approve or deny entry from the home dashboard or notification screen.',
          ),
          _buildGuideCard(
            context,
            theme,
            '4',
            'Society Issues & Public Notices',
            Icons.campaign_outlined,
            'Public notices from the management committee appear on the dashboard. '
            'To report generic society issues (like street light failure or parking problems), use the plus (+) button and select "Add Society Issue". '
            'This allows all residents to view, discuss, and track common area issues.',
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildGuideCard(
    BuildContext context,
    ThemeData theme,
    String stepNumber,
    String title,
    IconData icon,
    String description,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 20),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  stepNumber,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.primary,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(icon, size: 20, color: theme.colorScheme.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          title,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.black54,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
