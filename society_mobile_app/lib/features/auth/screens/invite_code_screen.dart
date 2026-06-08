import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class InviteCodeScreen extends ConsumerStatefulWidget {
  const InviteCodeScreen({super.key});

  @override
  ConsumerState<InviteCodeScreen> createState() => _InviteCodeScreenState();
}

class _InviteCodeScreenState extends ConsumerState<InviteCodeScreen> {
  final _formKey = GlobalKey<FormState>();
  final _inviteController = TextEditingController();
  final _flatController = TextEditingController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _inviteController.dispose();
    _flatController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _onSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final authNotifier = ref.read(authProvider.notifier);
    
    // Attempt to register/login directly using the Invite Code
    final success = await authNotifier.submitInviteDetails(
      name: _nameController.text.trim(),
      flatNumber: _flatController.text.trim(),
      phone: _phoneController.text.trim(),
      inviteCode: _inviteController.text.trim(),
    );

    if (mounted) {
      if (success) {
        context.go('/'); // AuthProvider will redirect based on role
      } else {
        final error = ref.read(authProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? 'Failed to verify invite code'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);
    final isLoading = authState.status == AuthStatus.authenticating;

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome to SOC APP'),
        actions: [
          TextButton(
            onPressed: () => context.go('/login'),
            child: Text('Worker Login'),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 16),
                Text(
                  'Join Your Society',
                  style: theme.textTheme.headlineMedium,
                ),
                SizedBox(height: 8),
                Text(
                  'Enter the invite details provided by your society administrator to activate your account.',
                  style: theme.textTheme.bodyMedium,
                ),
                SizedBox(height: 28),
                
                // Resident Name
                TextFormField(
                  controller: _nameController,
                  enabled: !isLoading,
                  textCapitalization: TextCapitalization.words,
                  decoration: InputDecoration(
                    labelText: 'Full Name',
                    hintText: 'e.g., Sanil Grover',
                    prefixIcon: Icon(Icons.person_outline_rounded),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your full name';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 16),

                TextFormField(
                  controller: _flatController,
                  enabled: !isLoading,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Flat Number',
                    hintText: 'e.g., 1302',
                    prefixIcon: Icon(Icons.apartment_rounded),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your flat number';
                    }
                    final cleanVal = value.trim();
                    if (cleanVal.length != 4 || int.tryParse(cleanVal) == null) {
                      return 'Must be a 4-digit number (e.g., 1302)';
                    }
                    final blockChar = cleanVal[0];
                    final flatNum = int.tryParse(cleanVal.substring(2));
                    
                    if (blockChar != '1' && blockChar != '2') {
                      return 'Block must start with 1 (Block A) or 2 (Block B)';
                    }
                    if (flatNum == null || flatNum < 1 || flatNum > 4) {
                      return 'Flat number (last 2 digits) must be 01, 02, 03, or 04';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 16),

                // Phone Number
                TextFormField(
                  controller: _phoneController,
                  enabled: !isLoading,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: 'Registered Phone Number',
                    hintText: 'e.g., +1 555-010-0001',
                    prefixIcon: Icon(Icons.phone_rounded),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your registered phone number';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 16),

                // Invite Code
                TextFormField(
                  controller: _inviteController,
                  enabled: !isLoading,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Invite Code',
                    hintText: 'Enter 6-digit code',
                    prefixIcon: Icon(Icons.key_rounded),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter the invite code';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 32),

                ElevatedButton(
                  onPressed: isLoading ? null : _onSubmit,
                  child: isLoading
                      ? SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text('Verify Invite'),
                ),
                SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
