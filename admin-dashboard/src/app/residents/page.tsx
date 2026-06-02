'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';

export default function ResidentsPage() {
  const { flats, updateFlatPhoneNumbers, regenerateInviteCode } = useApp();
  
  
  const [showManagePhonesModal, setShowManagePhonesModal] = useState(false);
  const [selectedFlatId, setSelectedFlatId] = useState<string | null>(null);
  const [newPhone, setNewPhone] = useState('');

  const selectedFlat = flats.find(f => f.id === selectedFlatId);

  const handleAddPhone = async () => {
    if (!selectedFlat || !newPhone.trim()) return;
    
    const currentPhones = selectedFlat.phoneNumbers || [];
    if (currentPhones.includes(newPhone)) {
      toast.error('Phone number already added');
      return;
    }
    
    const updatedPhones = [...currentPhones, newPhone];
    await updateFlatPhoneNumbers(selectedFlat.id, updatedPhones);
    setNewPhone('');
  };

  const handleRemovePhone = async (phoneToRemove: string) => {
    if (!selectedFlat) return;
    const currentPhones = selectedFlat.phoneNumbers || [];
    const updatedPhones = currentPhones.filter(p => p !== phoneToRemove);
    await updateFlatPhoneNumbers(selectedFlat.id, updatedPhones);
  };

  const handleRegenerateCode = async (flatId: string) => {
    if (window.confirm('Are you sure you want to invalidate the old invite code and generate a new one? Residents using the old code to log in will no longer be able to do so.')) {
      await regenerateInviteCode(flatId);
    }
  };

  return (
    <>
      <Header 
        title="Resident Directory" 
        subtitle="Manage flat access, phone numbers, and login invite codes" 
      />

      <div className="dashboard-content animate-fadeIn">
        {flats.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-4)' }}>No flats registered yet.</p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {flats.map((flat) => (
              <div key={flat.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', color: 'var(--color-primary-900)' }}>
                      Flat {flat.flatNumber}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>
                      {(flat.phoneNumbers || []).length} registered member(s)
                    </p>
                  </div>
                  <div style={{ background: 'var(--color-primary-50)', padding: '6px 12px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--color-primary-600)', fontWeight: 600, textTransform: 'uppercase' }}>Invite Code</div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-900)', letterSpacing: '2px' }}>
                      {flat.inviteCode}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-primary-100)', paddingTop: 'var(--space-4)' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-700)' }}>Authorized Phones</h4>
                  {!(flat.phoneNumbers && flat.phoneNumbers.length > 0) ? (
                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>No phones added</p>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {flat.phoneNumbers.map((phone, idx) => (
                        <li key={idx} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          {phone}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button 
                    className="btn btn--secondary btn--sm" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setSelectedFlatId(flat.id);
                      setShowManagePhonesModal(true);
                    }}
                  >
                    Manage Phones
                  </button>
                  <button 
                    className="btn btn--ghost btn--sm" 
                    style={{ padding: '0 8px' }}
                    onClick={() => handleRegenerateCode(flat.id)}
                    title="Regenerate Invite Code"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.59-9.21l5.25 5.25"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manage Phones Modal */}
      {showManagePhonesModal && selectedFlat && (
        <Modal
          isOpen={showManagePhonesModal}
          onClose={() => setShowManagePhonesModal(false)}
          title={`Manage Phones - Flat ${selectedFlat.flatNumber}`}
          subtitle="Add or remove authorized phone numbers for this flat"
          maxWidth={500}
        >
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-700)' }}>Current Authorized Phones</h4>
            {!(selectedFlat.phoneNumbers && selectedFlat.phoneNumbers.length > 0) ? (
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)', background: 'var(--color-neutral-50)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                No phone numbers registered for this flat yet.
              </p>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedFlat.phoneNumbers.map((phone, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--color-neutral-50)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-neutral-200)'
                  }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{phone}</span>
                    <button 
                      className="btn btn--ghost btn--sm" 
                      style={{ color: '#ef4444', padding: '4px 8px' }}
                      onClick={() => handleRemovePhone(phone)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: 'var(--space-6)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-700)' }}>Add New Phone Number</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +91 9876543210"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhone();
                  }
                }}
              />
              <button 
                className="btn btn--secondary" 
                onClick={handleAddPhone}
                disabled={!newPhone.trim()}
              >
                Add
              </button>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--color-neutral-500)' }}>
              Make sure to include the country code (e.g. +91).
            </p>
          </div>

          <div style={{ marginTop: 'var(--space-6)', textAlign: 'right' }}>
            <button className="btn btn--primary" onClick={() => setShowManagePhonesModal(false)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
