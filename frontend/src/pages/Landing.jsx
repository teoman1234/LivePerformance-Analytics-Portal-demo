import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Landing() {
  const { t, language, setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Sistemin benzersiz özellikleri
  const uniqueFeatures = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20V10"/>
          <path d="M18 20V4"/>
          <path d="M6 20v-4"/>
        </svg>
      ),
      title: language === 'tr' ? 'ABPS Skoru' : 'ABPS Score',
      desc: language === 'tr' 
        ? 'Ajansa Bağlı Performans Skoru ile yayıncılarınızı objektif değerlendirin'
        : 'Objectively evaluate influencers with Agency-Based Performance Score',
      color: '#60C3C9'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      ),
      title: language === 'tr' ? 'Yayın Saati Takibi' : 'Broadcast Time Tracking',
      desc: language === 'tr' 
        ? 'Günlük, haftalık ve aylık yayın sürelerini detaylı izleyin'
        : 'Track daily, weekly and monthly broadcast hours in detail',
      color: '#EC4A79'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: language === 'tr' ? 'Mentor Sistemi' : 'Mentor System',
      desc: language === 'tr' 
        ? 'Yayıncıları mentorlere atayın ve takım performansını ölçün'
        : 'Assign influencers to mentors and measure team performance',
      color: '#3B82F6'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      ),
      title: language === 'tr' ? 'Kolay Veri Aktarımı' : 'Easy Data Import',
      desc: language === 'tr' 
        ? 'TikTok verilerinizi CSV ile hızlıca içe aktarın'
        : 'Quickly import your TikTok data via CSV',
      color: '#F59E0B'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      title: language === 'tr' ? 'Token Analizi' : 'Token Analytics',
      desc: language === 'tr' 
        ? 'Hediye tokenlerini ve performans metriklerini analiz edin'
        : 'Analyze gift tokens and performance metrics',
      color: '#8B5CF6'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
      ),
      title: language === 'tr' ? 'Yayıncı Portalı' : 'Influencer Portal',
      desc: language === 'tr' 
        ? 'Her yayıncı kendi performansını takip edebilir'
        : 'Each influencer can track their own performance',
      color: '#10B981'
    }
  ];

  const portalTypes = [
    {
      type: 'supervisor',
      title: language === 'tr' ? 'Yönetici Paneli' : 'Supervisor Panel',
      desc: language === 'tr' 
        ? 'Tüm yayıncıları yönetin, performans raporlarını görüntüleyin ve stratejik kararlar alın.'
        : 'Manage all influencers, view performance reports and make strategic decisions.',
      features: language === 'tr' 
        ? ['Genel Dashboard', 'Yayıncı Yönetimi', 'Mentor Atamaları', 'Performans Raporları', 'Veri İçe Aktarma']
        : ['General Dashboard', 'Influencer Management', 'Mentor Assignments', 'Performance Reports', 'Data Import'],
      gradient: 'linear-gradient(135deg, #60C3C9, #3B82F6)',
      color: '#60C3C9',
      link: '/login/supervisor'
    },
    {
      type: 'influencer',
      title: language === 'tr' ? 'Yayıncı Portalı' : 'Influencer Portal',
      desc: language === 'tr' 
        ? 'Kendi performansınızı takip edin, hedeflerinizi görün ve gelişiminizi izleyin.'
        : 'Track your own performance, see your goals and monitor your progress.',
      features: language === 'tr' 
        ? ['Kişisel Dashboard', 'Performans Metrikleri', 'Hedef Takibi', 'Geçmiş Veriler', 'AI Koçluk (Beta)']
        : ['Personal Dashboard', 'Performance Metrics', 'Goal Tracking', 'Historical Data', 'AI Coaching (Beta)'],
      gradient: 'linear-gradient(135deg, #EC4A79, #8B5CF6)',
      color: '#EC4A79',
      link: '/login/influencer'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#050508',
      color: '#e5e7eb', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .landing-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(96,195,201,0.4);
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(96,195,201,0.4);
          background: rgba(20,25,35,0.8);
        }
        .portal-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .portal-card:hover .portal-arrow {
          transform: translateX(4px);
        }
      `}</style>

      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(96,195,201,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(236,74,121,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        background: 'rgba(5,5,8,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src="https://www.superstarmedya.com/site/o/111846/2025/12/SUPER-STAR-02-logo_1.png" 
            alt="SuperStar" 
            style={{ height: '36px', filter: 'brightness(0) invert(1)' }}
          />
          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '12px', color: '#6b7280', letterSpacing: '0.05em' }}>
            INFLUENCER MANAGEMENT
          </span>
        </div>
        
        <button
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#9ca3af',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {language === 'tr' ? 'EN' : 'TR'}
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '140px 48px 100px',
        position: 'relative'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          width: '100%',
          textAlign: 'center',
          animation: isVisible ? 'fadeInUp 0.8s ease forwards' : 'none',
          opacity: isVisible ? 1 : 0
        }}>
          {/* Badge */}
          <div style={{ 
            display: 'inline-block',
            padding: '6px 14px',
            background: 'rgba(96,195,201,0.1)',
            border: '1px solid rgba(96,195,201,0.15)',
            borderRadius: '100px',
            marginBottom: '28px'
          }}>
            <span style={{ 
              fontSize: '11px', 
              color: '#60C3C9', 
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              {language === 'tr' ? 'TikTok Ajans Çözümü' : 'TikTok Agency Solution'}
            </span>
          </div>
          
          {/* Main Title */}
          <h1 style={{ 
            fontSize: '64px', 
            lineHeight: 1.05, 
            margin: '0 0 16px 0',
            fontWeight: 700,
            letterSpacing: '-0.03em'
          }}>
            <span style={{ color: '#fff' }}>SuperStar</span>
          </h1>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: 500,
            color: '#8b8b9e',
            margin: '0 0 32px 0',
            letterSpacing: '0.02em'
          }}>
            Influencer Consultancy & Marketing Portal
          </h2>
          
          <p style={{ 
            fontSize: '17px', 
            color: '#6b7280', 
            maxWidth: '580px',
            lineHeight: 1.7,
            margin: '0 auto 48px'
          }}>
            {language === 'tr' 
              ? 'TikTok yayıncılarınızın performansını tek bir platformda yönetin. ABPS skorlama, mentor sistemi ve detaylı analizlerle ajansınızı büyütün.'
              : 'Manage your TikTok influencers\' performance in one platform. Grow your agency with ABPS scoring, mentor system and detailed analytics.'}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/login/supervisor"
              className="landing-btn"
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #60C3C9, #3B82F6)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {language === 'tr' ? 'Yönetici Girişi' : 'Supervisor Login'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link
              to="/login/influencer"
              className="landing-btn"
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                background: 'transparent',
                border: '1px solid rgba(236,74,121,0.4)',
                color: '#EC4A79',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {language === 'tr' ? 'Yayıncı Girişi' : 'Influencer Login'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div style={{ marginTop: '80px', opacity: 0.4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'float 2s ease-in-out infinite' }}>
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ 
        padding: '80px 48px 100px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#60C3C9', 
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px'
            }}>
              {language === 'tr' ? 'ÖZELLİKLER' : 'FEATURES'}
            </span>
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 16px 0'
            }}>
              {language === 'tr' ? 'Benzersiz Yönetim Araçları' : 'Unique Management Tools'}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
              {language === 'tr' 
                ? 'Ajansınızın ihtiyaçlarına özel tasarlanmış özellikler'
                : 'Features designed specifically for your agency needs'}
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px' 
          }}>
            {uniqueFeatures.map((feature, i) => (
              <div 
                key={i}
                className="feature-card"
                style={{ 
                  padding: '28px',
                  borderRadius: '16px',
                  background: 'rgba(15,18,25,0.6)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
              >
                <div style={{ 
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: `${feature.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: feature.color,
                  marginBottom: '18px'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px', color: '#e5e7eb' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Cards Section */}
      <section style={{ 
        padding: '60px 48px 120px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ 
              fontSize: '12px', 
              color: '#EC4A79', 
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px'
            }}>
              {language === 'tr' ? 'PORTAL SEÇİMİ' : 'SELECT PORTAL'}
            </span>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: 700,
              color: '#fff',
              margin: 0
            }}>
              {language === 'tr' ? 'Size Uygun Portala Giriş Yapın' : 'Login to Your Portal'}
            </h2>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '24px' 
          }}>
            {portalTypes.map((portal, i) => (
              <Link
                key={i}
                to={portal.link}
                className="portal-card"
                style={{ 
                  padding: '32px',
                  borderRadius: '20px',
                  background: 'rgba(15,18,25,0.8)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  display: 'block'
                }}
              >
                <div style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: portal.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  {portal.type === 'supervisor' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>
                
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px', color: '#fff' }}>
                  {portal.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                  {portal.desc}
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {portal.features.map((feat, j) => (
                    <span 
                      key={j}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: `${portal.color}10`,
                        color: portal.color,
                        fontSize: '11px',
                        fontWeight: 500
                      }}
                    >
                      {feat}
                    </span>
                  ))}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: portal.color,
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {language === 'tr' ? 'Giriş Yap' : 'Login'}
                  <svg className="portal-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.2s' }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '32px 48px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="https://www.superstarmedya.com/site/o/111846/2025/12/SUPER-STAR-02-logo_1.png" 
            alt="SuperStar" 
            style={{ height: '28px', opacity: 0.5, filter: 'brightness(0) invert(1)' }}
          />
          <span style={{ fontSize: '12px', color: '#4b5563' }}>
            © 2025 SuperStar Agency
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#374151' }}>
          Influencer Consultancy & Marketing Portal
        </span>
      </footer>
    </div>
  );
}
