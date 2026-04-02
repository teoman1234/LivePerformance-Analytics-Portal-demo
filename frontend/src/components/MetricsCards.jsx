import React from 'react';

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n?.toLocaleString('en-US') || '0';
}

export default function MetricsCards({ data, periodData, period }) {
  if (!data) return null;
  
  // Periyod verisi varsa onu kullan, yoksa ana veriyi kullan
  const summary = periodData?.summary || {};
  const hasPeriodData = !!periodData?.summary;
  
  // Periyod bazlı değerler
  const totalTokens = hasPeriodData ? summary.total_tokens : data.total_tokens;
  const activeInfluencers = hasPeriodData ? summary.total_users : data.active_influencers;
  // Saat hesabı: token / abps oranına göre (veya live_ratio'dan türet)
  const totalHours = hasPeriodData ? Math.round(summary.total_tokens / (summary.avg_abps || 1000)) : data.total_hours;
  const liveRatio = hasPeriodData ? summary.live_ratio : data.live_ratio;
  
  // Periyod etiketi
  const periodLabel = period === 'daily' ? 'today' : period === 'weekly' ? 'this week' : 'last 30 days';
  
  const cards = [
    {
      label: 'GROSS REVENUE (Tokens)',
      value: formatNumber(totalTokens),
      color: '#3b82f6',
      icon: '🪙',
      iconBg: '#3b82f6',
      change: hasPeriodData ? null : 12.5,
      periodInfo: hasPeriodData ? periodLabel : null,
    },
    {
      label: 'LIVE RATIO',
      value: `%${liveRatio?.toFixed ? liveRatio.toFixed(1) : liveRatio || 0}`,
      color: '#ef4444',
      icon: '📺',
      iconBg: '#ef4444',
      change: 0,
      periodInfo: hasPeriodData ? periodLabel : null,
    },
    {
      label: 'ACTIVE INFLUENCERS',
      value: activeInfluencers,
      color: '#22c55e',
      icon: '●',
      iconBg: '#22c55e',
      change: hasPeriodData ? null : 5.2,
      periodInfo: hasPeriodData ? periodLabel : null,
    },
    {
      label: 'TOTAL HOURS',
      value: formatNumber(totalHours),
      color: '#8b5cf6',
      icon: '⏱️',
      iconBg: '#8b5cf6',
      change: hasPeriodData ? null : 8.3,
      periodInfo: hasPeriodData ? periodLabel : null,
    },
  ];

  return (
    <div className="metrics-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
      {cards.map((c, i) => (
        <div className="metric-card" key={i} style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <div className="metric-header" style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: c.iconBg,
            }}></span>
            <span style={{fontSize:'11px',fontWeight:'600',color:'#8b8b9e',textTransform:'uppercase',letterSpacing:'0.5px'}}>
              {c.label}
            </span>
          </div>
          <div style={{fontSize:'36px',fontWeight:'700',color: c.color,marginBottom:'8px'}}>{c.value}</div>
          {c.periodInfo && (
            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <span style={{width:'12px',height:'12px',background:'#f59e0b',borderRadius:'2px'}}></span>
              <span style={{color:'#8b8b9e',fontSize:'11px'}}>for {c.periodInfo}</span>
            </div>
          )}
          {c.change !== null && c.change !== 0 && !c.periodInfo && (
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{color: c.change > 0 ? '#22c55e' : '#ef4444',fontSize:'12px'}}>↑ {Math.abs(c.change)}%</span>
              <span style={{color:'#8b8b9e',fontSize:'11px'}}>vs last month</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
