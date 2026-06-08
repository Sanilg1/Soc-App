import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/ledger_provider.dart';
import '../../auth/providers/auth_provider.dart';

class ResidentBillsScreen extends ConsumerWidget {
  const ResidentBillsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);
    
    // In our mock setup, the phone number represents the flat
    final flatId = authState.phone ?? 'Unknown';

    final ledgerAsync = ref.watch(flatLedgerStreamProvider(flatId));

    return Scaffold(
      appBar: AppBar(
        title: Text('My Ironing Bills'),
      ),
      body: ledgerAsync.when(
        loading: () => Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
        data: (ledger) {
          if (ledger == null) {
            return Center(child: Text('No billing information found.'));
          }

          final bool hasDues = ledger.outstandingBalance > 0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Balance Card
              Card(
                color: hasDues ? Colors.red.shade50 : Colors.green.shade50,
                shape: RoundedRectangleBorder(
                  side: BorderSide(
                    color: hasDues ? Colors.red.shade200 : Colors.green.shade200, 
                    width: 1.5,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Text('Total Outstanding', style: theme.textTheme.titleMedium),
                      SizedBox(height: 8),
                      Text(
                        '₹${ledger.outstandingBalance.toStringAsFixed(0)}', 
                        style: theme.textTheme.displayMedium?.copyWith(
                          color: hasDues ? Colors.red.shade900 : Colors.green.shade800,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (hasDues) ...[
                        SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            icon: Icon(Icons.payment),
                            label: Text('Clear Dues (Cash / Direct)'),
                            onPressed: () {
                              _showPaymentDialog(context, ref, ledger.outstandingBalance, flatId);
                            },
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              SizedBox(height: 24),
              
              // Transactions History
              Text('Transaction History', style: theme.textTheme.titleLarge),
              SizedBox(height: 12),
              
              if (ledger.transactions.isEmpty)
                Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Center(child: Text('No transactions yet.', style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant))),
                )
              else
                ...ledger.transactions.map((txn) {
                  final isCharge = txn.type == 'charge';
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isCharge ? Colors.orange.shade100 : Colors.green.shade100,
                        child: Icon(
                          isCharge ? Icons.arrow_downward : Icons.arrow_upward,
                          color: isCharge ? Colors.orange : Colors.green,
                        ),
                      ),
                      title: Text(txn.description, style: TextStyle(fontWeight: FontWeight.w500)),
                      subtitle: Text(
                        '${DateTime.parse(txn.timestamp).toLocal().toString().split('.')[0]}\nCategory: ${txn.category}',
                        style: theme.textTheme.bodySmall,
                      ),
                      isThreeLine: true,
                      trailing: Text(
                        '${isCharge ? '+' : '-'}₹${txn.amount.toStringAsFixed(0)}',
                        style: TextStyle(
                          color: isCharge ? Colors.red : Colors.green,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  );
                }),
            ],
          );
        },
      ),
    );
  }

  void _showPaymentDialog(BuildContext context, WidgetRef ref, double amount, String flatId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Confirm Payment'),
        content: Text('Mark ₹${amount.toStringAsFixed(0)} as paid? This will notify the society/workers to confirm receipt.'),
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
                category: 'ironing_payment',
                amount: amount,
                description: 'Resident paid Ironing bill via cash/direct',
              );
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment recorded!')));
              }
            },
            child: Text('Confirm'),
          ),
        ],
      ),
    );
  }
}
