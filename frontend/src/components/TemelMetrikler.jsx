import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function TemelMetrikler(){
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ajanslar');

  useEffect(()=>{
    fetch(api('/api/temel-metrikler'))
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false); })
      .catch(()=> setLoading(false));
  },[]);

  if(loading) return <div className="card"><div className="skeleton" style={{height:'300px'}} /></div>;
  if(!data) return null;

  const formatNumber = (n) => {
    if(n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if(n >= 1000) return (n/1000).toFixed(1) + 'K';
    return n.toLocaleString('en-US');
  };

  return (
    <div className="card" style={{marginTop:'24px'}}>
      <div className="card-header" style={{borderBottom:'1px solid rgba(255,255,255,0.08)',paddingBottom:'16px',marginBottom:'0'}}>
        <h3 className="card-title" style={{
          background:'linear-gradient(90deg,#60C3C9,#EC4A79)',
          WebkitBackgroundClip:'text',
          WebkitTextFillColor:'transparent',
          fontSize:'18px',
          fontWeight:'700'
        }}>
          Key Metrics
        </h3>
      </div>
      
      {/* Summary Cards */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(4, 1fr)',
        gap:'16px',
        padding:'20px 0',
        borderBottom:'1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'28px',fontWeight:'700',color:'#60C3C9'}}>{data.ozet.ajans_sayisi}</div>
          <div style={{fontSize:'12px',color:'#8b8b9e',marginTop:'4px'}}>Agency</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'28px',fontWeight:'700',color:'#EC4A79'}}>{data.ozet.uretici_sayisi}</div>
          <div style={{fontSize:'12px',color:'#8b8b9e',marginTop:'4px'}}>Influencer</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'28px',fontWeight:'700',color:'#22c55e'}}>{formatNumber(data.ozet.toplam_token)}</div>
          <div style={{fontSize:'12px',color:'#8b8b9e',marginTop:'4px'}}>Total Tokens</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'28px',fontWeight:'700',color:'#a855f7'}}>{formatNumber(data.ozet.toplam_saat)}</div>
          <div style={{fontSize:'12px',color:'#8b8b9e',marginTop:'4px'}}>Total Hours</div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div style={{display:'flex',gap:'8px',padding:'16px 0',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <button 
          onClick={()=>setActiveTab('ajanslar')}
          style={{
            padding:'8px 20px',
            borderRadius:'8px',
            border:'none',
            cursor:'pointer',
            fontSize:'13px',
            fontWeight:'600',
            background: activeTab === 'ajanslar' ? 'linear-gradient(135deg,#60C3C9,#EC4A79)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'ajanslar' ? '#fff' : '#8b8b9e',
            transition:'all 0.2s'
          }}
        >
          Your Agencies ({data.ajanslar.length})
        </button>
        <button 
          onClick={()=>setActiveTab('ureticiler')}
          style={{
            padding:'8px 20px',
            borderRadius:'8px',
            border:'none',
            cursor:'pointer',
            fontSize:'13px',
            fontWeight:'600',
            background: activeTab === 'ureticiler' ? 'linear-gradient(135deg,#60C3C9,#EC4A79)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'ureticiler' ? '#fff' : '#8b8b9e',
            transition:'all 0.2s'
          }}
        >
          Influencers ({data.gruplar.length} groups)
        </button>
      </div>

      {/* Content */}
      <div style={{padding:'16px 0'}}>
        {activeTab === 'ajanslar' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:'12px'}}>
            {data.ajanslar.map((ajans, i) => (
              <div key={i} style={{
                padding:'16px',
                borderRadius:'12px',
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)',
                transition:'all 0.2s'
              }}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                  <div style={{
                    width:'36px',
                    height:'36px',
                    borderRadius:'8px',
                    background:'linear-gradient(135deg,#60C3C9,#EC4A79)',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:'14px',
                    fontWeight:'700'
                  }}>
                    {ajans.ad.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'#fff'}}>{ajans.ad.replace('@gmail.com','')}</div>
                    <div style={{fontSize:'11px',color:'#8b8b9e'}}>{ajans.uretici_sayisi} influencers</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                  <div style={{textAlign:'center',padding:'8px',background:'rgba(96,195,201,0.1)',borderRadius:'8px'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#60C3C9'}}>{formatNumber(ajans.toplam_token)}</div>
                    <div style={{fontSize:'10px',color:'#8b8b9e'}}>Tokens</div>
                  </div>
                  <div style={{textAlign:'center',padding:'8px',background:'rgba(236,74,121,0.1)',borderRadius:'8px'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#EC4A79'}}>{ajans.toplam_saat.toFixed(0)}h</div>
                    <div style={{fontSize:'10px',color:'#8b8b9e'}}>Hours</div>
                  </div>
                  <div style={{textAlign:'center',padding:'8px',background:'rgba(34,197,94,0.1)',borderRadius:'8px'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#22c55e'}}>{ajans.ortalama_abps}</div>
                    <div style={{fontSize:'10px',color:'#8b8b9e'}}>RV</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ureticiler' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:'12px'}}>
            {data.gruplar.map((grup, i) => (
              <div key={i} style={{
                padding:'16px',
                borderRadius:'12px',
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)',
                transition:'all 0.2s'
              }}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                  <div style={{
                    width:'36px',
                    height:'36px',
                    borderRadius:'8px',
                    background:'linear-gradient(135deg,#a855f7,#EC4A79)',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:'14px'
                  }}>
                    🎬
                  </div>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'#fff'}}>{grup.ad}</div>
                    <div style={{fontSize:'11px',color:'#8b8b9e'}}>{grup.uretici_sayisi} influencers</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                  <div style={{textAlign:'center',padding:'8px',background:'rgba(168,85,247,0.1)',borderRadius:'8px'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#a855f7'}}>{formatNumber(grup.toplam_token)}</div>
                    <div style={{fontSize:'10px',color:'#8b8b9e'}}>Tokens</div>
                  </div>
                  <div style={{textAlign:'center',padding:'8px',background:'rgba(236,74,121,0.1)',borderRadius:'8px'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#EC4A79'}}>{grup.toplam_saat.toFixed(0)}h</div>
                    <div style={{fontSize:'10px',color:'#8b8b9e'}}>Hours</div>
                  </div>
                  <div style={{textAlign:'center',padding:'8px',background:'rgba(34,197,94,0.1)',borderRadius:'8px'}}>
                    <div style={{fontSize:'14px',fontWeight:'600',color:'#22c55e'}}>{grup.ortalama_abps}</div>
                    <div style={{fontSize:'10px',color:'#8b8b9e'}}>RV</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
