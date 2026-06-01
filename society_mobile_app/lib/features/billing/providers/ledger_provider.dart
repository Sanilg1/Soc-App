import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/ledger_service.dart';
import '../models/ledger_model.dart';

final ledgerServiceProvider = Provider<LedgerService>((ref) {
  return LedgerService();
});

final flatLedgerStreamProvider = StreamProvider.family<FlatLedger?, String>((ref, flatId) {
  final service = ref.watch(ledgerServiceProvider);
  return service.streamFlatLedger(flatId);
});

final allLedgersStreamProvider = StreamProvider<List<FlatLedger>>((ref) {
  final service = ref.watch(ledgerServiceProvider);
  return service.streamAllLedgers();
});
