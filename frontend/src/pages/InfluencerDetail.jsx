import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import { api } from '../api.js';
import InfluencerCard from '../components/InfluencerCard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

function TrendChart({ data, label, color, type = 'line' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = data.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });
    const values = data.map(d => d.value);

    chartRef.current = new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: label,
          data: values,
          borderColor: color,
          backgroundColor: color + '20', // Transparent fill
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1a1a24',
            titleColor: '#fff',
            bodyColor: '#ccc',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            display: true,
            grid: { display: false, drawBorder: false },
            ticks: { color: '#666', font: { size: 10 }, maxTicksLimit: 6 }
          },
          y: {
            display: true,
            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { color: '#666', font: { size: 10 } }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, label, color, type]);

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function InfluencerDetail(){
  const { t } = useLanguage();
  const { username } = useParams();
  const [row, setRow] = useState(null);
  const [trend, setTrend] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [influencerRes, trendRes] = await Promise.all([
          fetch(api('/api/influencer/' + encodeURIComponent(username))),
          fetch(api('/api/history/trend?username=' + encodeURIComponent(username)))
        ]);

        if (!influencerRes.ok) throw new Error('Influencer not found');
        
        const influencerData = await influencerRes.json();
        const trendData = await trendRes.json();

        // Map backend fields to frontend expected fields
        influencerData.rv = influencerData.abps;
        influencerData.hf = influencerData.tis;
        influencerData.ss = influencerData.cos;

        setRow(influencerData);
        setTrend(trendData.trend || []);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if(loading) return <div className="content-wrapper"><div className="card"><div className="skeleton" style={{height:'300px'}} /></div></div>;
  if(error) return <div className="content-wrapper"><div className="card" style={{background:'rgba(236,74,121,0.15)',border:'1px solid #EC4A79'}}><h3 style={{color:'#EC4A79'}}>{t('common.error')}: {error}</h3></div></div>;

  // Prepare trend data
  const tokenTrend = trend.map(t => ({ date: t.date, value: t.tokens }));
  const abpsTrend = trend.map(t => ({ date: t.date, value: t.abps }));

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <Link to="/supervisor/influencers" style={{color:'#8b8b9e',fontSize:'13px',display:'flex',alignItems:'center',gap:'4px',marginBottom:'8px', textDecoration: 'none'}}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
            </svg>
            {t('influencerDetail.backToList')}
          </Link>
          <h1>{row.username}</h1>
          <p className="page-subtitle">
            <span style={{background:'rgba(255,255,255,0.1)',padding:'6px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',color:'#fff'}}>
              {t('agencyData.agent')}: {row.mentor}
            </span>
          </p>
        </div>
      </div>
      
      <div className="influencer-detail-grid">
        
        {/* Left Column: FIFA Card & Coach */}
        <div className="left-column">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <InfluencerCard data={row} />
          </div>
          
          <div className="card mt-24" style={{textAlign: 'center'}}>
            <h3 className="card-title" style={{marginBottom: '16px'}}>{t('influencer.aiCoach')}</h3>
            <div style={{fontSize: '14px', color: '#8b8b9e', fontStyle: 'italic', lineHeight: '1.6'}}>
              "{row.archetype === 'SNIPER' ? t('influencer.coachMessages.sniper') : 
                row.archetype === 'GRINDER' ? t('influencer.coachMessages.grinder') :
                row.archetype === 'RISING_STAR' ? t('influencer.coachMessages.risingStar') :
                row.archetype === 'UNICORN' ? t('influencer.coachMessages.unicorn') :
                t('influencer.coachMessages.standard')}"
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Stats */}
        <div className="right-column">
          
          {/* Quick Stats Grid */}
          <div className="metrics-grid">
            <div className="metric-card cyan">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <div className="metric-label">{t('influencerDetail.totalTokens')}</div>
                <div className="metric-value">{row.tokens?.toLocaleString('en-US')}</div>
              </div>
            </div>
            <div className="metric-card pink">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <div className="metric-label">{t('influencerDetail.totalHours')}</div>
                <div className="metric-value">{row.hours?.toFixed(1)} h</div>
              </div>
            </div>
            <div className="metric-card blue">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <div className="metric-label">{t('metrics.followers').toUpperCase()}</div>
                <div className="metric-value">{row.followers?.toLocaleString('en-US')}</div>
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('influencerDetail.performanceBreakdown')}</h3>
            </div>
            <div className="breakdown-grid">
              {/* RV */}
              <div className="breakdown-item" style={{borderColor: 'rgba(96,195,201,0.1)', background: 'rgba(96,195,201,0.05)'}}>
                <div className="breakdown-header">
                  <span style={{color: '#60C3C9'}}>RV (ABPS)</span>
                  <span style={{color: '#fff'}}>{row.rv?.toFixed(1)}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: `${Math.min(row.rv / 20, 100)}%`, background: '#60C3C9'}} />
                </div>
                <div className="breakdown-desc">{t('influencersList.revenueVelocity')}</div>
              </div>

              {/* HF */}
              <div className="breakdown-item" style={{borderColor: 'rgba(236,74,121,0.1)', background: 'rgba(236,74,121,0.05)'}}>
                <div className="breakdown-header">
                  <span style={{color: '#EC4A79'}}>HF (TIS)</span>
                  <span style={{color: '#fff'}}>{row.hf?.toFixed(1)}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: `${Math.min(row.hf / 30, 100)}%`, background: '#EC4A79'}} />
                </div>
                <div className="breakdown-desc">{t('influencersList.hypeFactor')}</div>
              </div>

              {/* SS */}
              <div className="breakdown-item" style={{borderColor: 'rgba(168,85,247,0.1)', background: 'rgba(168,85,247,0.05)'}}>
                <div className="breakdown-header">
                  <span style={{color: '#a855f7'}}>SS (COS)</span>
                  <span style={{color: '#fff'}}>{row.ss?.toFixed(1)}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: `${Math.min(row.ss * 20, 100)}%`, background: '#a855f7'}} />
                </div>
                <div className="breakdown-desc">{t('influencersList.streamStamina')}</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{t('influencerDetail.tokenTrend')}</h3>
              </div>
              <TrendChart data={tokenTrend} label="Tokens" color="#10b981" />
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{t('influencerDetail.efficiencyTrend')}</h3>
              </div>
              <TrendChart data={abpsTrend} label="ABPS" color="#3b82f6" />
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .influencer-detail-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 32px;
          align-items: start;
        }
        .left-column {
          flex: 1 1 300px;
          max-width: 100%;
        }
        .right-column {
          flex: 2 1 500px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0; /* Fix for chart resizing in flex item */
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }
        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
        }
        .breakdown-item {
          padding: 16px;
          border-radius: 12px;
          border: 1px solid;
        }
        .breakdown-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-weight: 700;
        }
        .progress-bar-bg {
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
        }
        .breakdown-desc {
          font-size: 11px;
          color: #8b8b9e;
          margin-top: 8px;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        
        @media (max-width: 768px) {
          .influencer-detail-grid {
            flex-direction: column;
          }
          .left-column {
            width: 100%;
            max-width: none;
          }
          .right-column {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

