'use client';

import React from 'react';
import Link from 'next/link';
import { useTableSort } from '../../hooks/useTableSort';
import { SortableHeader } from '../../components/SortableHeader';
import Header from '@/components/Header';
import KpiCard from '@/components/KpiCard';
import StatusBadge from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';
import { getTimeAgo, CATEGORY_CONFIG } from '@/lib/mock-data';
import type { ComplaintCategory } from '@/types';

function getCategorySvg(category: string) {
  switch (category) {
    case 'electrical':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'plumbing':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'housekeeping':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'ironing':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
          <path d="M4 19h16M20 14.5a3 3 0 00-3-3H7a3 3 0 00-3 3V19h16v-4.5zM17 11.5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v5.5" />
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </svg>
      );
  }
}

export default function DashboardPage() {
  const { complaints, escalations, workers } = useApp();

  const emergencyCount = complaints.filter(c => c.isEmergency).length;
  const slaBreaches = complaints.filter(c => c.slaStatus === 'breached').length;
  const reopenedCount = complaints.filter(c => c.status === 'reopened').length;
  const activeCount = complaints.filter(c => c.status !== 'closed').length;

  const activeEscalations = escalations.filter(e => !e.resolved);
  const pendingBookings = useApp().hallBookings?.filter(b => b.status === 'pending')?.length || 0;
  
  const urgencyWeight: Record<string, number> = {
    emergency: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const { sortedData: sortedComplaints, sortField, sortDirection, handleSort } = useTableSort(complaints, 'createdAt', 'desc');
  
  return (
    <>
      <Header title="Dashboard" subtitle="Real-time overview of society maintenance operations" />

      <div className="dashboard-content animate-fadeIn">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <KpiCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" />
                <path d="M8 6h4M8 10h4M8 14h4" />
              </svg>
            }
            label="Active Complaints"
            value={activeCount}
            variant="primary"
            trend={{ value: 'Real-time', direction: 'up' }}
            href="/complaints?status=active"
          />
          <KpiCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
            label="Emergencies"
            value={emergencyCount}
            variant="danger"
            href="/complaints?urgency=emergency"
          />
          <KpiCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
            label="SLA Breaches"
            value={slaBreaches}
            variant="warning"
            href="/escalations"
          />
          <KpiCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" />
              </svg>
            }
            label="Reopened"
            value={reopenedCount}
            variant="info"
            href="/complaints?status=reopened"
          />
          <KpiCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            }
            label="Resolved This Week"
            value={14}
            variant="success"
            href="/complaints?status=closed"
          />
          <KpiCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            }
            label="Pending Bookings"
            value={pendingBookings}
            variant="primary"
            href="/hall-bookings"
          />
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {/* Recent Complaints */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Complaints</h2>
              <Link href="/complaints" className="btn btn--ghost btn--sm">View All →</Link>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <SortableHeader label="Flat" field="flatId" currentSortField={sortField as string} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader label="Issue" field="description" currentSortField={sortField as string} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader label="Urgency" field="urgency" currentSortField={sortField as string} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader label="Status" field="status" currentSortField={sortField as string} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader label="Time" field="createdAt" currentSortField={sortField as string} sortDirection={sortDirection} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sortedComplaints.slice(0, 5).map((complaint) => (
                    <tr key={complaint.id}>
                      <td className="table-cell-primary">{complaint.flatId}</td>
                      <td>
                        <div style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {complaint.description}
                        </div>
                        <div className="table-cell-secondary" style={{ marginTop: 2 }}>
                          {complaint.category}
                        </div>
                      </td>
                      <td><StatusBadge status={complaint.urgency} /></td>
                      <td><StatusBadge status={complaint.status} /></td>
                      <td className="table-cell-secondary">{getTimeAgo(complaint.createdAt)}</td>
                    </tr>
                  ))}
                  {complaints.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-neutral-500)' }}>
                        No complaints found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Escalation Alerts */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Escalation Alerts</h2>
              <Link href="/escalations" className="btn btn--ghost btn--sm">View All →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {activeEscalations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-neutral-500)' }}>
                  No active escalations.
                </div>
              ) : (
                activeEscalations.slice(0, 3).map(esc => {
                  let styleParams = { bg: 'var(--color-info-50)', border: 'var(--color-info-100)', leftBorder: 'var(--color-info-500)', color: 'var(--color-info-600)' };
                  if (esc.severity === 'critical') styleParams = { bg: 'var(--color-emergency-50)', border: 'var(--color-emergency-100)', leftBorder: 'var(--color-emergency-500)', color: 'var(--color-emergency-600)' };
                  else if (esc.severity === 'high') styleParams = { bg: 'var(--color-danger-50)', border: 'var(--color-danger-100)', leftBorder: 'var(--color-danger-500)', color: 'var(--color-danger-600)' };
                  else if (esc.severity === 'medium') styleParams = { bg: 'var(--color-warning-50)', border: 'var(--color-warning-100)', leftBorder: 'var(--color-warning-500)', color: 'var(--color-warning-600)' };

                  return (
                    <div key={esc.id} style={{
                      padding: 'var(--space-4)',
                      background: styleParams.bg,
                      border: `1px solid ${styleParams.border}`,
                      borderRadius: 'var(--radius-lg)',
                      borderLeft: `4px solid ${styleParams.leftBorder}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: styleParams.color }}>
                          {esc.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Flat {esc.flatId}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: styleParams.leftBorder }}>{esc.timeElapsed}</span>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-700)', marginBottom: 'var(--space-2)' }}>
                        {esc.reason}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <StatusBadge status={esc.severity} />
                        <Link href={`/escalations`} className="btn btn--secondary btn--sm" style={{ padding: '2px 8px', fontSize: '10px', height: 'auto' }}>Resolve</Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Worker Status Cards */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Worker Status</h2>
            <Link href="/workers" className="btn btn--ghost btn--sm">Manage →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {workers.map(worker => {
              const isActive = worker.active && !worker.onLeave && !worker.pauseStatus;
              return (
                <div key={worker.id} style={{
                  padding: 'var(--space-4)',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  opacity: worker.active ? 1 : 0.5
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-lg)',
                    background: CATEGORY_CONFIG[worker.category as ComplaintCategory]?.gradient || 'var(--color-primary-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}>
                    {getCategorySvg(worker.category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{worker.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>
                      {worker.category} • {worker.activeComplaints} active complaints
                    </div>
                  </div>
                  <StatusBadge status={isActive ? 'within_sla' : worker.onLeave ? 'warning' : 'rejected'} withDot={true} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
