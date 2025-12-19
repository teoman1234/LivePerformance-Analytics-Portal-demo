import React from 'react';

/**
 * SegmentedControl Component - Professional SaaS Filter UI
 * Sleek pill-shaped tabs with distinct color coding
 */
export default function SegmentedControl({ 
  options, 
  value, 
  onChange, 
  size = 'md',
  colorMode = 'accent' // 'accent' uses option colors, 'mono' uses single color
}) {
  const sizeConfig = {
    sm: { padding: '6px 12px', fontSize: '11px', gap: '4px' },
    md: { padding: '8px 16px', fontSize: '13px', gap: '6px' },
    lg: { padding: '10px 20px', fontSize: '14px', gap: '8px' },
  };
  
  const config = sizeConfig[size] || sizeConfig.md;
  
  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: config.gap,
        padding: '4px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        const accentColor = option.color || '#60C3C9';
        
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            style={{
              padding: config.padding,
              fontSize: config.fontSize,
              fontWeight: isActive ? '600' : '500',
              color: isActive ? (colorMode === 'accent' ? accentColor : '#fff') : '#8b8b9e',
              background: isActive 
                ? (colorMode === 'accent' 
                    ? `${accentColor}15` 
                    : 'rgba(96, 195, 201, 0.15)')
                : 'transparent',
              border: isActive 
                ? `1px solid ${colorMode === 'accent' ? accentColor : '#60C3C9'}40`
                : '1px solid transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#8b8b9e';
              }
            }}
          >
            {option.icon && <span style={{ fontSize: '14px' }}>{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * MetricFilter Component - Specialized for metric selection
 * Used in Agency Data page for Tokens, Hours, RV, etc.
 */
export function MetricFilter({ 
  metrics, 
  selectedMetrics, 
  onToggle,
}) {
  return (
    <div 
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {metrics.map((metric) => {
        const isActive = selectedMetrics[metric.key];
        
        return (
          <button
            key={metric.key}
            onClick={() => onToggle(metric.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? metric.color : '#8b8b9e',
              background: isActive 
                ? `${metric.color}15`
                : 'transparent',
              border: isActive 
                ? `1.5px solid ${metric.color}50`
                : '1.5px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = `${metric.color}30`;
                e.currentTarget.style.color = metric.color;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#8b8b9e';
              }
            }}
          >
            <span 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isActive ? metric.color : 'rgba(255, 255, 255, 0.2)',
                transition: 'background 0.2s ease',
              }}
            />
            {metric.label}
            {metric.tooltip && (
              <span 
                title={metric.tooltip}
                style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'help',
                }}
              >
                ⓘ
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
