import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  Future<void> _makeCall(String phoneNumber) async {
    final Uri url = Uri.parse('tel:$phoneNumber');
    try {
      if (await launchUrl(url)) {
        // Success
      } else {
        throw 'Could not launch $phoneNumber';
      }
    } catch (_) {
      // Fail silently or show dialog
    }
  }

  Future<void> _sendEmail(String emailAddress) async {
    final Uri url = Uri.parse('mailto:$emailAddress?subject=Society App Support');
    try {
      if (await launchUrl(url)) {
        // Success
      } else {
        throw 'Could not email $emailAddress';
      }
    } catch (_) {
      // Fail silently
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Help & Support'),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'How can we help you?',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Find answers to popular questions or get in touch with our management committee.',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 24),
              Text(
                'Frequently Asked Questions',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 12),
              _buildFaqTile(
                'My notifications are not appearing when the screen is off',
                'Please ensure you have granted background activity permissions for the app. '
                'Go to Android Settings -> Apps -> Society App -> Battery -> set to "Unrestricted". '
                'Also turn on "Allow notifications" and check that "Importance" is set to Urgent/Max.',
              ),
              _buildFaqTile(
                'How can I update my flat phone numbers?',
                'Only the society administrator can register or update default phone numbers for flats. '
                'Please contact the main office desk using the email or phone listed below to add new members.',
              ),
              _buildFaqTile(
                'How long does a hall booking approval take?',
                'Community hall requests are reviewed by the resident welfare committee within 24 to 48 hours. '
                'You will receive an update in the app once approved or rejected.',
              ),
              _buildFaqTile(
                'A worker hasn\'t acknowledged my urgent complaint',
                'Emergency complaints have a 15-minute acknowledgment window. '
                'If a worker does not accept it within 15 minutes, the system auto-escalates it to the admin committee and alerts them directly.',
              ),
              const SizedBox(height: 32),
              Text(
                'Contact Admin Office',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 1,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      ListTile(
                        leading: Icon(Icons.phone_outlined, color: theme.colorScheme.primary),
                        title: const Text('+91 98765 43210'),
                        subtitle: const Text('Monday to Saturday • 9 AM - 6 PM'),
                        trailing: ElevatedButton(
                          onPressed: () => _makeCall('+919876543210'),
                          child: const Text('Call'),
                        ),
                      ),
                      const Divider(),
                      ListTile(
                        leading: Icon(Icons.email_outlined, color: theme.colorScheme.primary),
                        title: const Text('admin@society.app'),
                        subtitle: const Text('Typically replies within 4 hours'),
                        trailing: ElevatedButton(
                          onPressed: () => _sendEmail('admin@society.app'),
                          child: const Text('Email'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFaqTile(String question, String answer) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(12),
      ),
      child: ExpansionTile(
        title: Text(
          question,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 14,
            color: Colors.black87,
          ),
        ),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        expandedAlignment: Alignment.topLeft,
        children: [
          Text(
            answer,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.black54,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}
