import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/providers/auth_provider.dart';
import '../../visitors/providers/visitor_provider.dart';
import '../../visitors/models/visitor_model.dart';

class GuardHomeScreen extends ConsumerStatefulWidget {
  const GuardHomeScreen({super.key});

  @override
  ConsumerState<GuardHomeScreen> createState() => _GuardHomeScreenState();
}

class _GuardHomeScreenState extends ConsumerState<GuardHomeScreen> {
  final _nameController = TextEditingController();
  final _flatController = TextEditingController();
  final _companyController = TextEditingController();
  final _purposeController = TextEditingController();

  void _showAddVisitorModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: 16,
          right: 16,
          top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('New Visitor Entry', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Visitor Name')),
            SizedBox(height: 12),
            TextField(controller: _flatController, decoration: const InputDecoration(labelText: 'Flat Number (e.g. 1302)')),
            SizedBox(height: 12),
            TextField(controller: _companyController, decoration: const InputDecoration(labelText: 'Company (Swiggy, Amazon, Guest)')),
            SizedBox(height: 12),
            TextField(controller: _purposeController, decoration: const InputDecoration(labelText: 'Purpose (Delivery, Visit)')),
            SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (_nameController.text.isEmpty || _flatController.text.isEmpty) return;
                  final newVisitor = Visitor(
                    id: '',
                    name: _nameController.text,
                    flatId: _flatController.text,
                    company: _companyController.text,
                    purpose: _purposeController.text,
                    status: 'pending',
                    timestamp: DateTime.now(),
                  );
                  await ref.read(visitorServiceProvider).addVisitor(newVisitor);
                  if (context.mounted) Navigator.pop(context);
                  _nameController.clear();
                  _flatController.clear();
                  _companyController.clear();
                  _purposeController.clear();
                },
                child: Text('Send Approval Request'),
              ),
            ),
            SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final visitorsAsync = ref.watch(allVisitorStreamProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Gate Security'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddVisitorModal,
        icon: Icon(Icons.person_add),
        label: Text('New Visitor'),
      ),
      body: visitorsAsync.when(
        data: (visitors) {
          if (visitors.isEmpty) {
            return Center(child: Text('No visitors today'));
          }
          return ListView.builder(
            itemCount: visitors.length,
            itemBuilder: (context, index) {
              final visitor = visitors[index];
              Color statusColor = Colors.orange;
              if (visitor.status == 'approved') statusColor = Colors.green;
              if (visitor.status == 'denied') statusColor = Colors.red;

              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text('${visitor.name} - Flat ${visitor.flatId}'),
                  subtitle: Text('${visitor.company} • ${visitor.purpose}'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      visitor.status.toUpperCase(),
                      style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
