'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// SVG Icons as components for clean sidebar
const Icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="7" height="8" rx="1.5" />
      <rect x="11" y="2" width="7" height="5" rx="1.5" />
      <rect x="2" y="12" width="7" height="6" rx="1.5" />
      <rect x="11" y="9" width="7" height="9" rx="1.5" />
    </svg>
  ),
  complaints: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 2H4a2 2 0 00-2 2v10a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2V4a2 2 0 00-2-2z" />
      <path d="M7 7h6M7 10h4" />
    </svg>
  ),
  escalation: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L2 18h16L10 2z" />
      <path d="M10 7v4M10 14h.01" />
    </svg>
  ),
  society: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18V7l7-5 7 5v11" />
      <path d="M3 18h14" />
      <rect x="7" y="10" width="6" height="8" />
      <path d="M10 10v8" />
    </svg>
  ),
  notices: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8v10a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h8l6 6z" />
      <path d="M12 2v6h6" />
      <path d="M7 12h6M7 15h4" />
    </svg>
  ),
  ironing: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M20 14.5a3 3 0 00-3-3H7a3 3 0 00-3 3V19h16v-4.5z" />
      <path d="M17 11.5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v5.5" />
    </svg>
  ),
  activityLogs: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path d="M12 2v6h6" />
      <path d="M6 11h8M6 14h5M6 8h2" />
    </svg>
  ),
  workers: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="3" />
      <path d="M4 18v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M7 3h6" />
    </svg>
  ),
  analytics: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18V10l4-4 4 6 4-8 4 6" />
      <path d="M2 18h16" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2v2M10 16v2M3.5 5.5l1.4 1.4M15.1 15.1l1.4 1.4M2 10h2M16 10h2M3.5 14.5l1.4-1.4M15.1 4.9l1.4-1.4" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18H4a2 2 0 01-2-2V4a2 2 0 012-2h3M13 14l4-4-4-4M17 10H7" />
    </svg>
  ),
};

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Icons.dashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Complaints', href: '/complaints', icon: Icons.complaints },
      { label: 'Escalations', href: '/escalations', icon: Icons.escalation },
      { label: 'Society Issues', href: '/society-issues', icon: Icons.society },
      { label: 'Notices', href: '/notices', icon: Icons.notices },
      { label: 'Ironing Ledger', href: '/ironing', icon: Icons.ironing },
      { label: 'Activity Logs', href: '/activity-logs', icon: Icons.activityLogs },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Workers', href: '/workers', icon: Icons.workers },
      { label: 'Analytics', href: '/analytics', icon: Icons.analytics },
      { label: 'Settings', href: '/settings', icon: Icons.settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { adminProfile, signOut } = useAuth();

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* Header / Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">S</div>
        <div>
          <div className="sidebar-title">SocietySync</div>
          <div className="sidebar-subtitle">Admin Dashboard</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <React.Fragment key={section.title}>
            <div className="sidebar-section-label">{section.title}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{adminProfile?.name ? adminProfile.name[0] : 'A'}</div>
          <div>
            <div className="sidebar-user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
              {adminProfile?.name || 'Admin'}
            </div>
            <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>
              {adminProfile?.role || 'Committee Member'}
            </div>
          </div>
        </div>
        
        <button 
          onClick={signOut} 
          className="sidebar-logout-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'background 0.2s',
            width: '100%',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          {Icons.logout}
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
