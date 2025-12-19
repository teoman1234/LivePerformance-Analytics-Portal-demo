import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Component - Professional SaaS Navigation
 * Provides navigation context for deep pages
 */

const routeNameMap = {
  '/supervisor': 'Supervisor',
  '/supervisor/agency-data': 'Agency Data',
  '/supervisor/influencers': 'Influencers',
  '/influencer': 'My Dashboard',
  '/influencer/performance': 'Performance',
  '/influencer/settings': 'Settings',
  '/settings': 'Settings',
};

export default function Breadcrumb({ customPath, customLabels }) {
  const location = useLocation();
  const pathname = customPath || location.pathname;
  
  // Build breadcrumb items from path
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  // Always start with Home
  breadcrumbs.push({
    path: '/',
    label: 'Home',
    isHome: true,
  });
  
  // Build cumulative paths
  let cumulativePath = '';
  pathSegments.forEach((segment, index) => {
    cumulativePath += `/${segment}`;
    
    // Get label from route map or custom labels or capitalize segment
    const label = customLabels?.[cumulativePath] || 
                  routeNameMap[cumulativePath] || 
                  segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    breadcrumbs.push({
      path: cumulativePath,
      label,
      isLast: index === pathSegments.length - 1,
    });
  });

  return (
    <nav 
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && (
            <ChevronRight 
              size={14} 
              style={{ 
                color: 'rgba(139, 139, 158, 0.5)',
                flexShrink: 0,
              }} 
            />
          )}
          
          {crumb.isLast ? (
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#60C3C9',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#8b8b9e',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8b8b9e';
              }}
            >
              {crumb.isHome && <Home size={14} />}
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
