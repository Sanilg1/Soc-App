import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:society_mobile_app/features/auth/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);
    final isResident = authState.role == 'resident';

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const SizedBox(height: 24),
            const CircleAvatar(
              radius: 48,
              backgroundColor: Color(0xFFE2E8F0),
              child: Icon(Icons.person, size: 48, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 16),
            Text(
              isResident ? 'Sanil Grover' : 'Electrician Pro', 
              style: theme.textTheme.headlineMedium
            ),
            Text(
              isResident 
                  ? 'Flat ${authState.flatId ?? "Unknown"} • Resident' 
                  : 'Assigned Category: ${authState.category ?? "None"} • Worker', 
              style: const TextStyle(color: Colors.grey)
            ),
            const SizedBox(height: 32),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.help_outline),
              title: const Text('Help & Support'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.security),
              title: const Text('Privacy Policy'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            const Spacer(),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.error,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                ref.read(authProvider.notifier).logout();
              },
              child: const Text('Sign Out'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
