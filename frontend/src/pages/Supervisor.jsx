import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import MentorBarChart from '../components/MentorBarChart.jsx';
import TopBottomTables from '../components/TopBottomTables.jsx';
import MetricsCards from '../components/MetricsCards.jsx';
import PerformanceMetrics from '../components/PerformanceMetrics.jsx';
import GrupPerformansTable from '../components/GrupPerformansTable.jsx';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Supervisor(){
  const { t } = useLanguage();
  const [data,setData] = useState(null);
  const [metrics,setMetrics] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [performanceChartData, setPerformanceChartData] = useState(null); // Grafik için ayrı veri
  const [error,setError] = useState(null);
  const [loading,setLoading] = useState(true);
  const [period,setPeriod] = useState('monthly');
  const [viewType, setViewType] = useState('ajans'); // 'ajans' or 'uretici'
  const [selectedMetric, setSelectedMetric] = useState('abps'); // 'abps', 'tis', 'cos'
  const [performanceFilter, setPerformanceFilter] = useState('temsilci'); // 'temsilci', 'yayinci'
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [chartLimit, setChartLimit] = useState(20); // Grafik sınırı
  
  const chartRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setFilterDropdownOpen(false);
    if (filterDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [filterDropdownOpen]);

  // Initial data load
  useEffect(()=>{
    Promise.all([
      fetch(api('/api/supervisor')).then(r=>r.json()),
      fetch(api('/api/metrics')).then(r=>r.json()),
    ])
      .then(([sup, met])=>{ setData(sup); setMetrics(met); setLoading(false); })
      .catch(e=>{ setError(e.message); setLoading(false); });
  },[]);

  // Period-based data load - viewType'a göre filter_type belirle
  useEffect(() => {
    // viewType: 'ajans' = tüm ajans verileri (all), 'uretici' = sadece kendi ekibin (team)
    const filterType = viewType === 'uretici' ? 'team' : 'all';
    
    Promise.all([
      fetch(api(`/api/metrics/period?period=${period}&filter_type=${filterType}`)).then(r=>r.json()),
      fetch(api(`/api/chart/period?period=${period}&filter_type=${filterType}`)).then(r=>r.json()),
    ])
      .then(([periodRes, chartRes]) => {
        setPeriodData(periodRes);
        setChartData(chartRes);
      })
      .catch(e => console.error('Period data error:', e));
  }, [period, viewType]);

  // Performans grafiği için ayrı veri yükle
  useEffect(() => {
    // temsilci = mentor bazlı (mentors), yayinci = influencer bazlı (all)
    const chartFilterType = performanceFilter === 'temsilci' ? 'mentors' : 'all';
    
    fetch(api(`/api/metrics/period?period=${period}&filter_type=${chartFilterType}`))
      .then(r => r.json())
      .then(res => setPerformanceChartData(res))
      .catch(e => console.error('Performance chart data error:', e));
  }, [period, performanceFilter]);

  if(loading) return (
    <div className="metrics-grid">
      {[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{height:'120px'}}/>)}
    </div>
  );
  if(error) return <div className="alert alert-error">⚠️ Hata: {error}</div>;

  const mentorAvg = data.mentor_avg_abps || [];

  return (
    <>
      {/* Page Header with Title and Raw Data Link */}
      <div className="page-header" style={{marginBottom:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'16px'}}>
          <div>
            <h1 className="page-title" style={{margin:0}}>{t('supervisor.title')}</h1>
            <p className="page-subtitle" style={{margin:'4px 0 0 0'}}>
              {t('supervisor.subtitle')}
            </p>
          </div>
          <Link to="/supervisor/agency-data" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, rgba(96,195,201,0.15), rgba(236,74,121,0.15))',
            border: '1px solid rgba(96,195,201,0.3)',
            borderRadius: '10px',
            color: '#60C3C9',
            fontSize: '14px',
            fontWeight: '500',
            textDecoration: 'none',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}>
            {t('supervisor.rawData')}
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </Link>
        </div>
      </div>
      
      {/* Period Tabs & Ajans Filter - Redesigned as Segmented Control */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {['daily','weekly','monthly'].map(p=>(
            <button 
              key={p} 
              onClick={()=>setPeriod(p)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: period===p ? '1px solid rgba(96, 195, 201, 0.4)' : '1px solid transparent',
                background: period===p ? 'rgba(96, 195, 201, 0.15)' : 'transparent',
                color: period===p ? '#60C3C9' : '#8b8b9e',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: period===p ? '600' : '500',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {p==='daily'?t('supervisor.today'):p==='weekly'?t('supervisor.thisWeek'):t('supervisor.last30Days')}
            </button>
          ))}
        </div>
        
        {/* Ajans/Üretici Dropdown */}
        <div style={{position:'relative',flexShrink:0}}>
          <select
            value={viewType}
            onChange={e => setViewType(e.target.value)}
            style={{
              padding: '8px 36px 8px 14px',
              background: '#1a1a24',
              border: '1px solid rgba(96,195,201,0.4)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2360C3C9'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              minWidth: '140px'
            }}
          >
            <option value="ajans" style={{background:'#1a1a24',color:'#fff'}}>{t('supervisor.agencyView')}</option>
            <option value="uretici" style={{background:'#1a1a24',color:'#fff'}}>{t('supervisor.myInfluencers')}</option>
          </select>
        </div>
      </div>

      {/* Main Metrics - period verileriyle */}
      <MetricsCards data={metrics} periodData={periodData} period={period} />

      {/* Performance Analysis Cards */}
      <PerformanceMetrics 
        data={metrics} 
        periodData={periodData}
        period={period}
        selectedMetric={selectedMetric}
        onMetricClick={(metric) => {
          setSelectedMetric(metric);
          // Scroll - ABPS/TIS/COS kartları üstte görünsün, grafik hemen altında
          setTimeout(() => {
            const element = chartRef.current;
            if (element) {
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - 200; // 200px yukarıdan başla (kartlar görünsün)
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }, 100);
        }}
      />

      {/* Charts Section */}
      <div ref={chartRef} className="dashboard-grid mt-24">
        {/* Mentor Performance Chart */}
        <div className="card span-2">
          <div className="card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'12px'}}>
            <h3 className="card-title" style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
              {performanceFilter === 'yayinci' ? t('supervisor.influencerPerformance') : t('supervisor.agencyPerformance')}
              <span  
                className="metric-tooltip-trigger"
                data-tooltip={
                  selectedMetric === 'abps' 
                    ? 'Revenue Velocity (RV):\nMeasures revenue intensity relative to time spent streaming.' 
                    : selectedMetric === 'tis' 
                    ? 'Hype Factor (HF):\nMeasures engagement (likes) relative to follower count.'
                    : 'Stream Stamina (SS):\nMeasures the average session duration on streaming days.'
                }
                style={{
                  padding: '4px 12px',
                  background: selectedMetric === 'abps' ? 'rgba(96,195,201,0.2)' : selectedMetric === 'tis' ? 'rgba(236,74,121,0.2)' : 'rgba(168,85,247,0.2)',
                  color: selectedMetric === 'abps' ? '#60C3C9' : selectedMetric === 'tis' ? '#EC4A79' : '#a855f7',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  cursor: 'help',
                  position: 'relative',
                }}
              >
                {selectedMetric === 'abps' ? 'RV' : selectedMetric === 'tis' ? 'HF' : 'SS'}
                <span style={{
                  marginLeft: '6px',
                  fontSize: '10px',
                  opacity: 0.7,
                }}>ⓘ</span>
              </span>
            </h3>
            <div style={{position:'relative'}} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                style={{
                  padding: '10px 20px',
                  background: performanceFilter === 'yayinci' ? 'transparent' : 'rgba(40,40,50,0.9)',
                  border: performanceFilter === 'yayinci' ? '1px solid #60C3C9' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: filterDropdownOpen ? '8px 8px 0 0' : '8px',
                  color: performanceFilter === 'yayinci' ? '#60C3C9' : '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '180px',
                  justifyContent: 'space-between',
                }}
              >
                {performanceFilter === 'temsilci' ? t('supervisor.agencyView') : t('supervisor.influencerView')}
                <span style={{transform: filterDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>▼</span>
              </button>
              {filterDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'rgba(40,40,50,0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  overflow: 'hidden',
                  zIndex: 100,
                }}>
                  <button
                    onClick={() => {
                      setPerformanceFilter(performanceFilter === 'temsilci' ? 'yayinci' : 'temsilci');
                      setFilterDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 20px',
                      background: 'transparent',
                      border: 'none',
                      color: '#8b8b9e',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    {performanceFilter === 'temsilci' ? t('supervisor.influencerView') : t('supervisor.agencyView')}
                  </button>
                </div>
              )}
            </div>
            
            {/* Limit Selector */}
            <select
              value={chartLimit}
              onChange={e => setChartLimit(Number(e.target.value))}
              style={{
                padding: '8px 30px 8px 12px',
                background: '#1a1a24',
                border: '1px solid rgba(96,195,201,0.3)',
                borderRadius: '6px',
                color: '#8b8b9e',
                fontSize: '12px',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='%238b8b9e'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option value={10}>{t('supervisor.top10')}</option>
              <option value={20}>{t('supervisor.top20')}</option>
              <option value={30}>{t('supervisor.top30')}</option>
              <option value={50}>{t('supervisor.top50')}</option>
              <option value={100}>{t('supervisor.all')}</option>
            </select>
          </div>
          <MentorBarChart 
            items={performanceChartData?.data || (performanceFilter === 'yayinci' ? (data.top_influencers || []).slice(0, 60) : mentorAvg)} 
            metric={selectedMetric} 
            isInfluencer={performanceFilter === 'yayinci'}
            period={period}
            limit={chartLimit}
          />
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('supervisor.quickStats')}</h3>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0'}}>
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
              }}>📊</div>
              <div style={{flex: 1}}>
                <div style={{fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '2px'}}>
                  {performanceFilter === 'yayinci' ? (data.top_influencers?.length || 0) : mentorAvg.length}
                </div>
                <div style={{fontSize: '12px', color: '#8b8b9e'}}>
                  {performanceFilter === 'yayinci' ? t('supervisor.activeInfluencers') : t('supervisor.activeAgents')}
                </div>
              </div>
            </div>
            
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
              }}>💰</div>
              <div style={{flex: 1}}>
                <div style={{fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '2px'}}>
                  {(() => {
                    const items = performanceFilter === 'yayinci' ? (data.top_influencers || []) : mentorAvg;
                    const tokenField = performanceFilter === 'yayinci' ? 'tokens' : 'total_tokens';
                    const total = items.reduce((sum, item) => sum + (item[tokenField] || 0), 0);
                    return total.toLocaleString('tr-TR');
                  })()}
                </div>
                <div style={{fontSize: '12px', color: '#8b8b9e'}}>
                  {t('supervisor.totalTokens')}
                </div>
              </div>
            </div>
            
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
              }}>📈</div>
              <div style={{flex: 1}}>
                <div style={{fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '2px'}}>
                  {(() => {
                    const items = performanceFilter === 'yayinci' ? (data.top_influencers || []) : mentorAvg;
                    if (!items.length) return '0';
                    const field = performanceFilter === 'yayinci' 
                      ? selectedMetric 
                      : (selectedMetric === 'abps' ? 'avg_abps' : selectedMetric === 'tis' ? 'avg_tis' : 'avg_cos');
                    const avg = items.reduce((sum, item) => sum + (item[field] || 0), 0) / items.length;
                    return avg.toFixed(selectedMetric === 'abps' ? 1 : 2);
                  })()}
                </div>
                <div style={{fontSize: '12px', color: '#8b8b9e'}}>
                  {t('supervisor.average')} {selectedMetric.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group Performance Table */}
      <GrupPerformansTable period={period} viewType={viewType} />

      {/* Top/Bottom Performance Tables */}
      <div className="grid grid-2 mt-24">
        <TopBottomTables top={data.top_influencers} bottom={data.bottom_influencers} />
      </div>
    </>
  );
}
