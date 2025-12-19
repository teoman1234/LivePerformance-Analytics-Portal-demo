import React, { useState, useEffect, useRef, useId } from 'react';
import { Chart } from 'chart.js/auto';
import { api } from '../api.js';

/**
 * Performance Analysis Cards - With Mini Bar Chart
 * Displays ABPS, TIS, COS metrics professionally
 */

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n?.toLocaleString('en-US', { maximumFractionDigits: 1 }) || '0';
}

function MiniBarChart({ data, color, label, chartId }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const uniqueId = useId();

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    // Destroy previous chart if exists
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    
    // Show only top 10 mentors
    const topData = data.slice(0, 10);
    
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topData.map(d => d.mentor?.substring(0, 8) || 'N/A'),
        datasets: [{
          data: topData.map(d => d.value),
          backgroundColor: color + '80',
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(20,20,35,0.95)',
            titleColor: '#fff',
            bodyColor: '#aaa',
            borderColor: color,
            borderWidth: 1,
            callbacks: {
              title: (items) => topData[items[0].dataIndex]?.mentor || '',
              label: (item) => `${label}: ${item.raw?.toFixed(1)}`
            }
          }
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            beginAtZero: true,
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, color, label]);

  return (
    <div style={{ height: '100px', marginTop: '16px' }}>
      <canvas ref={canvasRef} id={chartId || uniqueId} />
    </div>
  );
}

function MetricCard({ code, value, label, formula, description, color, chartData, chartId }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="card"
      style={{ 
        position: 'relative',
        borderLeft: `3px solid ${color}`,
        background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '700',
          color: color,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
          }}></span>
          {code}
        </span>
        <span 
          style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)', 
            cursor: 'help',
            opacity: 0.7
          }}
          title={description}
        >
          ⓘ
        </span>
      </div>
      
      <div style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#fff',
        margin: '8px 0 4px',
        fontFamily: 'monospace'
      }}>
        {value}
      </div>
      
      <div style={{ 
        fontSize: '12px', 
        color: 'var(--text-secondary)',
        fontWeight: '500'
      }}>
        {label}
      </div>

      {/* Mini Bar Chart */}
      <MiniBarChart data={chartData} color={color} label={code} chartId={chartId} />

      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '12px 16px',
          background: 'rgba(20, 20, 35, 0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 1000,
          minWidth: '220px',
          maxWidth: '280px',
        }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: '600', 
            color: color,
            marginBottom: '6px'
          }}>
            {code} - {label}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#aaa',
            marginBottom: '8px',
            lineHeight: '1.4'
          }}>
            {description}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#888',
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.05)',
            padding: '6px 8px',
            borderRadius: '4px',
          }}>
            {formula}
          </div>
          {/* Tooltip arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(20, 20, 35, 0.98)',
          }} />
        </div>
      )}
    </div>
  );
}

export default function PerformanceMetrics({ data, onMetricClick, selectedMetric, periodData, period = 'monthly' }) {
  const [mentorData, setMentorData] = useState({ abps: [], tis: [], cos: [] });
  const [newInfluencers, setNewInfluencers] = useState(0);

  useEffect(() => {
    // Fetch mentor-based data
    fetch(api('/api/supervisor'))
      .then(r => r.json())
      .then(d => {
        const mentors = d.mentor_avg_abps || [];
        setMentorData({
          abps: mentors.map(m => ({ mentor: m.mentor, value: m.avg_abps || 0 })),
          tis: mentors.map(m => ({ mentor: m.mentor, value: m.avg_tis || 0 })),
          cos: mentors.map(m => ({ mentor: m.mentor, value: m.avg_cos || 0 })),
        });
      })
      .catch(() => {});
  }, []);
  
  // Parse joined_at format: "2025:11:30 18:16:50 (UTC+0)" -> Date
  const parseJoinedAt = (str) => {
    if (!str) return null;
    try {
      // "2025:11:30 18:16:50 (UTC+0)" format
      const match = str.match(/(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        const [, year, month, day, hour, min, sec] = match;
        return new Date(year, month - 1, day, hour, min, sec);
      }
      return null;
    } catch(e) {
      return null;
    }
  };

  // Calculate new influencers count based on period
  useEffect(() => {
    console.log('[PerformanceMetrics] period changed:', period);
    fetch(api('/api/influencers?limit=1000'))
      .then(r => r.json())
      .then(d => {
        const items = d.items || [];
        
        // Find the latest joined_at date
        let latestDate = null;
        items.forEach(i => {
          const jd = parseJoinedAt(i.joined_at);
          if (jd && (!latestDate || jd > latestDate)) {
            latestDate = jd;
          }
        });
        
        if (!latestDate) {
          console.log('[PerformanceMetrics] No valid dates found');
          setNewInfluencers(0);
          return;
        }
        
        let daysBack = 30; // default monthly
        if (period === 'daily') daysBack = 1;
        else if (period === 'weekly') daysBack = 7;
        
        const cutoffDate = new Date(latestDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
        console.log('[PerformanceMetrics] daysBack:', daysBack, 'latestDate:', latestDate.toISOString(), 'cutoff:', cutoffDate.toISOString());
        
        const newOnes = items.filter(i => {
          const joinDate = parseJoinedAt(i.joined_at);
          return joinDate && joinDate >= cutoffDate;
        });
        console.log('[PerformanceMetrics] Found newInfluencers:', newOnes.length);
        setNewInfluencers(newOnes.length);
      })
      .catch(() => setNewInfluencers(0));
  }, [period]);

  if (!data) return null;

  // If periodData exists use it, otherwise use data
  const summary = periodData?.summary || {};
  const hasPeriodData = !!periodData?.summary;
  
  const avgAbps = hasPeriodData ? summary.avg_abps : (data.avg_abps || 0);
  const avgTis = hasPeriodData ? summary.avg_tis : (data.avg_tis || 0);
  const avgCos = hasPeriodData ? summary.avg_cos : (data.avg_cos || 0);

  const cards = [
    {
      key: 'abps',
      label: 'AVG REVENUE VELOCITY (RV)',
      value: formatNumber(avgAbps),
      color: '#60C3C9',
      iconColor: '#60C3C9',
      change: 3.7,
      tooltip: 'Revenue Velocity\n(Tokens / Hour)',
      clickable: true,
    },
    {
      key: 'tis',
      label: 'AVG HYPE FACTOR (HF)',
      value: formatNumber(avgTis),
      color: '#EC4A79',
      iconColor: '#EC4A79',
      change: 3.7,
      tooltip: 'Hype Factor\n(Likes / Follower)',
      clickable: true,
    },
    {
      key: 'cos',
      label: 'AVG STREAM STAMINA (SS)',
      value: formatNumber(avgCos),
      color: '#a855f7',
      iconColor: '#a855f7',
      change: 3.7,
      tooltip: 'Stream Stamina\n(Hours / Day)',
      clickable: true,
    },
    {
      key: 'new',
      label: 'NEW INFLUENCERS',
      value: newInfluencers,
      color: '#f59e0b',
      iconColor: '#f59e0b',
      change: 3.7,
      tooltip: period === 'daily' ? 'New influencers joined\ntoday' : 
               period === 'weekly' ? 'New influencers joined\nthis week' : 
               'New influencers joined\nin the last 30 days',
      clickable: false,
    },
  ];

  return (
    <div style={{ marginTop: '24px' }}>
      <div className="metrics-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px' 
      }}>
        {cards.map((c, idx) => (
          <div 
            key={idx} 
            className={`${c.clickable ? 'metric-card-clickable' : 'metric-card'}${selectedMetric === c.key ? ' selected' : ''}`}
            onClick={() => c.clickable && onMetricClick && onMetricClick(c.key)}
            style={{
              '--card-accent-color': c.iconColor,
              '--card-glow-color': `${c.iconColor}20`,
              '--card-selected-bg': `${c.iconColor}12`,
              background: selectedMetric === c.key 
                ? `linear-gradient(135deg, ${c.iconColor}12 0%, ${c.iconColor}05 100%)` 
                : 'rgba(255,255,255,0.02)',
              border: selectedMetric === c.key ? `2px solid ${c.iconColor}` : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: c.iconColor,
              }}></span>
              <span style={{fontSize:'11px',fontWeight:'600',color:'#8b8b9e',textTransform:'uppercase',letterSpacing:'0.5px'}}>
                {c.label}
              </span>
              <span 
                className={`metric-tooltip-trigger${idx === cards.length - 1 ? ' tooltip-left' : ''}`}
                data-tooltip={c.tooltip}
                onClick={(e) => e.stopPropagation()}
                style={{marginLeft:'auto',fontSize:'12px',color:'rgba(255,255,255,0.5)',cursor:'help',position:'relative',zIndex:10}}
              >ⓘ</span>
            </div>
            <div style={{fontSize:'36px',fontWeight:'700',color: c.color,marginBottom:'8px'}}>{c.value}</div>
            <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{color:'#22c55e',fontSize:'12px'}}>↑ {c.change}%</span>
              <span style={{color:'#8b8b9e',fontSize:'11px'}}>vs last month</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
