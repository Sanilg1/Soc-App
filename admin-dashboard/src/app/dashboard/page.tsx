'use client';

import React from 'react';
import Header from '@/components/Header';
import KpiCard from '@/components/KpiCard';
import StatusBadge from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';
import { getTimeAgo, CATEGORY_CONFIG } from '@/lib/mock-data';
import type { ComplaintCategory } from '@/types';

export default function DashboardPage() {
  const { complaints, escalations, workers } = useApp();

  const emergencyCount = complaints.filter(c => c.isEmergency).length;
  const slaBreaches = complaints.filter(c => c.slaStatus === 'breached').length;
  const reopenedCount = complaints.filter(c => c.status === 'reopened').length;
  const activeCount = complaints.filter(c => c.status !== 'closed').length;

  const activeEscalations = escalations.filter(e => !e.resolved);
  
  return (
    <>
      <Header title="Dashboard" subtitle="Real-time overview of society maintenance operations" />

      <div className="dashboard-content animate-fadeIn">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <KpiCard
            icon={<span>📋</span>}
            label="Active Complaints"
            value={activeCount}
            variant="primary"
            trend={{ value: 'Real-time', direction: 'up' }}
          />
          <KpiCard
            icon={<span>🚨</span>}
            label="Emergencies"
            value={emergencyCount}
            variant="danger"
          />
          <KpiCard
            icon={<span>⚠️</span>}
            label="SLA Breaches"
            value={slaBreaches}
            variant="warning"
          />
          <KpiCard
            icon={<span>🔄</span>}
            label="Reopened"
            value={reopenedCount}
            variant="info"
          />
          <KpiCard
            icon={<span>✅</span>}
            label="Resolved This Week"
            value={14}
            variant="success"
          />
          <KpiCard
            icon={<span>⏱️</span>}
            label="Avg Resolution"
            value="6.2h"
            variant="primary"
          />
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {/* Recent Complaints */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Complaints</h2>
              <a href="/complaints" className="btn btn--ghost btn--sm">View All →</a>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Flat</th>
                    <th>Issue</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.slice(0, 5).map((complaint) => (
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
              <h2 className="card-title">🔴 Escalation Alerts</h2>
              <a href="/escalations" className="btn btn--ghost btn--sm">View All →</a>
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
                          {esc.type === 'emergency' ? '🚨' : esc.type === 'reopen_threshold' ? '🔄' : '⏱️'} {esc.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Flat {esc.flatId}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: styleParams.leftBorder }}>{esc.timeElapsed}</span>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-700)', marginBottom: 'var(--space-2)' }}>
                        {esc.reason}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <StatusBadge status={esc.severity} />
                        <a href={`/escalations`} className="btn btn--secondary btn--sm" style={{ padding: '2px 8px', fontSize: '10px', height: 'auto' }}>Resolve</a>
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
            <a href="/workers" className="btn btn--ghost btn--sm">Manage →</a>
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
                    {CATEGORY_CONFIG[worker.category as ComplaintCategory]?.icon || '🔧'}
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
