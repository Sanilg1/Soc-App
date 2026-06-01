'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/mock-data';
import type { ActivityLog, ActivityLogAction } from '@/types';

export default function ActivityLogsPage() {
  const { activityLogs } = useApp();
  const [actionFilter, setActionFilter] = useState<ActivityLogAction | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs
  const filteredLogs = activityLogs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.complaintId.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        log.note.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function getActionBadgeClass(action: ActivityLogAction) {
    switch (action) {
      case 'status_change':
        return 'badge badge--submitted';
      case 'assignment':
        return 'badge badge--visited';
      case 'admin_escalation':
        return 'badge badge--warning';
      case 'sla_breach':
        return 'badge badge--escalated';
      default:
        return 'badge badge--queued';
    }
  }

  function getRoleBadgeClass(role: string) {
    switch (role) {
      case 'admin':
        return 'badge badge--visited';
      case 'worker':
        return 'badge badge--need_tools';
      case 'resident':
        return 'badge badge--submitted';
      default:
        return 'badge badge--queued';
    }
  }

  return (
    <>
      <Header title="System Activity Logs" subtitle="Real-time operations log of society maintenance actions and background SLA checks" />

      <div className="dashboard-content animate-fadeIn">
        {/* Filters Bar */}
        <div className="filters-bar">
          <input
            type="text"
            className="form-input filter-search"
            placeholder="Search by Complaint ID, performed by, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActivityLogAction | 'all')}
          >
            <option value="all">All Actions</option>
            <option value="status_change">Status Change</option>
            <option value="assignment">Worker Assignment</option>
            <option value="admin_escalation">Admin Escalation</option>
            <option value="sla_breach">SLA Breach / Timeout</option>
          </select>
        </div>

        {/* Activity Logs Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Timestamp</th>
                <th style={{ width: '120px' }}>Complaint ID</th>
                <th style={{ width: '150px' }}>Action</th>
                <th style={{ width: '180px' }}>Performed By</th>
                <th>Changes</th>
                <th>Note / Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-title">No activities recorded</div>
                      <div className="empty-state-message">
                        Activities will be logged automatically when complaints are filed, assigned, re-opened, updated, or when the background SLA scanner runs.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="table-cell-secondary">{formatDate(log.createdAt)}</td>
                    <td className="table-cell-primary">
                      <a href={`/complaints/${log.complaintId}`} style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
                        {log.complaintId}
                      </a>
                    </td>
                    <td>
                      <span className={getActionBadgeClass(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontWeight: 500 }}>{log.performedBy}</span>
                        <span className={getRoleBadgeClass(log.role)} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {log.role}
                        </span>
                      </div>
                    </td>
                    <td>
                      {log.previousValue || log.newValue ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                          {log.previousValue ? (
                            <span style={{ textDecoration: 'line-through', color: 'var(--color-neutral-400)' }}>
                              {log.previousValue.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>none</span>
                          )}
                          <span style={{ color: 'var(--color-neutral-400)' }}>➔</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                            {log.newValue.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--font-size-xs)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-neutral-600)' }}>
                      {log.note || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
