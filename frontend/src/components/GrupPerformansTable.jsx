import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
  return n.toLocaleString('en-US');
}

export default function GrupPerformansTable({ period = 'monthly', viewType = 'ajans' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('total_tokens');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    setLoading(true);
    const filterType = viewType === 'uretici' ? 'team' : 'all';
    const url = api(`/api/grup-stats?period=${period}&filter_type=${filterType}`);
    console.log('[GrupPerformansTable] Fetching:', url);
    fetch(url)
      .then(r => {
        console.log('[GrupPerformansTable] Response status:', r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        console.log('[GrupPerformansTable] Data received:', d);
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('[GrupPerformansTable] Error:', err.message);
        setError(err.message);
        setLoading(false);
      });
  }, [period, viewType]);

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: '200px' }} />;
  }

  if (error) {
    return (
      <div className="card" style={{ marginTop: '24px', background: 'rgba(255,0,0,0.1)', border: '1px solid #f44' }}>
        <h3 style={{ color: '#f66', margin: 0 }}>❌ Group Performance Failed to Load</h3>
        <p style={{ color: '#aaa', margin: '8px 0 0' }}>Error: {error}</p>
        <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0' }}>
          Is the backend running? Check console (F12).
        </p>
      </div>
    );
  }

  // Toplam hesapla
  const totals = data.reduce((acc, r) => ({
    tokens: acc.tokens + r.total_tokens,
    hours: acc.hours + r.total_hours,
    count: acc.count + r.influencer_count,
  }), { tokens: 0, hours: 0, count: 0 });

  // Period etiketini oluştur
  const periodLabel = period === 'daily' ? 'Today' : period === 'weekly' ? 'This Week' : 'Last 30 Days';

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div className="card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 className="card-title">
          Agent Performance
        </h3>
        <span style={{
          fontSize: '12px',
          color: '#60C3C9',
          background: 'rgba(96,195,201,0.15)',
          padding: '4px 10px',
          borderRadius: '12px'
        }}>
          {periodLabel}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Group</th>
            <th>Agent</th>
            <th onClick={() => toggleSort('total_tokens')} style={{ cursor: 'pointer' }}>
              Tokens <span className="tooltip-icon" title="Total tokens earned">ⓘ</span>
              {sortBy === 'total_tokens' && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
            </th>
            <th onClick={() => toggleSort('influencer_count')} style={{ cursor: 'pointer' }}>
              Influencers
              {sortBy === 'influencer_count' && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
            </th>
            <th onClick={() => toggleSort('avg_abps')} style={{ cursor: 'pointer' }}>
              Avg RV <span className="tooltip-icon" title="Average Revenue Velocity">ⓘ</span>
              {sortBy === 'avg_abps' && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
            </th>
            <th onClick={() => toggleSort('avg_tis')} style={{ cursor: 'pointer' }}>
              Avg HF <span className="tooltip-icon" title="Average Hype Factor">ⓘ</span>
              {sortBy === 'avg_tis' && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
            </th>
            <th onClick={() => toggleSort('avg_cos')} style={{ cursor: 'pointer' }}>
              Avg SS <span className="tooltip-icon" title="Average Stream Stamina">ⓘ</span>
              {sortBy === 'avg_cos' && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.grup}>
              <td>
                <span style={{ marginRight: '8px', color: '#64748b' }}>▸</span>
                {r.grup}
              </td>
              <td style={{ color: '#8b8b9e' }}>-</td>
              <td style={{ color: '#60C3C9', fontWeight: '600' }}>{formatNumber(r.total_tokens)}</td>
              <td style={{ color: '#e2e8f0' }}>{r.influencer_count}</td>
              <td style={{ color: '#22c55e', fontWeight: '600' }}>{r.avg_abps?.toFixed(2)}</td>
              <td style={{ color: '#EC4A79', fontWeight: '600' }}>{r.avg_tis?.toFixed(2)}</td>
              <td style={{ color: '#a855f7', fontWeight: '600' }}>{r.avg_cos?.toFixed(2)}h</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
        Showing 1-{data.length} of {data.length}
      </div>
    </div>
  );
}
