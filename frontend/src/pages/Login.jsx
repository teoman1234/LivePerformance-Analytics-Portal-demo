import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Login({ onLogin, defaultRole = 'supervisor' }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isInfluencer = defaultRole === 'influencer';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const config = useMemo(() => {
    if (isInfluencer) {
      return {
        title: t('login.influencerTitle'),
        subtitle: t('influencer.myPerformance'),
        gradient: 'linear-gradient(135deg, #EC4A79, #8B5CF6)',
        accent: '#EC4A79',
        redirect: '/influencer',
      };
    }
    return {
      title: t('login.supervisorTitle'),
      subtitle: t('supervisor.title'),
      gradient: 'linear-gradient(135deg, #60C3C9, #3B82F6)',
      accent: '#60C3C9',
      redirect: '/supervisor',
    };
  }, [isInfluencer, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(api('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Login failed');
      }

      const data = await res.json();
      onLogin(data.user);
      navigate(config.redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        left: '-20%',
        width: '500px',
        height: '500px',
        background: isInfluencer 
          ? 'radial-gradient(circle, rgba(236,74,121,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(96,195,201,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        right: '-20%',
        width: '500px',
        height: '500px',
        background: isInfluencer 
          ? 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isInfluencer ? 'rgba(236,74,121,0.2)' : 'rgba(96,195,201,0.2)'}`,
        borderRadius: '24px',
        boxShadow: isInfluencer 
          ? '0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(236,74,121,0.1)'
          : '0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(96,195,201,0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {!logoFailed && (
            <img 
              src="https://www.superstarmedya.com/site/o/111846/2025/12/SUPER-STAR-02-logo_1.png" 
              alt="Superstar Medya" 
              style={{ height: '54px', marginBottom: '16px', filter: 'brightness(0) invert(1)' }}
              onError={() => setLogoFailed(true)}
            />
          )}
          {logoFailed && (
            <div style={{
              marginBottom: '16px',
              fontSize: '24px',
              fontWeight: '800',
              letterSpacing: '0.6px',
              background: config.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              SUPERSTAR MEDYA
            </div>
          )}
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            background: config.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>
            {config.title}
          </h1>
          <p style={{ color: '#8b8b9e', fontSize: '14px', marginTop: '8px' }}>
            {config.subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: '#8b8b9e', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              {t('login.emailOrPhone')}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or phone number"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = config.accent}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: '#8b8b9e', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = config.accent}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(236,74,121,0.15)',
              border: '1px solid rgba(236,74,121,0.3)',
              borderRadius: '8px',
              color: '#EC4A79',
              fontSize: '13px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: config.gradient,
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: `0 4px 20px ${config.accent}55`,
            }}
          >
            {loading ? t('common.loading') : t('login.signIn')}
          </button>
        </form>

        {/* Back to Landing */}
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link
            to="/"
            style={{
              color: '#6b7280',
              fontSize: '12px',
              textDecoration: 'none',
            }}
          >
            ← {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
