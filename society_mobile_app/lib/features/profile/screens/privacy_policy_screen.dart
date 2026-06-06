import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Privacy Policy',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Last updated: June 05, 2026',
              style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            _buildSection(
              theme,
              '1. Information We Collect',
              'We collect information to provide better services to all our society residents. This includes:\n\n'
              '• Profile Information: Name, phone number, flat number, and profile picture (if uploaded).\n'
              '• Society Activities: Complaint descriptions, feedback notes, booking logs, and visitor approval choices.\n'
              '• Device Permissions: Camera and gallery access (only used for profile pictures and attaching photos to complaints).',
            ),
            const SizedBox(height: 20),
            _buildSection(
              theme,
              '2. How We Use Information',
              'The information collected is used for:\n\n'
              '• Managing complaints and assigning them to maintenance workers.\n'
              '• Processing community hall bookings and updates.\n'
              '• Notifying residents about guest arrivals at the gate and admin notices.\n'
              '• Displaying profile cards to admins and committee members for validation.',
            ),
            const SizedBox(height: 20),
            _buildSection(
              theme,
              '3. Data Storage & Security',
              'All data is securely stored using Firebase Auth, Cloud Firestore, and Firebase Storage. Access is restricted based on system roles (Residents, Workers, Guards, and Admins). Profile pictures and attached photos are stored securely in storage buckets under rules preventing unauthorized access.',
            ),
            const SizedBox(height: 20),
            _buildSection(
              theme,
              '4. Contact Us',
              'If you have any questions or suggestions about our Privacy Policy, please contact the Society Office at support@society.app.',
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(ThemeData theme, String title, String body) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          body,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: Colors.black54,
            height: 1.5,
          ),
        ),
      ],
    );
  }
}
