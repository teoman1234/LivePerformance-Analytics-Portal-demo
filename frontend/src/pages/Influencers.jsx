import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ABPS_LOW_THRESHOLD } from '../config.js';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Influencers(){
  const { t } = useLanguage();
  const [data,setData] = useState({ items: [], total: 0, limit: 50, offset: 0 });
  const [mentorList, setMentorList] = useState([]); // Tüm mentörler
  const [mentor,setMentor] = useState('');
  const [sort,setSort] = useState('abps');
  const [order,setOrder] = useState('desc');
  const [query,setQuery] = useState('');
  const [limit,setLimit] = useState(30);
  const [offset,setOffset] = useState(0);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  // Mentör listesini yükle (bir kez)
  useEffect(() => {
    fetch(api('/api/supervisor'))
      .then(r => r.json())
      .then(d => {
        const mentors = (d.mentor_avg_abps || []).map(x => x.mentor).filter(Boolean);
        setMentorList(mentors.sort());
      })
      .catch(e => console.error('Mentor list error:', e));
  }, []);

  function load(){
    setLoading(true);
    const params = new URLSearchParams();
    if(mentor) params.append('mentor', mentor);
    if(query) params.append('q', query);
    params.append('sort', sort);
    params.append('order', order);
    params.append('limit', limit);
    params.append('offset', offset);
    fetch(api('/api/influencers?'+params.toString()))
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false); })
      .catch(e=>{ setError(e.message); setLoading(false); });
  }

  useEffect(()=>{ load(); }, [mentor, sort, order, query, limit, offset]);

  // Stil sabitleri
  const selectStyle = {
    padding: '10px 36px 10px 14px',
    background: '#1a1a24',
    border: '1px solid rgba(96,195,201,0.3)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%2360C3C9'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    minWidth: '140px',
  };

  const inputStyle = {
    padding: '10px 14px',
    background: '#1a1a24',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    flex: 1,
    minWidth: '200px',
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <div>
          <h1>{t('influencersList.title')}</h1>
          <p className="page-subtitle">{t('influencersList.subtitle')}</p>
        </div>
      </div>
      
      <div className="card" style={{marginBottom:'24px'}}>
        <div className="card-header">
          <h3 className="card-title">{t('influencersList.filters')}</h3>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'center'}}>
          <select 
            value={mentor} 
            onChange={e=>{setMentor(e.target.value); setOffset(0);}}
            style={selectStyle}
          >
            <option value="">{t('influencersList.allAgents')} ({mentorList.length})</option>
            {mentorList.map(m => {
              // Shorten agent name (if email, take before @)
              const shortName = m.includes('@') ? m.split('@')[0] : m;
              return <option key={m} value={m}>{shortName}</option>;
            })}
          </select>
          <input 
            placeholder={t('influencersList.searchPlaceholder')} 
            value={query} 
            onChange={e=>{setQuery(e.target.value); setOffset(0);}} 
            style={inputStyle}
          />
          <select value={sort} onChange={e=>setSort(e.target.value)} style={selectStyle}>
            <option value="abps">RV ({t('influencersList.revenueVelocity')})</option>
            <option value="tis">HF ({t('influencersList.hypeFactor')})</option>
            <option value="cos">SS ({t('influencersList.streamStamina')})</option>
            <option value="tokens">{t('metrics.tokens')}</option>
            <option value="hours">{t('metrics.hours')}</option>
            <option value="followers">{t('metrics.followers')}</option>
            <option value="username">{t('influencersList.username')}</option>
          </select>
          <select value={order} onChange={e=>setOrder(e.target.value)} style={selectStyle}>
            <option value="desc">↓ {t('influencersList.descending')}</option>
            <option value="asc">↑ {t('influencersList.ascending')}</option>
          </select>
          <select value={limit} onChange={e=>{setLimit(Number(e.target.value)); setOffset(0);}} style={selectStyle}>
            {[30,50,100].map(n=> <option key={n} value={n}>{n}/{t('influencersList.page')}</option>)}
          </select>
          <button 
            className="btn" 
            onClick={load}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, rgba(96,195,201,0.2), rgba(96,195,201,0.1))',
              border: '1px solid rgba(96,195,201,0.4)',
              borderRadius: '8px',
              color: '#60C3C9',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            🔄 {t('influencersList.refresh')}
          </button>
        </div>
        {mentor && (
          <div style={{marginTop:'12px',display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'13px',color:'#8b8b9e'}}>{t('influencersList.activeFilter')}:</span>
            <span style={{
              padding: '4px 12px',
              background: 'rgba(96,195,201,0.15)',
              border: '1px solid rgba(96,195,201,0.3)',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#60C3C9',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {mentor.includes('@') ? mentor.split('@')[0] : mentor}
              <button 
                onClick={() => setMentor('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60C3C9',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  lineHeight: 1,
                }}
              >×</button>
            </span>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 className="card-title">{t('influencersList.title')}</h3>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <span style={{
              padding: '6px 14px',
              background: 'rgba(96,195,201,0.1)',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#60C3C9'
            }}>
              {t('influencersList.total')}: <strong>{data.total}</strong>
            </span>
            <span style={{
              padding: '6px 14px',
              background: 'rgba(168,85,247,0.1)',
              borderRadius: '20px',
              fontSize: '13px',
              color: '#a855f7'
            }}>
              {t('influencersList.page')}: {Math.floor(offset/limit)+1}/{Math.max(1, Math.ceil(data.total/limit))}
            </span>
          </div>
        </div>
        {loading && <div className="skeleton" style={{height:'200px'}} />}
        {error && <div className="warning" style={{background:'rgba(236,74,121,0.15)',color:'#EC4A79',padding:'12px',borderRadius:'8px'}}>{t('common.error')}: {error}</div>}
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'separate',borderSpacing:'0'}}>
            <thead>
              <tr style={{background:'rgba(255,255,255,0.03)'}}>
                <th style={{padding:'14px 16px',textAlign:'left',fontWeight:'600',color:'#fff',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{t('influencersList.influencer')}</th>
                <th style={{padding:'14px 16px',textAlign:'left',fontWeight:'600',color:'#fff',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{t('agencyData.agent')}</th>
                <th style={{padding:'14px 16px',textAlign:'right',fontWeight:'600',color:'#60C3C9',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{t('metrics.tokens')}</th>
                <th style={{padding:'14px 16px',textAlign:'right',fontWeight:'600',color:'#fff',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{t('metrics.hours')}</th>
                <th style={{padding:'14px 16px',textAlign:'right',fontWeight:'600',color:'#22c55e',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.08)',cursor:'help'}} title={t('influencersList.rvTooltip')}>RV ⓘ</th>
                <th style={{padding:'14px 16px',textAlign:'right',fontWeight:'600',color:'#EC4A79',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.08)',cursor:'help'}} title={t('influencersList.hfTooltip')}>HF ⓘ</th>
                <th style={{padding:'14px 16px',textAlign:'right',fontWeight:'600',color:'#a855f7',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.08)',cursor:'help'}} title={t('influencersList.ssTooltip')}>SS ⓘ</th>
                <th style={{padding:'14px 16px',textAlign:'right',fontWeight:'600',color:'#8b8b9e',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{t('influencersList.joined')}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r, idx) => (
                <tr 
                  key={r.username} 
                  style={{
                    background: r.abps < ABPS_LOW_THRESHOLD 
                      ? 'rgba(236,74,121,0.08)' 
                      : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,195,201,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = r.abps < ABPS_LOW_THRESHOLD 
                    ? 'rgba(236,74,121,0.08)' 
                    : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                >
                  <td style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <Link to={'/supervisor/influencer/'+r.username} style={{color:'#fff',textDecoration:'none',fontWeight:'500'}}>
                      {r.username}
                    </Link>
                  </td>
                  <td style={{padding:'12px 16px',color:'#8b8b9e',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    {r.mentor?.includes('@') ? r.mentor.split('@')[0] : r.mentor}
                  </td>
                  <td style={{padding:'12px 16px',textAlign:'right',color:'#60C3C9',fontWeight:'600',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    {r.tokens?.toLocaleString('en-US')}
                  </td>
                  <td style={{padding:'12px 16px',textAlign:'right',color:'#fff',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    {r.hours?.toFixed(1)}
                  </td>
                  <td style={{padding:'12px 16px',textAlign:'right',fontWeight:'600',color:'#22c55e',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    {r.abps?.toFixed(1)}
                  </td>
                  <td style={{padding:'12px 16px',textAlign:'right',color:'#EC4A79',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    {r.tis?.toFixed(1)}%
                  </td>
                  <td style={{padding:'12px 16px',textAlign:'right',color:'#a855f7',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    {r.cos?.toFixed(1)}h
                  </td>
                  <td style={{padding:'12px 16px',textAlign:'right',color:'#8b8b9e',fontSize:'12px',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    {r.joined_at ? r.joined_at.split(' ')[0].replace(/:/g, '-') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'16px',padding:'12px 0',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <span style={{display:'inline-block',width:'12px',height:'12px',background:'rgba(236,74,121,0.4)',borderRadius:'2px'}}></span>
          <span style={{fontSize:'12px',color:'#8b8b9e'}}>{t('influencersList.lowPerformanceNote', { threshold: ABPS_LOW_THRESHOLD })}</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'16px',paddingTop:'16px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <button 
            disabled={offset===0} 
            onClick={()=>setOffset(Math.max(0, offset - limit))}
            style={{
              padding: '10px 20px',
              background: offset === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(96,195,201,0.15)',
              border: '1px solid rgba(96,195,201,0.3)',
              borderRadius: '8px',
              color: offset === 0 ? '#8b8b9e' : '#60C3C9',
              fontWeight: '500',
              cursor: offset === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← {t('common.previous')}
          </button>
          <div style={{display:'flex',gap:'8px'}}>
            {Array.from({length: Math.min(5, Math.ceil(data.total/limit))}, (_, i) => {
              const currentPage = Math.floor(offset/limit);
              let pageNum;
              if (Math.ceil(data.total/limit) <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > Math.ceil(data.total/limit) - 4) {
                pageNum = Math.ceil(data.total/limit) - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setOffset(pageNum * limit)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: pageNum === currentPage ? '1px solid #60C3C9' : '1px solid rgba(255,255,255,0.1)',
                    background: pageNum === currentPage ? 'rgba(96,195,201,0.2)' : 'transparent',
                    color: pageNum === currentPage ? '#60C3C9' : '#8b8b9e',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          <button 
            disabled={offset + limit >= data.total} 
            onClick={()=>setOffset(offset + limit)}
            style={{
              padding: '10px 20px',
              background: offset + limit >= data.total ? 'rgba(255,255,255,0.05)' : 'rgba(96,195,201,0.15)',
              border: '1px solid rgba(96,195,201,0.3)',
              borderRadius: '8px',
              color: offset + limit >= data.total ? '#8b8b9e' : '#60C3C9',
              fontWeight: '500',
              cursor: offset + limit >= data.total ? 'not-allowed' : 'pointer',
            }}
          >
            {t('common.next')} →
          </button>
        </div>
      </div>
    </div>
  );
}
