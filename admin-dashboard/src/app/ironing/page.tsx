'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/mock-data';
import type { FlatLedger, LedgerTransaction, IroningRates } from '@/types';

export default function IroningLedgerPage() {
  const { ledgers, ironingRates, recordIroningPayment, addIroningCharge, updateIroningRates } = useApp();

  // Modals state
  const [selectedFlatId, setSelectedFlatId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showRatesModal, setShowRatesModal] = useState(false);

  // Form states
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [newRates, setNewRates] = useState<IroningRates>({});
  
  const [newClothType, setNewClothType] = useState('');

  // Get active ledger details
  const activeLedger = selectedFlatId ? ledgers.find(l => l.flatId === selectedFlatId) : null;

  // Handlers
  function openPaymentModal(ledger: FlatLedger) {
    setSelectedFlatId(ledger.flatId);
    setPaymentAmount(ledger.outstandingBalance);
    setShowPaymentModal(true);
  }

  function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFlatId || paymentAmount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }
    recordIroningPayment(selectedFlatId, paymentAmount);
    toast.success(`Payment of ₹${paymentAmount} recorded for Flat ${selectedFlatId}`);
    setShowPaymentModal(false);
    setSelectedFlatId(null);
  }

  function openDeliveryModal(ledger: FlatLedger) {
    setSelectedFlatId(ledger.flatId);
    
    // Initialize item counts for all existing cloth types to 0
    const initialCounts: Record<string, number> = {};
    Object.keys(ironingRates).forEach(key => initialCounts[key] = 0);
    setItemCounts(initialCounts);
    
    setShowDeliveryModal(true);
  }

  const calculatedTotalDeliveryCost = Object.entries(itemCounts).reduce((total, [cloth, count]) => {
    const rate = ironingRates[cloth] || 0;
    return total + (count * rate);
  }, 0);

  function handleDeliverySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFlatId) return;
    
    const totalItems = Object.values(itemCounts).reduce((a, b) => a + b, 0);
    if (totalItems === 0) {
      toast.error('Please add at least one cloth item');
      return;
    }

    addIroningCharge(selectedFlatId, itemCounts);
    toast.success(`Delivery of ${totalItems} clothes recorded for Flat ${selectedFlatId} (₹${calculatedTotalDeliveryCost})`);
    setShowDeliveryModal(false);
    setSelectedFlatId(null);
  }

  function openRatesModal() {
    setNewRates({ ...ironingRates });
    setShowRatesModal(true);
  }

  function handleRatesSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateIroningRates(newRates);
    toast.success('Ironing rates updated successfully');
    setShowRatesModal(false);
  }

  function handleAddNewClothType() {
    const type = newClothType.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!type) return;
    
    if (newRates[type] !== undefined) {
      toast.error('Cloth type already exists');
      return;
    }
    
    setNewRates(prev => ({ ...prev, [type]: 0 }));
    setNewClothType('');
    toast.success(`Added ${type}, please set a price`);
  }

  // Aggregate all transactions across ledgers to show a chronological global feed
  interface GlobalTransaction extends LedgerTransaction {
    flatId: string;
  }
  const recentTransactions: GlobalTransaction[] = ledgers
    .flatMap(l => l.transactions.map(t => ({ ...t, flatId: l.flatId })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <>
      <Header title="Ironing Ledger" subtitle="Manage residents' outstanding ironing dues and configure pricing" />

      <div className="dashboard-content animate-fadeIn">
        {/* Top Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          
          {/* Section: Flat Ledger Dues */}
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: 'var(--space-5)' }}>
              Resident Balances
            </h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Flat ID</th>
                    <th>Outstanding Dues</th>
                    <th>Last Transaction</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-neutral-500)' }}>
                        No ledgers found.
                      </td>
                    </tr>
                  ) : (
                    ledgers.map((ledger) => {
                      const lastTx = ledger.transactions[0];
                      const lastTxDesc = lastTx 
                        ? `${lastTx.type === 'charge' ? 'Charged' : 'Paid'} ₹${lastTx.amount} (${formatDate(lastTx.timestamp)})`
                        : 'No activity';

                      return (
                        <tr key={ledger.flatId}>
                          <td className="table-cell-primary">Flat {ledger.flatId}</td>
                          <td style={{ fontWeight: 700, color: ledger.outstandingBalance > 0 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }}>
                            ₹{ledger.outstandingBalance}
                          </td>
                          <td className="table-cell-secondary">{lastTxDesc}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn--secondary btn--sm" 
                                onClick={() => openDeliveryModal(ledger)}
                              >
                                + Record Delivery
                              </button>
                              <button 
                                className="btn btn--primary btn--sm" 
                                onClick={() => openPaymentModal(ledger)}
                                disabled={ledger.outstandingBalance === 0}
                                style={{ opacity: ledger.outstandingBalance === 0 ? 0.5 : 1 }}
                              >
                                Clear Dues
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Price Configuration */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                Active Rates
              </h2>
              <button className="btn btn--secondary btn--sm" onClick={openRatesModal}>Edit Rates</button>
            </div>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {Object.entries(ironingRates).map(([clothType, rate], index, array) => (
                  <div key={clothType} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: index === array.length - 1 ? 0 : 'var(--space-2)', borderBottom: index === array.length - 1 ? 'none' : '1px solid var(--color-neutral-100)' }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-neutral-600)', textTransform: 'capitalize' }}>{clothType}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-neutral-800)' }}>₹{rate} / piece</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Global Recent Ledger Feed */}
        <div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: 'var(--space-5)' }}>
            Recent Activities
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Flat</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-neutral-500)' }}>
                      No transactions recorded.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="table-cell-secondary">{formatDate(tx.timestamp)}</td>
                      <td className="table-cell-primary">Flat {tx.flatId}</td>
                      <td>{tx.description}</td>
                      <td>
                        <span className={`badge ${tx.type === 'charge' ? 'badge--need_tools' : 'badge--awaiting_confirmation'}`}>
                          {tx.type === 'charge' ? 'Delivery Charge' : 'Cash Paid'}
                        </span>
                      </td>
                      <td style={{ 
                        textAlign: 'right', 
                        fontWeight: 700, 
                        color: tx.type === 'charge' ? 'var(--color-danger-600)' : 'var(--color-success-600)' 
                      }}>
                        {tx.type === 'charge' ? '+' : '-'} ₹{tx.amount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => { setShowPaymentModal(false); setSelectedFlatId(null); }} 
        title={`Record Cash Payment — Flat ${selectedFlatId}`}
        subtitle="Confirm cash collected from resident to clear ledger dues"
      >
        <form onSubmit={handlePaymentSubmit}>
          <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
            <label className="form-label">Payment Amount (₹) *</label>
            <input 
              type="number"
              required
              className="form-input" 
              value={paymentAmount || ''} 
              onChange={(e) => setPaymentAmount(Math.max(0, parseFloat(e.target.value) || 0))} 
              min={1}
              max={activeLedger?.outstandingBalance || 10000}
              placeholder="e.g. 100"
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-400)', marginTop: '4px' }}>
              Current Outstanding Balance: ₹{activeLedger?.outstandingBalance}
            </span>
          </div>

          <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: 'var(--space-6)' }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setShowPaymentModal(false); setSelectedFlatId(null); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm">
              Confirm Cash Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Delivery Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => { setShowDeliveryModal(false); setSelectedFlatId(null); }}
        title={`Record Cloth Delivery — Flat ${selectedFlatId}`}
        subtitle="Add a charge to resident ledger based on returned ironed clothes"
      >
        <form onSubmit={handleDeliverySubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {Object.keys(ironingRates).map((clothType) => (
                <div key={clothType} className="form-group">
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>
                    {clothType} (₹{ironingRates[clothType]}/pc)
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={itemCounts[clothType] || ''} 
                    onChange={(e) => setItemCounts(p => ({ ...p, [clothType]: Math.max(0, parseInt(e.target.value) || 0) }))}
                    placeholder="0"
                    min={0}
                  />
                </div>
              ))}
            </div>

            <div style={{ 
              padding: 'var(--space-4)', 
              background: 'var(--color-neutral-50)', 
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'var(--space-2)'
            }}>
              <span style={{ fontWeight: 600, color: 'var(--color-neutral-600)' }}>Calculated Total Charge:</span>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                ₹{calculatedTotalDeliveryCost}
              </span>
            </div>

          </div>

          <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setShowDeliveryModal(false); setSelectedFlatId(null); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm">
              Record Charge
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Rates Modal */}
      <Modal
        isOpen={showRatesModal}
        onClose={() => setShowRatesModal(false)}
        title="Configure Ironing Rates"
        subtitle="Set per-piece price rates for returned ironed clothes"
      >
        <form onSubmit={handleRatesSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {Object.keys(newRates).map((clothType) => (
                <div key={clothType} className="form-group">
                  <label className="form-label" style={{ textTransform: 'capitalize', display: 'flex', justifyContent: 'space-between' }}>
                    {clothType} (₹) *
                    <button type="button" onClick={() => {
                      const updated = { ...newRates };
                      delete updated[clothType];
                      setNewRates(updated);
                    }} style={{ background: 'none', border: 'none', color: 'var(--color-danger-500)', cursor: 'pointer', padding: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </label>
                  <input 
                    type="number" 
                    required
                    className="form-input" 
                    value={newRates[clothType] || 0} 
                    onChange={(e) => setNewRates(p => ({ ...p, [clothType]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                    min={0}
                  />
                </div>
              ))}
            </div>

            {/* Add New Cloth Type */}
            <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <label className="form-label">Add New Cloth Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. bedsheets"
                  value={newClothType}
                  onChange={(e) => setNewClothType(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className="btn btn--secondary" 
                  onClick={handleAddNewClothType}
                  disabled={!newClothType.trim()}
                >
                  Add Type
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, border: 'none' }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowRatesModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm">
              Save Rates
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
