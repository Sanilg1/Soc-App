'use client';

import React from 'react';

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant: 'primary' | 'danger' | 'warning' | 'success' | 'info';
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
}

export default function KpiCard({ icon, label, value, variant, trend }: KpiCardProps) {
  return (
    <div className={`kpi-card kpi-card--${variant} stagger-item`}>
      <div className={`kpi-icon kpi-icon--${variant}`}>
        {icon}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {trend && (
        <div className={`kpi-trend kpi-trend--${trend.direction}`}>
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
