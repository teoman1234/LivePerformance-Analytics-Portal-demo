import React, { useState, useEffect } from 'react';

const API_BASE = 'http://127.0.0.1:8001';
const api = (path) => `${API_BASE}${path}`;

const initialOverrideStats = {
  total_tokens: 0,
  broadcast_rate: 0,
  active_influencers: 0,
  total_hours: 0,
  avg_abps: 0,
  avg_tis: 0,
  avg_cos: 0,
  new_influencers: 0,
};

export default function DevPanel() {
  // Dashboard Override State
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(initialOverrideStats);

  // Users State
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    display_name: '',
    role: 'user',
    email: '',
    phone: '',
  });

  // File Upload State
  const [uploadStatus, setUploadStatus] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  const normalizeStats = (stats = {}) => ({
    total_tokens: stats.total_tokens ?? initialOverrideStats.total_tokens,
    broadcast_rate: stats.broadcast_rate ?? initialOverrideStats.broadcast_rate,
    active_influencers: stats.active_influencers ?? stats.active_creators ?? initialOverrideStats.active_influencers,
    total_hours: stats.total_hours ?? initialOverrideStats.total_hours,
    avg_abps: stats.avg_abps ?? initialOverrideStats.avg_abps,
    avg_tis: stats.avg_tis ?? initialOverrideStats.avg_tis,
    avg_cos: stats.avg_cos ?? initialOverrideStats.avg_cos,
    new_influencers: stats.new_influencers ?? stats.new_creators ?? initialOverrideStats.new_influencers,
  });

  // Load data on mount
  useEffect(() => {
    loadUsers();
    loadOverrideSettings();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch(api('/api/admin/users'));
      if (res.ok) {
        const data = await res.json();
        console.log('Users data:', data);
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadOverrideSettings = async () => {
    try {
      const res = await fetch(api('/api/admin/dashboard-override'));
      if (res.ok) {
        const data = await res.json();
        setOverrideEnabled(data.enabled);
        setDashboardStats(normalizeStats(data.stats));
      }
    } catch (err) {
      console.error('Failed to load override settings:', err);
    }
  };

  // Dashboard Override Functions
  const saveOverrideSettings = async () => {
    try {
      const res = await fetch(api('/api/admin/dashboard-override'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: overrideEnabled,
          stats: dashboardStats,
        }),
      });
      if (res.ok) {
        alert('Dashboard settings saved!');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // User Management Functions
  const createUser = async () => {
    try {
      const res = await fetch(api('/api/admin/user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        alert('User created!');
        setNewUser({ username: '', password: '', display_name: '', role: 'user', email: '', phone: '' });
        loadUsers();
      } else {
        const err = await res.json();
        alert('Error: ' + err.detail);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const updateUser = async (userId) => {
    try {
      const res = await fetch(api(`/api/admin/user/${userId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });
      if (res.ok) {
        alert('User updated!');
        setEditingUser(null);
        loadUsers();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(api(`/api/admin/user/${userId}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('User deleted!');
        loadUsers();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // File Functions
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadStatus('Uploading...');
    try {
      const res = await fetch(api('/api/upload'), {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUploadStatus(`✅ ${data.message || 'File uploaded!'}`);
      } else {
        setUploadStatus('❌ Upload failed');
      }
    } catch (err) {
      setUploadStatus('❌ Error: ' + err.message);
    }
  };

  const tabStyle = (tab) => ({
    padding: '12px 24px',
    background: activeTab === tab ? 'linear-gradient(135deg, #60C3C9, #EC4A79)' : 'rgba(255,255,255,0.05)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? '600' : '400',
    transition: 'all 0.2s',
  });

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '14px',
    width: '100%',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    color: '#8b8b9e',
    fontWeight: '500',
  };

  return (
    <div className="content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button style={tabStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard Override
        </button>
        <button style={tabStyle('users')} onClick={() => { setActiveTab('users'); loadUsers(); }}>
          👥 User Management
        </button>
        <button style={tabStyle('files')} onClick={() => setActiveTab('files')}>
          📁 File Operations
        </button>
      </div>

      {/* Dashboard Override Tab */}
      {activeTab === 'dashboard' && (
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Dashboard Statistics Control</h2>
          
          {/* Toggle Switch */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            marginBottom: '24px',
            padding: '16px',
            background: overrideEnabled ? 'rgba(236,74,121,0.1)' : 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: `1px solid ${overrideEnabled ? 'rgba(236,74,121,0.3)' : 'rgba(255,255,255,0.1)'}`,
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={overrideEnabled} 
                onChange={(e) => setOverrideEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#EC4A79' }}
              />
              <span style={{ fontWeight: '600' }}>Manual Override Active</span>
            </label>
            <span style={{ color: '#8b8b9e', fontSize: '13px' }}>
              {overrideEnabled ? '⚠️ Dashboard showing manual values' : '✅ Dashboard showing real data'}
            </span>
          </div>

          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px',
            opacity: overrideEnabled ? 1 : 0.5,
            pointerEvents: overrideEnabled ? 'auto' : 'none',
          }}>
            {[
              { key: 'total_tokens', label: 'Total Tokens', color: '#60C3C9' },
              { key: 'broadcast_rate', label: 'Broadcast Rate (%)', color: '#EC4A79' },
              { key: 'active_influencers', label: 'Active Influencers', color: '#EC4A79' },
              { key: 'total_hours', label: 'Total Hours', color: '#a855f7' },
              { key: 'avg_abps', label: 'Avg RV', color: '#60C3C9' },
              { key: 'avg_tis', label: 'Avg HF', color: '#EC4A79' },
              { key: 'avg_cos', label: 'Avg SS', color: '#a855f7' },
              { key: 'new_influencers', label: 'New Influencers', color: '#22c55e' },
            ].map((stat) => (
              <div key={stat.key} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <label style={labelStyle}>{stat.label}</label>
                <input
                  type="number"
                  step="0.01"
                  value={dashboardStats[stat.key]}
                  onChange={(e) => setDashboardStats({
                    ...dashboardStats,
                    [stat.key]: parseFloat(e.target.value) || 0,
                  })}
                  style={{
                    ...inputStyle,
                    color: stat.color,
                    fontWeight: '700',
                    fontSize: '18px',
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveOverrideSettings}
            style={{
              marginTop: '24px',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #60C3C9, #EC4A79)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            💾 Save
          </button>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Add New User */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>➕ Add New User</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  style={inputStyle}
                  placeholder="username"
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input
                  type="text"
                  value={newUser.display_name}
                  onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                  style={inputStyle}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={inputStyle}
                  placeholder="email@domain.com"
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  style={inputStyle}
                  placeholder="+90 555 123 4567"
                />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={inputStyle}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              onClick={createUser}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#22c55e',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              ✅ Create User
            </button>
          </div>

          {/* Users List */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>👥 Existing Users</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b8b9e', fontSize: '12px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b8b9e', fontSize: '12px' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b8b9e', fontSize: '12px' }}>Display Name</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b8b9e', fontSize: '12px' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b8b9e', fontSize: '12px' }}>Phone</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#8b8b9e', fontSize: '12px' }}>Role</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#8b8b9e', fontSize: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {editingUser?.id === user.id ? (
                      <>
                        <td style={{ padding: '12px' }}>{user.id}</td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="text"
                            value={editingUser.username}
                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                            style={{ ...inputStyle, padding: '6px 10px' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="text"
                            value={editingUser.display_name}
                            onChange={(e) => setEditingUser({ ...editingUser, display_name: e.target.value })}
                            style={{ ...inputStyle, padding: '6px 10px' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="email"
                            value={editingUser.email || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            style={{ ...inputStyle, padding: '6px 10px' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input
                            type="tel"
                            value={editingUser.phone || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                            style={{ ...inputStyle, padding: '6px 10px' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                            style={{ ...inputStyle, padding: '6px 10px' }}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => updateUser(user.id)}
                            style={{ padding: '6px 12px', background: '#22c55e', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', marginRight: '8px' }}
                          >
                            💾
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '12px', color: '#8b8b9e' }}>{user.id}</td>
                        <td style={{ padding: '12px' }}>{user.username}</td>
                        <td style={{ padding: '12px' }}>{user.display_name}</td>
                        <td style={{ padding: '12px', color: '#8b8b9e' }}>{user.email || '-'}</td>
                        <td style={{ padding: '12px', color: '#8b8b9e' }}>{user.phone || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px',
                            background: user.role === 'admin' ? 'rgba(236,74,121,0.2)' : 'rgba(96,195,201,0.2)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: user.role === 'admin' ? '#EC4A79' : '#60C3C9',
                          }}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            onClick={() => setEditingUser({ ...user })}
                            style={{ padding: '6px 12px', background: 'rgba(96,195,201,0.2)', border: 'none', borderRadius: '6px', color: '#60C3C9', cursor: 'pointer', marginRight: '8px' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* File Upload */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>📤 Upload File</h2>
            <div style={{
              border: '2px dashed rgba(255,255,255,0.2)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              <input
                type="file"
                id="file-upload"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                <p style={{ color: '#fff', marginBottom: '8px' }}>Upload CSV or Excel file</p>
                <p style={{ color: '#8b8b9e', fontSize: '13px' }}>Drag and drop file or click</p>
              </label>
            </div>
            {uploadStatus && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: uploadStatus.includes('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                borderRadius: '8px',
                color: uploadStatus.includes('✅') ? '#22c55e' : '#ef4444',
              }}>
                {uploadStatus}
              </div>
            )}
          </div>

          {/* File Download */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>📥 Download File</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href={api('/api/export.csv')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 24px',
                  background: 'rgba(96,195,201,0.1)',
                  border: '1px solid rgba(96,195,201,0.3)',
                  borderRadius: '12px',
                  color: '#60C3C9',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '24px' }}>📊</span>
                <div>
                  <div>Influencer Data</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>in CSV format</div>
                </div>
              </a>
              <a
                href={api('/api/export-metrics.csv')}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 24px',
                  background: 'rgba(236,74,121,0.1)',
                  border: '1px solid rgba(236,74,121,0.3)',
                  borderRadius: '12px',
                  color: '#EC4A79',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '24px' }}>📈</span>
                <div>
                  <div>Metric Data</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>in CSV format</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
