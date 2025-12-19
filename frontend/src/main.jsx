import React, { useEffect, useState, useRef } from 'react';
import { api } from './api.js';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Supervisor from './pages/Supervisor.jsx';
import Influencers from './pages/Influencers.jsx';
import InfluencerDetail from './pages/InfluencerDetail.jsx';
import Veriler from './pages/Veriler.jsx';
import Login from './pages/Login.jsx';
import Settings from './pages/Settings.jsx';
import DevPanel from './pages/DevPanel.jsx';
import InfluencerPortal from './pages/InfluencerPortal.jsx';
import Landing from './pages/Landing.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';

// Sidebar Navigation Icons
const icons = {
  home: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
};

function Sidebar({ activePath }) {
  const { t } = useLanguage();
  const menuItems = [
    { path: '/supervisor', icon: 'home', labelKey: 'sidebar.dashboard' },
    { path: '/supervisor/agency-data', icon: 'chart', labelKey: 'sidebar.agencyData' },
    { path: '/supervisor/influencers', icon: 'users', labelKey: 'sidebar.influencers' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img 
            src="https://superstarmedya.com/wp-content/uploads/2024/06/starmedya.png" 
            alt="SuperStar" 
          />
        </div>
        <div className="sidebar-portal-text">
          <span>AGENCY WORKSPACE</span>
          <span>SUPERVISOR DASHBOARD</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`sidebar-item ${activePath === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{icons[item.icon]}</span>
            <span className="sidebar-label">{t(item.labelKey)}</span>
            {activePath === item.path && <span className="sidebar-indicator"></span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function InfluencerSidebar({ activePath, onLogout }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const menuItems = [
    { path: '/influencer', icon: 'home', labelKey: 'sidebar.myDashboard' },
    { path: '/influencer/settings', icon: 'settings', labelKey: 'sidebar.settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img 
            src="https://superstarmedya.com/wp-content/uploads/2024/06/starmedya.png" 
            alt="SuperStar" 
          />
        </div>
        <div className="sidebar-portal-text">
          <span>INFLUENCER PERFORMANCE</span>
          <span>{t('sidebar.myDashboard').toUpperCase()}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`sidebar-item ${activePath === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{icons[item.icon]}</span>
            <span className="sidebar-label">{t(item.labelKey)}</span>
            {activePath === item.path && <span className="sidebar-indicator"></span>}
          </Link>
        ))}
      </nav>
      
      {/* Logout Button at Bottom */}
      <div style={{marginTop:'auto', paddingTop:'20px', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <button
          onClick={() => { onLogout(); navigate('/'); }}
          className="sidebar-item"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#EC4A79',
          }}
        >
          <span className="sidebar-icon" style={{color:'#EC4A79'}}>{icons.logout}</span>
          <span className="sidebar-label" style={{color:'#EC4A79'}}>{t('common.logout') || 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}

// Language Switcher Component
function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button
      onClick={toggleLanguage}
      title={language === 'en' ? 'Switch to Turkish' : 'İngilizce\'ye geç'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{opacity: 0.8}}>
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
      </svg>
      <span style={{fontSize: '12px', fontWeight: '600'}}>{language === 'en' ? 'EN' : 'TR'}</span>
    </button>
  );
}

function Header({ lastUpload, user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not updated yet';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-header">
      <div className="header-greeting">
        <span style={{fontSize:'14px',color:'#8b8b9e'}}>
          Last update: <span style={{color:'#60C3C9'}}>{formatDate(lastUpload)}</span>
        </span>
      </div>
      
      <div className="header-right">
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        <div ref={dropdownRef} style={{position:'relative'}}>
          {/* User Button */}
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px 6px 6px',
              background: showDropdown ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if(!showDropdown) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if(!showDropdown) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #60C3C9, #EC4A79)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
            }}>
              {user?.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
              <span style={{fontSize:'13px',fontWeight:'500',color:'#fff',lineHeight:'1.2'}}>{user?.display_name || 'User'}</span>
              <span style={{fontSize:'11px',color:'#8b8b9e',lineHeight:'1.2'}}>{user?.role || 'User'}</span>
            </div>
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              width="16" 
              height="16" 
              style={{
                color:'#8b8b9e',
                marginLeft:'4px',
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '200px',
              background: '#1e1e2d',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease',
            }}>
              {/* User Info Header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{fontSize:'13px',fontWeight:'600',color:'#fff'}}>{user?.display_name}</div>
                <div style={{fontSize:'11px',color:'#8b8b9e',marginTop:'2px'}}>{user?.role}</div>
              </div>
              
              {/* Menu Items */}
              <div style={{padding:'6px'}}>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/supervisor/settings'); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#b8b8c8',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b8b8c8'; }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{opacity:0.7}}>
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={() => { setShowDropdown(false); onLogout(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#EC4A79',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(236,74,121,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{opacity:0.9}}>
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function UploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(api('/api/upload'), {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setResult(data);
      onSuccess && onSuccess(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Data</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {!result ? (
            <>
              <div className="upload-zone">
                <input 
                  type="file" 
                  accept=".csv,.xlsx" 
                  onChange={e => setFile(e.target.files[0])}
                  id="file-input"
                />
                <label htmlFor="file-input" className="upload-label">
                  {icons.upload}
                  <span>{file ? file.name : 'Select CSV or Excel file'}</span>
                </label>
              </div>
              {error && <div className="upload-error">{error}</div>}
              <button 
                className="btn btn-primary btn-block" 
                onClick={handleUpload} 
                disabled={!file || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload and Analyze'}
              </button>
            </>
          ) : (
            <div className="upload-result">
              <div className="result-icon">✓</div>
              <h3>Upload Successful!</h3>
              <div className="result-stats">
                <div className="result-stat">
                  <span className="stat-value">{result.rows}</span>
                  <span className="stat-label">Rows</span>
                </div>
                <div className="result-stat">
                  <span className="stat-value">{result.influencers}</span>
                  <span className="stat-label">Influencers</span>
                </div>
                <div className="result-stat">
                  <span className="stat-value">{result.mentors}</span>
                  <span className="stat-label">Agents</span>
                </div>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => { onClose(); window.location.reload(); }}>
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Layout({ user, onLogout, setUser }){
  const [lastUpload, setLastUpload] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const location = useLocation();
  
  useEffect(()=>{
    fetch(api('/api/supervisor'))
      .then(r=>r.json())
      .then(d=> setLastUpload(d.last_upload || null))
      .catch(()=>{});
  },[]);
  
  return (
    <div className="app-layout">
      <Sidebar activePath={location.pathname} />
      <div className="main-wrapper">
        <Header lastUpload={lastUpload} user={user} onLogout={onLogout} />
        <main className="main-content">
          <Routes>
            {/* Primary supervisor dashboard */}
            <Route path="/supervisor" element={<Supervisor/>} />
            <Route path="/supervisor/agency-data" element={<Veriler/>} />
            <Route path="/supervisor/influencers" element={<Influencers/>} />
            <Route path="/supervisor/influencer/:username" element={<InfluencerDetail/>} />
            <Route path="/supervisor/settings" element={<Settings user={user} setUser={setUser} />} />
            <Route path="/dev-panel-x7k9" element={<DevPanel />} />
          </Routes>
        </main>
      </div>
      <UploadModal 
        isOpen={showUpload} 
        onClose={() => setShowUpload(false)}
        onSuccess={(data) => setLastUpload(data.last_upload)}
      />
    </div>
  );
}

function InfluencerHeader({ user }) {
  const { language } = useLanguage();

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="top-header">
      <div className="header-greeting">
        <span style={{fontSize:'14px',color:'#8b8b9e'}}>
          Last update: <span style={{color:'#60C3C9'}}>{formatDate()}</span>
        </span>
      </div>
      
      <div className="header-right">
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {/* User Info - No Dropdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px 6px 6px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #EC4A79, #F59E0B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#fff',
          }}>
            {user?.display_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'I'}
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
            <span style={{fontSize:'13px',fontWeight:'500',color:'#fff',lineHeight:'1.2'}}>{user?.display_name || user?.username || 'Influencer'}</span>
            <span style={{fontSize:'11px',color:'#8b8b9e',lineHeight:'1.2',textTransform:'capitalize'}}>{user?.role || 'Influencer'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function InfluencerLayout({ user, onLogout, setUser }){
  const location = useLocation();
  
  return (
    <div className="app-layout">
      <InfluencerSidebar activePath={location.pathname} onLogout={onLogout} />
      <div className="main-wrapper">
        <InfluencerHeader user={user} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<InfluencerPortal user={user} />} />
            <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Routes>
      {/* Public / marketing routes */}
      <Route path="/" element={<Landing />} />

      {/* Auth routes - her rol için ayrı, query parametre yok */}
      <Route
        path="/login/supervisor"
        element={<Login onLogin={handleLogin} defaultRole="supervisor" />}
      />
      <Route
        path="/login/influencer"
        element={<Login onLogin={handleLogin} defaultRole="influencer" />}
      />

      {/* Influencer portal with its own layout */}
      <Route
        path="/influencer/*"
        element={<InfluencerLayout user={user} onLogout={handleLogout} setUser={setUser} />}
      />

      {/* Protected supervisor app */}
      <Route
        path="/*"
        element={<Layout user={user} onLogout={handleLogout} setUser={setUser} />}
      />
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </BrowserRouter>
);
