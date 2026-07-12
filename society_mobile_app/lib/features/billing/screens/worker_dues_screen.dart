import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/ledger_provider.dart';

class WorkerDuesScreen extends ConsumerWidget {
  const WorkerDuesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final allLedgersAsync = ref.watch(allLedgersStreamProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Resident Dues Tracker'),
        leading: BackButton(
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/worker-home');
            }
          },
        ),
      ),
      body: allLedgersAsync.when(
        loading: () => Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (ledgers) {
          final outstandingLedgers = ledgers.where((l) => l.outstandingBalance > 0).toList();

          if (outstandingLedgers.isEmpty) {
            return Center(child: Text('All residents are cleared up! No outstanding dues.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: outstandingLedgers.length,
            itemBuilder: (context, index) {
              final ledger = outstandingLedgers[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Colors.red,
                    child: Icon(Icons.warning, color: Colors.white),
                  ),
                  title: Text('Flat: ${ledger.flatId}', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('Total Outstanding: ₹${ledger.outstandingBalance.toStringAsFixed(0)}'),
                  trailing: ElevatedButton(
                    onPressed: () {
                      _showConfirmDialog(context, ref, ledger.flatId, ledger.outstandingBalance);
                    },
                    child: Text('Confirm Receipt'),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  void _showConfirmDialog(BuildContext context, WidgetRef ref, String flatId, double amount) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Confirm Receipt'),
        content: Text('Did you receive ₹${amount.toStringAsFixed(0)} from Flat $flatId?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(ledgerServiceProvider).recordPayment(
                flatId: flatId,
                category: 'worker_confirmed_payment',
                amount: amount,
                description: 'Worker confirmed receiving full payment',
              );
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment confirmed!')));
              }
            },
            child: Text('Confirm'),
          ),
        ],
      ),
    );
  }
}
