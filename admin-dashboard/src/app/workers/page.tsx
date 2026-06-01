'use client';

import React from 'react';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';

const CATEGORY_ICONS: Record<string, { icon: string; gradient: string }> = {
  electrical: { icon: '⚡', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  plumbing: { icon: '🔧', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
  housekeeping: { icon: '🧹', gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
};

export default function WorkersPage() {
  const { workers, leaveRequests, toggleWorkerActive, updateLeaveStatus } = useApp();

  function handleToggleActive(id: string, currentlyActive: boolean) {
    toggleWorkerActive(id);
    toast.success(`Worker ${currentlyActive ? 'deactivated' : 'activated'} successfully`);
  }

  function handleLeaveAction(id: string, action: 'approved' | 'rejected') {
    updateLeaveStatus(id, action);
    toast.success(`Leave request ${action}`);
  }

  return (
    <>
      <Header title="Worker Management" subtitle="Monitor worker status, performance, and leave requests" />

      <div className="dashboard-content animate-fadeIn">
        {/* Worker Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {workers.map((worker) => {
            const cat = CATEGORY_ICONS[worker.category] || { icon: '👷', gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)' };
            return (
              <div key={worker.id} className="card stagger-item" style={{ padding: 'var(--space-6)', opacity: worker.active ? 1 : 0.6 }}>
                {/* Worker Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-xl)',
                    background: cat.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-neutral-900)' }}>
                      {worker.name}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-500)' }}>
                      {worker.category.charAt(0).toUpperCase() + worker.category.slice(1)} • {worker.phone}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-1)' }}>
                    <StatusBadge status={worker.active ? 'approved' : 'rejected'} />
                    {worker.onLeave && <StatusBadge status="warning" />}
                    {worker.pauseStatus && <StatusBadge status="pending" />}
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  background: 'var(--color-neutral-50)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-4)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                      {worker.activeComplaints}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>Active</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-success-600)' }}>
                      {worker.completedThisWeek}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>This Week</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-info-600)' }}>
                      {worker.avgResolutionHours}h
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>Avg Time</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: 800,
                      color: worker.slaCompliance >= 90 ? 'var(--color-success-600)' : 'var(--color-warning-600)',
                    }}>
                      {worker.slaCompliance}%
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>SLA</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <a href="/complaints" className="btn btn--secondary btn--sm" style={{ flex: 1, textAlign: 'center' }}>View Complaints</a>
                  <button className="btn btn--ghost btn--sm" onClick={() => handleToggleActive(worker.id, worker.active)}>
                    {worker.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leave Requests */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Leave & Pause Requests</h2>
          </div>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table" id="leave-requests-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Reason</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-neutral-500)' }}>
                      No leave requests at the moment.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="table-cell-primary">{req.workerName}</td>
                      <td>Leave</td>
                      <td>
                        <div style={{ fontSize: 'var(--font-size-sm)' }}>
                          {new Date(req.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          {' — '}
                          {new Date(req.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td>{req.reason}</td>
                      <td className="table-cell-secondary">{req.note || '—'}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td>
                        {req.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn--primary btn--sm" onClick={() => handleLeaveAction(req.id, 'approved')}>Approve</button>
                            <button className="btn btn--danger btn--sm" onClick={() => handleLeaveAction(req.id, 'rejected')}>Reject</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-400)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
