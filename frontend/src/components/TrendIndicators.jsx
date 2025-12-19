import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * TrendIndicator Component
 * Shows dynamic trend arrows (green up, red down, gray neutral)
 */
export function TrendIndicator({ value, showValue = true, size = 'sm' }) {
  const isPositive = value > 0;
  const isNeutral = value === 0 || value === null || value === undefined;
  
  const sizeConfig = {
    sm: { icon: 12, text: '11px' },
    md: { icon: 14, text: '12px' },
    lg: { icon: 16, text: '13px' },
  };
  
  const config = sizeConfig[size] || sizeConfig.sm;
  
  if (isNeutral) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: '#8b8b9e',
        fontSize: config.text,
      }}>
        <Minus size={config.icon} />
        {showValue && <span>0%</span>}
      </span>
    );
  }
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      color: isPositive ? '#22c55e' : '#ef4444',
      fontSize: config.text,
      fontWeight: '500',
    }}>
      {isPositive ? (
        <TrendingUp size={config.icon} style={{ strokeWidth: 2.5 }} />
      ) : (
        <TrendingDown size={config.icon} style={{ strokeWidth: 2.5 }} />
      )}
      {showValue && (
        <span>{isPositive ? '+' : ''}{typeof value === 'number' ? value.toFixed(1) : value}%</span>
      )}
    </span>
  );
}

/**
 * Sparkline Component using SVG
 * Lightweight mini line chart for table cells
 */
export function Sparkline({ data = [], color = '#60C3C9', width = 80, height = 24 }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#8b8b9e', fontSize: '10px' }}>—</span>
      </div>
    );
  }
  
  const values = data.map(d => typeof d === 'object' ? (d.value ?? d.tokens ?? 0) : d);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // Generate path points
  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });
  
  const linePath = `M ${points.join(' L ')}`;
  
  // Gradient fill path (area under line)
  const areaPath = `M ${padding},${height - padding} L ${points.join(' L ')} L ${width - padding},${height - padding} Z`;
  
  // Determine trend color
  const isUptrend = values[values.length - 1] > values[0];
  const trendColor = isUptrend ? '#22c55e' : values[values.length - 1] < values[0] ? '#ef4444' : color;
  
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sparklineGradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#sparklineGradient-${color.replace('#', '')})`}
      />
      
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={trendColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* End point dot */}
      <circle
        cx={width - padding}
        cy={padding + chartHeight - ((values[values.length - 1] - min) / range) * chartHeight}
        r="2"
        fill={trendColor}
      />
    </svg>
  );
}

/**
 * MetricWithTrend Component
 * Combines a metric value with trend indicator
 */
export function MetricWithTrend({ value, trend, color = '#fff', format = 'number' }) {
  const formatValue = (val) => {
    if (format === 'percent') return `${val.toFixed(1)}%`;
    if (format === 'currency') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString('en-US');
    }
    if (typeof val === 'number') return val.toFixed(2);
    return val;
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ color, fontWeight: '600', fontSize: '14px' }}>
        {formatValue(value)}
      </span>
      <TrendIndicator value={trend} size="sm" />
    </div>
  );
}

export default { TrendIndicator, Sparkline, MetricWithTrend };
