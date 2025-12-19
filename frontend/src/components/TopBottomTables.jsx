import React from 'react';
import { Link } from 'react-router-dom';
import { TrendIndicator, Sparkline } from './TrendIndicators.jsx';

export default function TopBottomTables({ top = [], bottom = [] }){
  // Generate simulated sparkline data for each influencer
  const generateSparklineData = (baseValue) => {
    return Array.from({ length: 7 }, () => 
      Math.max(0, baseValue * (0.7 + Math.random() * 0.6))
    );
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{color:'#22c55e',display:'flex',alignItems:'center',gap:'8px'}}>
            <span>🏆</span> Top Performers
          </h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Influencer</th>
              <th>Agent</th>
              <th style={{ textAlign: 'right' }}>RV <span className="tooltip-icon" title="Tokens / Hour">ⓘ</span></th>
              <th style={{ textAlign: 'center' }}>Trend</th>
              <th style={{ textAlign: 'center' }}>30d</th>
            </tr>
          </thead>
          <tbody>
            {top.slice(0,10).map(r => {
              const trend = (Math.random() * 40 - 10); // Simulated trend
              return (
                <tr key={r.username}>
                  <td><Link to={'/influencer/'+r.username}>{r.username}</Link></td>
                  <td style={{color:'#8b8b9e'}}>{r.mentor}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{color:'#22c55e',fontWeight:'600'}}>{r.abps.toFixed(2)}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <TrendIndicator value={trend} size="sm" />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Sparkline data={generateSparklineData(r.abps)} color="#22c55e" width={60} height={20} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{color:'#EC4A79',display:'flex',alignItems:'center',gap:'8px'}}>
            <span>⚠️</span> Needs Improvement
          </h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Influencer</th>
              <th>Agent</th>
              <th style={{ textAlign: 'right' }}>RV <span className="tooltip-icon" title="Tokens / Hour">ⓘ</span></th>
              <th style={{ textAlign: 'center' }}>Trend</th>
              <th style={{ textAlign: 'center' }}>30d</th>
            </tr>
          </thead>
          <tbody>
            {bottom.slice(0,10).map(r => {
              const trend = (Math.random() * 30 - 20); // Simulated trend (more negative)
              return (
                <tr key={r.username}>
                  <td><Link to={'/influencer/'+r.username}>{r.username}</Link></td>
                  <td style={{color:'#8b8b9e'}}>{r.mentor}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{color:'#EC4A79',fontWeight:'600'}}>{r.abps.toFixed(2)}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <TrendIndicator value={trend} size="sm" />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Sparkline data={generateSparklineData(r.abps)} color="#EC4A79" width={60} height={20} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
