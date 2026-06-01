import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/providers/auth_provider.dart';
import '../../complaints/providers/complaints_provider.dart';

class NeedToolsScreen extends ConsumerStatefulWidget {
  final String complaintId;

  const NeedToolsScreen({super.key, required this.complaintId});

  @override
  ConsumerState<NeedToolsScreen> createState() => _NeedToolsScreenState();
}

class _NeedToolsScreenState extends ConsumerState<NeedToolsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _toolsController = TextEditingController();
  final _noteController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _toolsController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    final authState = ref.read(authProvider);
    final workerName = authState.phone ?? 'Worker';

    await ref.read(complaintServiceProvider).markComplaintNeedTools(
      widget.complaintId,
      workerName,
      _toolsController.text.trim(),
      _noteController.text.trim().isNotEmpty ? _noteController.text.trim() : null,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tools request submitted successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Parts/Tools'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'What parts or tools are needed?',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _toolsController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    labelText: 'Required items',
                    hintText: 'e.g. 15A Switchboard Panel, Copper winding tape, 1/2 inch PVC pipe joint',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please list the required tools or parts';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                Text(
                  'Procurement Note',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _noteController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    labelText: 'Optional details',
                    hintText: 'e.g. Parts need admin procurement. Will obtain tomorrow morning.',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 48),
                ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2.2, valueColor: AlwaysStoppedAnimation(Colors.white)),
                        )
                      : const Text('Submit Request'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
