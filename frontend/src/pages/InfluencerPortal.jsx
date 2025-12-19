import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import AICoachCard from '../components/AICoachCard.jsx';

/* ─────────────── Enhanced Trend Chart Component with Gradient ─────────────── */
function TrendChart({ data, label, color, type = 'line' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

    // Create gradient for area fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, hexToRgba(color, 0.4));
    gradient.addColorStop(0.5, hexToRgba(color, 0.15));
    gradient.addColorStop(1, hexToRgba(color, 0));

    const labels = data.map((item) => {
      const d = new Date(item.date);
      if (Number.isNaN(d.getTime())) return item.date;
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    chartRef.current = new Chart(ctx, {
      type,
      data: {
        labels,
        datasets: [{
          label,
          data: data.map((item) => item.value),
          borderColor: color,
          backgroundColor: type === 'bar' ? `${color}99` : gradient,
          borderWidth: type === 'bar' ? 0 : 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderRadius: type === 'bar' ? 6 : 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: color,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 14,
            displayColors: false,
            titleFont: { size: 13, weight: '600' },
            bodyFont: { size: 12 },
            callbacks: {
              title: function(context) {
                const item = data[context[0].dataIndex];
                if (item?.date) {
                  const d = new Date(item.date);
                  if (!isNaN(d.getTime())) {
                    return d.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                    });
                  }
                }
                return context[0].label;
              },
              label: function(context) {
                const value = context.parsed.y;
                return `${label}: ${formatChartValue(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { 
              color: '#64748b', 
              maxRotation: 0, 
              autoSkip: true, 
              maxTicksLimit: 8, 
              font: { size: 10 } 
            },
          },
          y: {
            grid: { color: 'rgba(148,163,184,0.08)' },
            ticks: { 
              color: '#64748b', 
              font: { size: 10 }, 
              padding: 8,
              callback: (v) => formatCompactValue(v),
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, label, color, type]);

  return (
    <div style={{ width: '100%', height: '240px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* ─────────────── Chart Helper Functions ─────────────── */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatChartValue(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function formatCompactValue(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

/* ─────────────── Number Formatter ─────────────── */
const numberFmt = (value, digits = 1) => {
  if (value === null || value === undefined) return '—';
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(digits)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(digits)}K`;
  return value.toLocaleString('en-US', { maximumFractionDigits: digits });
};

/* ─────────────── Main Component ─────────────── */
export default function InfluencerPortal({ user, showPerformance = false }) {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('monthly'); // Period filter state
  const [selectedMetric, setSelectedMetric] = useState('rv'); // 'rv', 'hf', 'ss'
  const chartRef = useRef(null);
  
  const fallbackUser = useMemo(() => {
    if (user) return user;
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (_) { return null; }
  }, [user]);

  const influencerUser = useMemo(() => {
    if (fallbackUser?.role === 'influencer') return fallbackUser;
    return null;
  }, [fallbackUser]);

  const [overrideUsername, setOverrideUsername] = useState(null);

  useEffect(() => {
    if (influencerUser && overrideUsername) setOverrideUsername(null);
  }, [influencerUser, overrideUsername]);

  const resolvedUsername = overrideUsername || influencerUser?.username || 'avg_demo_influencer';
  const isDemoAccount = !influencerUser || !!overrideUsername;

  const [profile, setProfile] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [profileRes, trendRes] = await Promise.all([
          fetch(api(`/api/influencer/${encodeURIComponent(resolvedUsername)}`)),
          fetch(api(`/api/history/trend?username=${encodeURIComponent(resolvedUsername)}`)),
        ]);

        if (!profileRes.ok) {
          if (!influencerUser) throw new Error('Could not load influencer data.');
          setOverrideUsername('avg_demo_influencer');
          return;
        }

        const profileData = await profileRes.json();
        const trendData = trendRes.ok ? await trendRes.json() : { trend: [] };

        if (!isMounted) return;

        const enriched = {
          ...profileData,
          rv: profileData.abps,
          hf: profileData.tis,
          ss: profileData.cos,
        };

        setProfile(enriched);
        setTrend((trendData.trend || []).slice(-60));
        setError('');
      } catch (err) {
        if (isMounted) {
          if (influencerUser && !overrideUsername) {
            setOverrideUsername('avg_demo_influencer');
            return;
          }
          setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [resolvedUsername, influencerUser, overrideUsername]);

  const trendTokens = trend.map((t) => ({ date: t.date, value: t.tokens }));
  const trendEfficiency = trend.map((t) => ({ date: t.date, value: t.abps }));
  const trendHF = trend.map((t) => ({ date: t.date, value: t.tis || t.hf || 0 }));
  const trendSS = trend.map((t) => ({ date: t.date, value: t.cos || t.ss || 0 }));

  // Get trend data based on selected metric
  const getSelectedTrendData = () => {
    switch(selectedMetric) {
      case 'rv': return trendEfficiency;
      case 'hf': return trendHF;
      case 'ss': return trendSS;
      default: return trendTokens;
    }
  };

  /* ─────────────── Loading State ─────────────── */
  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '80px', marginBottom: '24px', borderRadius: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />)}
        </div>
      </div>
    );
  }

  /* ─────────────── Error State ─────────────── */
  if (error) {
    return (
      <div style={{ padding: '32px', background: 'rgba(236,74,121,0.1)', border: '1px solid rgba(236,74,121,0.3)', borderRadius: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#EC4A79', marginBottom: '8px' }}>Error</h2>
        <p style={{ color: '#f87171', fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  /* ─────────────── Main Render ─────────────── */
  return (
    <div style={{ color: '#e5e7eb' }}>
      {/* ─────────────── Page Title ─────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px', color: '#fff' }}>
          {t('influencer.performanceDashboard')}
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          {t('influencer.trackYourMetrics')}
        </p>
      </div>

      {/* ─────────────── Period Filter (Same as Supervisor) ─────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {['daily', 'weekly', 'monthly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: period === p ? '1px solid rgba(96, 195, 201, 0.4)' : '1px solid transparent',
                background: period === p ? 'rgba(96, 195, 201, 0.15)' : 'transparent',
                color: period === p ? '#60C3C9' : '#8b8b9e',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: period === p ? '600' : '500',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {p === 'daily' ? t('supervisor.today') : p === 'weekly' ? t('supervisor.thisWeek') : t('supervisor.last30Days')}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────── Demo Notice ─────────────── */}
      {isDemoAccount && (
          <div style={{
            marginBottom: '20px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(96,195,201,0.12), rgba(96,195,201,0.04))',
            border: '1px solid rgba(96,195,201,0.25)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ fontSize: '24px' }}>👀</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#60C3C9' }}>{t('influencer.demoView')}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                {t('influencer.demoDescription')}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────── Top Stats Cards (Same style as Supervisor) ─────────────── */}
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
          {/* Gross Revenue */}
          <div className="metric-card" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#8b8b9e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('influencer.grossRevenue')}
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
              {numberFmt(profile?.tokens, 1)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
              <span style={{ color: '#8b8b9e', fontSize: '11px' }}>
                for {period === 'daily' ? 'today' : period === 'weekly' ? 'this week' : 'last 30 days'}
              </span>
            </div>
          </div>

          {/* Live Hours */}
          <div className="metric-card" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#8b8b9e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('influencer.liveHours')}
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>
              {(profile?.hours ?? 0).toFixed(1)}h
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
              <span style={{ color: '#8b8b9e', fontSize: '11px' }}>
                for {period === 'daily' ? 'today' : period === 'weekly' ? 'this week' : 'last 30 days'}
              </span>
            </div>
          </div>

          {/* Active Days */}
          <div className="metric-card" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#8b8b9e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('influencer.activeDays')}
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e', marginBottom: '8px' }}>
              {profile?.live_days ?? 0}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
              <span style={{ color: '#8b8b9e', fontSize: '11px' }}>
                for {period === 'daily' ? 'today' : period === 'weekly' ? 'this week' : 'last 30 days'}
              </span>
            </div>
          </div>

          {/* OVR Score */}
          <div className="metric-card" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#8b8b9e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('influencer.ovrScore')}
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>
              {profile?.ovr ?? '—'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#8b8b9e', fontSize: '11px' }}>
                {profile?.archetype || 'STANDARD'} tier
              </span>
            </div>
          </div>
        </div>

        {/* ─────────────── Performance Metrics Row (Clickable like Supervisor) ─────────────── */}
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
          {/* Revenue Velocity (RV) - Clickable */}
          <div 
            className={`metric-card-clickable${selectedMetric === 'rv' ? ' selected' : ''}`}
            onClick={() => {
              setSelectedMetric('rv');
              setTimeout(() => {
                if (chartRef.current) {
                  const elementPosition = chartRef.current.getBoundingClientRect().top + window.pageYOffset;
                  window.scrollTo({ top: elementPosition - 200, behavior: 'smooth' });
                }
              }, 100);
            }}
            style={{
              '--card-accent-color': '#60C3C9',
              '--card-glow-color': 'rgba(96,195,201,0.15)',
              '--card-selected-bg': 'rgba(96,195,201,0.1)',
              background: selectedMetric === 'rv' ? 'rgba(96,195,201,0.08)' : 'rgba(255,255,255,0.02)',
              border: selectedMetric === 'rv' ? '2px solid #60C3C9' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#60C3C9', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#60C3C9' }} />
                {t('influencer.avgRevenueVelocity')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'help', opacity: 0.7 }} title="Tokens per hour">ⓘ</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '8px 0 4px', fontFamily: 'monospace' }}>
              {(profile?.rv ?? 0).toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
              ↑ 3.7% vs last month
            </div>
          </div>

          {/* Hype Factor (HF) - Clickable */}
          <div 
            className={`metric-card-clickable${selectedMetric === 'hf' ? ' selected' : ''}`}
            onClick={() => {
              setSelectedMetric('hf');
              setTimeout(() => {
                if (chartRef.current) {
                  const elementPosition = chartRef.current.getBoundingClientRect().top + window.pageYOffset;
                  window.scrollTo({ top: elementPosition - 200, behavior: 'smooth' });
                }
              }, 100);
            }}
            style={{
              '--card-accent-color': '#EC4A79',
              '--card-glow-color': 'rgba(236,74,121,0.15)',
              '--card-selected-bg': 'rgba(236,74,121,0.1)',
              background: selectedMetric === 'hf' ? 'rgba(236,74,121,0.08)' : 'rgba(255,255,255,0.02)',
              border: selectedMetric === 'hf' ? '2px solid #EC4A79' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#EC4A79', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#EC4A79' }} />
                {t('influencer.avgHypeFactor')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'help', opacity: 0.7 }} title="Likes / followers ratio">ⓘ</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '8px 0 4px', fontFamily: 'monospace' }}>
              {numberFmt(profile?.hf ?? 0, 1)}
            </div>
            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
              ↑ 3.7% vs last month
            </div>
          </div>

          {/* Stream Stamina (SS) - Clickable */}
          <div 
            className={`metric-card-clickable${selectedMetric === 'ss' ? ' selected' : ''}`}
            onClick={() => {
              setSelectedMetric('ss');
              setTimeout(() => {
                if (chartRef.current) {
                  const elementPosition = chartRef.current.getBoundingClientRect().top + window.pageYOffset;
                  window.scrollTo({ top: elementPosition - 200, behavior: 'smooth' });
                }
              }, 100);
            }}
            style={{
              '--card-accent-color': '#a855f7',
              '--card-glow-color': 'rgba(168,85,247,0.15)',
              '--card-selected-bg': 'rgba(168,85,247,0.1)',
              background: selectedMetric === 'ss' ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.02)',
              border: selectedMetric === 'ss' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#a855f7', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#a855f7' }} />
                {t('influencer.avgStreamStamina')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'help', opacity: 0.7 }} title="Hours per live day">ⓘ</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '8px 0 4px', fontFamily: 'monospace' }}>
              {(profile?.ss ?? 0).toFixed(1)}
            </div>
            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
              ↑ 3.7% vs last month
            </div>
          </div>

          {/* Followers - Not clickable */}
          <div className="metric-card" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                {t('influencer.followers')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'help', opacity: 0.7 }} title="Your community">ⓘ</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '8px 0 4px', fontFamily: 'monospace' }}>
              {numberFmt(profile?.followers ?? 0, 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
              ↑ 3.7% vs last month
            </div>
          </div>
        </div>

        {/* ─────────────── Charts Grid ─────────────── */}
        <div ref={chartRef} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Performance Chart - Changes based on selected metric */}
          <div className="card span-2" style={{
            padding: '20px',
            background: 'rgba(15,23,42,0.5)',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                {t('influencer.dailyPerformance')}
                {/* Metric Badge - Like Supervisor */}
                <span
                  style={{
                    padding: '4px 12px',
                    background: selectedMetric === 'rv' ? 'rgba(96,195,201,0.2)' : selectedMetric === 'hf' ? 'rgba(236,74,121,0.2)' : 'rgba(168,85,247,0.2)',
                    color: selectedMetric === 'rv' ? '#60C3C9' : selectedMetric === 'hf' ? '#EC4A79' : '#a855f7',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    cursor: 'help',
                  }}
                  title={
                    selectedMetric === 'rv' 
                      ? 'Revenue Velocity: Tokens earned per hour streamed' 
                      : selectedMetric === 'hf' 
                      ? 'Hype Factor: Likes per follower ratio'
                      : 'Stream Stamina: Average hours per streaming day'
                  }
                >
                  {selectedMetric === 'rv' ? 'RV' : selectedMetric === 'hf' ? 'HF' : 'SS'}
                  <span style={{ marginLeft: '6px', fontSize: '10px', opacity: 0.7 }}>ⓘ</span>
                </span>
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>
                {period === 'daily' ? t('supervisor.today') : period === 'weekly' ? t('supervisor.thisWeek') : t('influencer.last30Days')}
              </span>
            </div>
            {trendTokens.length > 0 ? (
              <TrendChart 
                data={getSelectedTrendData()} 
                label={selectedMetric === 'rv' ? 'RV' : selectedMetric === 'hf' ? 'HF' : 'SS'} 
                color={selectedMetric === 'rv' ? '#60C3C9' : selectedMetric === 'hf' ? '#EC4A79' : '#a855f7'} 
                type="bar" 
              />
            ) : (
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                {t('common.noData')}
              </div>
            )}
          </div>

          {/* Quick Stats - Same style as Supervisor */}
          <div className="card" style={{
            padding: '20px',
            background: 'rgba(15,23,42,0.5)',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 16px' }}>{t('influencer.quickStats')}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {/* Mentor */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 18px',
                background: 'rgba(96,195,201,0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(96,195,201,0.15)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(96,195,201,0.2)',
                  borderRadius: '10px',
                  fontSize: '20px'
                }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>
                    {profile?.mentor || 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b8b9e' }}>{t('influencer.mentor')}</div>
                </div>
              </div>
              
              {/* Last Live */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 18px',
                background: 'rgba(236,74,121,0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(236,74,121,0.15)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(236,74,121,0.2)',
                  borderRadius: '10px',
                  fontSize: '20px'
                }}>📹</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>
                    {profile?.last_live || 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b8b9e' }}>{t('influencer.lastLive')}</div>
                </div>
              </div>
              
              {/* Total Likes */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 18px',
                background: 'rgba(34,197,94,0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(34,197,94,0.15)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(34,197,94,0.2)',
                  borderRadius: '10px',
                  fontSize: '20px'
                }}>❤️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>
                    {numberFmt(profile?.likes ?? 0, 0)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b8b9e' }}>Total Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────── Bottom Row: Efficiency Chart + Coach Note ─────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Efficiency Trend */}
          <div style={{
            padding: '20px',
            background: 'rgba(15,23,42,0.5)',
            border: '1px solid rgba(148,163,184,0.1)',
            borderRadius: '14px',
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>{t('influencer.efficiencyTrend')}</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{t('influencer.revenuePerHour')}</span>
            </div>
            {trendEfficiency.length > 0 ? (
              <TrendChart data={trendEfficiency} label="RV" color="#22c55e" type="line" />
            ) : (
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                {t('common.noData')}
              </div>
            )}
          </div>

          {/* AI Coach Note - Premium Design with Enhanced Animations */}
          <AICoachCard profile={profile} t={t} />
        </div>
    </div>
  );
}
