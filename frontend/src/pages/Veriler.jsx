import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { MetricFilter } from '../components/SegmentedControl.jsx';
import { TrendIndicator, Sparkline } from '../components/TrendIndicators.jsx';

export default function Veriler(){
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [periodData, setPeriodData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '01.11.2025', end: '28.11.2025' });
  
  // Metric selections (checkboxes)
  const [selectedMetrics, setSelectedMetrics] = useState({
    tokens: true,
    hours: false,
    abps: false,
    tis: false,
    cos: false,
    followers: false,
  });
  
  // Team filters
  const [filterType, setFilterType] = useState('temsilci'); // 'temsilci' or 'grup'
  const [selectedFilter, setSelectedFilter] = useState('');
  
  // Influencer details
  const [influencers, setInfluencers] = useState([]);
  const [teamData, setTeamData] = useState([]);

  // Period mapping
  const periodMap = { 'Today': 'daily', 'This Week': 'weekly', 'Last 30 Days': 'monthly' };

  useEffect(() => {
    Promise.all([
      fetch(api('/api/temel-metrikler')).then(r => r.json()),
      fetch(api('/api/influencers?limit=500')).then(r => r.json()),
      fetch(api('/api/metrics')).then(r => r.json()),
    ])
      .then(([temel, inf, met]) => {
        setData({ ...temel, metrics: met });
        setInfluencers(inf.items || []);
        
        // Prepare team data
        const team = temel.ajanslar.map(a => {
          const ajansInfluencers = inf.items.filter(i => i.mentor === a.ad);
          return {
            ...a,
            influencers: ajansInfluencers,
          };
        });
        setTeamData(team);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch data when period changes
  useEffect(() => {
    const periodKey = periodMap[period] || 'monthly';
    fetch(api(`/api/metrics/period?period=${periodKey}&filter_type=all`))
      .then(r => r.json())
      .then(res => {
        setPeriodData(res);
        // Use period data
        if (res.data) {
          // Convert period data to influencer list
          setInfluencers(res.data.map(d => ({
            username: d.username,
            mentor: d.mentor,
            tokens: d.tokens,
            hours: d.hours,
            abps: d.abps,
            tis: d.tis,
            cos: d.cos,
            followers: d.followers,
          })));
        }
      })
      .catch(e => console.error('Period data error:', e));
  }, [period]);

  const formatNumber = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
    return n?.toLocaleString('en-US') || '0';
  };

  const formatPercent = (n, positive = true) => {
    const color = positive ? '#22c55e' : '#ef4444';
    const arrow = positive ? '▲' : '▼';
    return <span style={{ color, fontSize: '11px' }}>{arrow} %{Math.abs(n).toFixed(2)}</span>;
  };

  // Filtered team data
  const filteredTeamData = React.useMemo(() => {
    if (!selectedFilter) return teamData;
    
    if (filterType === 'temsilci') {
      return teamData.filter(t => t.ad === selectedFilter);
    } else {
      // Group filter - filter influencers by group
      return teamData.map(t => ({
        ...t,
        influencers: t.influencers.filter(i => i.grup === selectedFilter || !selectedFilter),
      })).filter(t => t.influencers.length > 0);
    }
  }, [teamData, filterType, selectedFilter]);

  // Calculate total statistics
  const totals = React.useMemo(() => {
    const items = influencers;
    return {
      tokens: items.reduce((s, i) => s + (i.tokens || 0), 0),
      hours: items.reduce((s, i) => s + (i.hours || 0), 0),
      abps: items.length > 0 ? items.reduce((s, i) => s + (i.abps || 0), 0) / items.length : 0,
      followers: items.reduce((s, i) => s + (i.followers || 0), 0),
      likes: items.reduce((s, i) => s + (i.likes || 0), 0),
    };
  }, [influencers]);

  if (loading) return (
    <div className="content-wrapper">
      <div className="skeleton" style={{ height: '400px' }} />
    </div>
  );

  // Unique groups and agents
  const gruplar = [...new Set(influencers.map(i => i.grup).filter(Boolean))];
  const temsilciler = [...new Set(influencers.map(i => i.mentor).filter(Boolean))];

  // Metric configuration for new filter component
  const metricOptions = [
    { key: 'tokens', label: t('metrics.tokens'), color: '#60C3C9', tooltip: t('agencyData.tooltips.tokens') },
    { key: 'hours', label: t('metrics.broadcastTime'), color: '#a855f7', tooltip: t('agencyData.tooltips.hours') },
    { key: 'abps', label: 'RV', color: '#22c55e', tooltip: t('agencyData.tooltips.rv') },
    { key: 'tis', label: 'HF', color: '#EC4A79', tooltip: t('agencyData.tooltips.hf') },
    { key: 'cos', label: 'SS', color: '#f59e0b', tooltip: t('agencyData.tooltips.ss') },
    { key: 'followers', label: t('metrics.followers'), color: '#3b82f6', tooltip: t('agencyData.tooltips.followers') },
  ];

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{t('agencyData.title')}</h1>
          <p style={{ fontSize: '13px', color: '#8b8b9e', margin: 0 }}>View and analyze agency performance data</p>
        </div>
        <Link to="/supervisor" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
          {t('common.back')}
        </Link>
      </div>

      {/* Period Tabs - Redesigned as Segmented Control */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {[
            { key: 'Today', label: t('supervisor.today') },
            { key: 'This Week', label: t('supervisor.thisWeek') },
            { key: 'Last 30 Days', label: t('supervisor.last30Days') }
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: period === p.key ? '1px solid rgba(96, 195, 201, 0.4)' : '1px solid transparent',
                background: period === p.key ? 'rgba(96, 195, 201, 0.15)' : 'transparent',
                color: period === p.key ? '#60C3C9' : '#8b8b9e',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: period === p.key ? '600' : '500',
                transition: 'all 0.2s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {periodData && (
          <span style={{ 
            color: '#8b8b9e', 
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <span style={{ color: '#60C3C9' }}>📅</span>
            {periodData.start_date} - {periodData.end_date} 
            <span style={{ 
              marginLeft: '4px',
              padding: '2px 8px',
              background: 'rgba(96, 195, 201, 0.15)',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#60C3C9',
            }}>
              {periodData.summary?.total_users || 0} {t('common.users')}
            </span>
          </span>
        )}
      </div>

      {/* Metric Selection - Redesigned as Pill Filters */}
      <MetricFilter 
        metrics={metricOptions}
        selectedMetrics={selectedMetrics}
        onToggle={(key) => setSelectedMetrics({...selectedMetrics, [key]: !selectedMetrics[key]})}
      />

      {/* Your Influencers Section */}
      <div className="card" style={{ marginBottom: '24px', marginTop: '24px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '20px',
          color: '#fff'
        }}>
          {t('agencyData.yourInfluencers')}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '16px' 
        }}>
          {/* Token */}
          {selectedMetrics.tokens && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b8b9e', marginBottom: '8px' }}>{t('metrics.tokens')}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#60C3C9' }}>{formatNumber(totals.tokens)}</div>
              {formatPercent(45.5, true)}
            </div>
          )}
          {/* Hours */}
          {selectedMetrics.hours && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b8b9e', marginBottom: '8px' }}>{t('metrics.broadcastTime')}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#EC4A79' }}>{formatNumber(totals.hours)}h</div>
              {formatPercent(49.1, true)}
            </div>
          )}
          {/* ABPS */}
          {selectedMetrics.abps && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b8b9e', marginBottom: '8px' }}>{t('metrics.avgRV')}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>{totals.abps.toFixed(0)}</div>
              {formatPercent(2.47, true)}
            </div>
          )}
          {/* TIS */}
          {selectedMetrics.tis && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b8b9e', marginBottom: '8px' }}>{t('metrics.avgHF')}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#a855f7' }}>{data?.metrics?.avg_tis?.toFixed(1)}%</div>
              {formatPercent(37.03, false)}
            </div>
          )}
          {/* COS */}
          {selectedMetrics.cos && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b8b9e', marginBottom: '8px' }}>{t('metrics.avgSS')}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{data?.metrics?.avg_cos?.toFixed(1)}h</div>
              {formatPercent(45.23, false)}
            </div>
          )}
          {/* Followers */}
          {selectedMetrics.followers && (
            <div>
              <div style={{ fontSize: '12px', color: '#8b8b9e', marginBottom: '8px' }}>{t('metrics.followers')}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{formatNumber(totals.followers)}</div>
              {formatPercent(12.3, true)}
            </div>
          )}
        </div>
      </div>

      {/* Your Team Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>{t('agencyData.yourTeam')}</h3>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Filter Type Dropdown */}
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setSelectedFilter(''); }}
              style={{
                padding: '10px 16px',
                background: '#1a1a24',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                minWidth: '130px',
                outline: 'none'
              }}
            >
              <option value="temsilci" style={{ background: '#1a1a24', color: '#fff' }}>{t('agencyData.agent')}</option>
              <option value="grup" style={{ background: '#1a1a24', color: '#fff' }}>{t('agencyData.group')}</option>
            </select>
            
            {/* Filter Value Dropdown - positioned to open downward */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedFilter}
                onChange={e => setSelectedFilter(e.target.value)}
                style={{
                  padding: '10px 16px',
                  background: '#1a1a24',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '200px',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  paddingRight: '36px',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center'
                }}
              >
                <option value="" style={{ background: '#1a1a24', color: '#fff' }}>{t('common.select')}</option>
                {filterType === 'temsilci' ? (
                  <>
                    <option value="" style={{ background: '#1a1a24', color: '#fff' }}>{t('agencyData.noAgent')}</option>
                    {temsilciler.map(t => (
                      <option key={t} value={t} style={{ background: '#1a1a24', color: '#fff' }}>{t}</option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="" style={{ background: '#1a1a24', color: '#fff' }}>SUPERSTAR-TR</option>
                    {gruplar.map(g => (
                      <option key={g} value={g} style={{ background: '#1a1a24', color: '#fff' }}>{g}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Team Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b8b9e', fontSize: '12px', fontWeight: '500' }}>{t('agencyData.group')}</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#8b8b9e', fontSize: '12px', fontWeight: '500' }}>{t('agencyData.agent')}</th>
                {selectedMetrics.tokens && <th style={{ padding: '12px', textAlign: 'right', color: '#8b8b9e', fontSize: '12px', fontWeight: '500' }}>{t('metrics.tokens')}</th>}
                {selectedMetrics.tokens && <th style={{ padding: '12px', textAlign: 'center', color: '#8b8b9e', fontSize: '12px', fontWeight: '500' }}>Trend</th>}
                {selectedMetrics.hours && <th style={{ padding: '12px', textAlign: 'right', color: '#8b8b9e', fontSize: '12px', fontWeight: '500' }}>{t('metrics.broadcastTime')}</th>}
                {selectedMetrics.abps && <th style={{ padding: '12px', textAlign: 'right', color: '#8b8b9e', fontSize: '12px', fontWeight: '500' }}>{t('metrics.avgRV')}</th>}
                {selectedMetrics.tis && <th style={{ padding: '12px', textAlign: 'right', color: '#8b8b9e', fontSize: '12px', fontWeight: '500' }}>{t('metrics.avgHF')}</th>}
                {selectedMetrics.cos && <th style={{ padding: '12px', textAlign: 'right', color: '#8b8b9e', fontSize: '12px', fontWeight: '500' }}>{t('metrics.avgSS')}</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTeamData.map((team, idx) => {
                // Find groups for each agent
                const teamGrups = [...new Set(team.influencers.map(i => i.grup).filter(Boolean))];
                const grup = teamGrups[0] || '-';
                const teamTokens = team.influencers.reduce((s, i) => s + (i.tokens || 0), 0);
                const teamHours = team.influencers.reduce((s, i) => s + (i.hours || 0), 0);
                const teamAbps = team.influencers.length > 0 
                  ? team.influencers.reduce((s, i) => s + (i.abps || 0), 0) / team.influencers.length 
                  : 0;
                const teamTis = team.influencers.length > 0 
                  ? team.influencers.reduce((s, i) => s + (i.tis || 0), 0) / team.influencers.length 
                  : 0;
                const teamCos = team.influencers.length > 0 
                  ? team.influencers.reduce((s, i) => s + (i.cos || 0), 0) / team.influencers.length 
                  : 0;
                
                // Simulated trend values (would come from historical data in real app)
                const trends = {
                  tokens: Math.random() * 100 - 20,
                  hours: Math.random() * 100 - 30,
                  abps: Math.random() * 50 - 25,
                  tis: Math.random() * 40 - 20,
                  cos: Math.random() * 30 - 15,
                };

                // Generate sparkline data (simulated - would come from historical API)
                const generateSparklineData = () => Array.from({ length: 7 }, () => Math.random() * teamTokens / 7 + teamTokens / 14);
                const sparklineData = generateSparklineData();
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ color: '#60C3C9', fontSize: '13px' }}>{grup}</span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ color: '#fff', fontSize: '13px' }}>{team.ad.replace('@gmail.com', '').replace('@icloud.com', '').replace('@hotmail.com', '')}</span>
                    </td>
                    {selectedMetrics.tokens && (
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ color: '#60C3C9', fontWeight: '600', fontSize: '14px' }}>{formatNumber(teamTokens)}</span>
                          <TrendIndicator value={trends.tokens} size="sm" />
                        </div>
                      </td>
                    )}
                    {selectedMetrics.tokens && (
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <Sparkline data={sparklineData} color="#60C3C9" width={70} height={24} />
                      </td>
                    )}
                    {selectedMetrics.hours && (
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ color: '#a855f7', fontWeight: '600', fontSize: '14px' }}>{teamHours.toFixed(0)}h</span>
                          <TrendIndicator value={trends.hours} size="sm" />
                        </div>
                      </td>
                    )}
                    {selectedMetrics.abps && (
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '14px' }}>{teamAbps.toFixed(0)}</span>
                          <TrendIndicator value={trends.abps} size="sm" />
                        </div>
                      </td>
                    )}
                    {selectedMetrics.tis && (
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ color: '#EC4A79', fontWeight: '600', fontSize: '14px' }}>{teamTis.toFixed(1)}%</span>
                          <TrendIndicator value={trends.tis} size="sm" />
                        </div>
                      </td>
                    )}
                    {selectedMetrics.cos && (
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>{teamCos.toFixed(1)}h</span>
                          <TrendIndicator value={trends.cos} size="sm" />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
