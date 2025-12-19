import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Settings({ user, setUser }) {
  const { t } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changeModal, setChangeModal] = useState(null); // 'phone', 'email', 'password'
  const [newValue, setNewValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetch(api(`/api/user/${user.id}`))
        .then(r => r.json())
        .then(d => {
          setUserData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const handleRequestChange = async () => {
    if (!changeModal) return;
    
    // Check password match
    if (changeModal === 'password') {
      if (newValue !== confirmValue) {
        setError('Passwords do not match');
        return;
      }
      if (newValue.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    
    // Check email format
    if (changeModal === 'email' && !newValue.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    
    // Check phone format
    if (changeModal === 'phone' && newValue.length < 10) {
      setError('Enter a valid phone number');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch(api('/api/request-change'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          change_type: changeModal,
          new_value: newValue,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Operation failed');
      }

      setSuccess(`Verification link sent to ${userData?.masked_email}.`);
      setNewValue('');
      setConfirmValue('');
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setChangeModal(null);
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const getModalTitle = () => {
    switch (changeModal) {
      case 'phone': return t('settings.changePhoneNumber');
      case 'email': return t('settings.changeEmailAddress');
      case 'password': return t('settings.changePassword');
      default: return '';
    }
  };

  const getModalPlaceholder = () => {
    switch (changeModal) {
      case 'phone': return t('settings.newPhonePlaceholder');
      case 'email': return t('settings.newEmailPlaceholder');
      case 'password': return t('settings.newPasswordPlaceholder');
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Link to={user?.role === 'influencer' ? '/influencer' : '/supervisor'} style={{ color: '#8b8b9e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
            </svg>
            {t('common.back')}
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{t('settings.title')}</h1>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#EC4A79',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
          }}>
            <span style={{ color: '#EC4A79' }}>*</span>
            {t('settings.basicInfo')}
          </h3>
        </div>

        {/* Phone Number */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#8b8b9e', marginBottom: '4px' }}>{t('settings.phoneNumber')}</div>
            <div style={{ fontSize: '15px', color: '#fff' }}>{userData?.masked_phone || '-'}</div>
          </div>
          <button
            onClick={() => { setChangeModal('phone'); setError(null); setSuccess(null); setNewValue(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#60C3C9',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {t('settings.changePhoneNumber')}
          </button>
        </div>

        {/* Email Address */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#8b8b9e', marginBottom: '4px' }}>{t('settings.emailAddress')}</div>
            <div style={{ fontSize: '15px', color: '#fff' }}>{userData?.masked_email || '-'}</div>
          </div>
          <button
            onClick={() => { setChangeModal('email'); setError(null); setSuccess(null); setNewValue(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#60C3C9',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {t('settings.changeEmailAddress')}
          </button>
        </div>

        {/* Password */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: '#8b8b9e', marginBottom: '4px' }}>{t('settings.password')}</div>
            <div style={{ fontSize: '15px', color: '#fff' }}>••••••••</div>
          </div>
          <button
            onClick={() => { setChangeModal('password'); setError(null); setSuccess(null); setNewValue(''); setConfirmValue(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#60C3C9',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {t('settings.changePassword')}
          </button>
        </div>
      </div>

      {/* Change Modal */}
      {changeModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => !sending && setChangeModal(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#1a1a24',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>
              {getModalTitle()}
            </h3>

            {success ? (
              <div style={{
                padding: '16px',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '8px',
                color: '#22c55e',
                fontSize: '14px',
                textAlign: 'center',
              }}>
                ✓ {success}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type={changeModal === 'password' ? 'password' : 'text'}
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder={getModalPlaceholder()}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {changeModal === 'password' && (
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="password"
                      value={confirmValue}
                      onChange={e => setConfirmValue(e.target.value)}
                      placeholder={t('settings.confirmPasswordPlaceholder')}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                {error && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(236,74,121,0.15)',
                    border: '1px solid rgba(236,74,121,0.3)',
                    borderRadius: '8px',
                    color: '#EC4A79',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}>
                    {error}
                  </div>
                )}

                <p style={{ fontSize: '13px', color: '#8b8b9e', marginBottom: '20px' }}>
                  {t('settings.verificationMessage')} <span style={{ color: '#60C3C9' }}>{userData?.masked_email}</span>
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setChangeModal(null)}
                    disabled={sending}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#8b8b9e',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleRequestChange}
                    disabled={sending || !newValue}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: 'linear-gradient(135deg, #60C3C9, #EC4A79)',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: sending || !newValue ? 'not-allowed' : 'pointer',
                      opacity: sending || !newValue ? 0.6 : 1,
                    }}
                  >
                    {sending ? t('settings.sending') : t('settings.sendVerificationLink')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
