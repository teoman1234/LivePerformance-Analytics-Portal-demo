import React from 'react';
import { Sparkles, Zap, Target, MessageCircle, Clock } from 'lucide-react';

/**
 * AICoachCard Component - Premium Tech/R&D Feature
 * Enhanced with neon glow effect, gradient border, and pulse animation
 */

// CSS Keyframes injection for animations
const styleId = 'ai-coach-animations';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes pulseGlow {
      0%, 100% { 
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 
                    0 0 40px rgba(168, 85, 247, 0.1),
                    inset 0 0 20px rgba(168, 85, 247, 0.05);
      }
      50% { 
        box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 
                    0 0 60px rgba(168, 85, 247, 0.2),
                    inset 0 0 30px rgba(168, 85, 247, 0.1);
      }
    }
    
    @keyframes pulseBadge {
      0%, 100% { 
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
      }
      50% { 
        transform: scale(1.05);
        box-shadow: 0 0 0 8px rgba(168, 85, 247, 0);
      }
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes floatOrb {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
      33% { transform: translate(10px, -10px) scale(1.1); opacity: 0.8; }
      66% { transform: translate(-5px, 5px) scale(0.95); opacity: 0.5; }
    }
    
    .ai-coach-card {
      animation: pulseGlow 3s ease-in-out infinite;
    }
    
    .ai-badge-pulse {
      animation: pulseBadge 2s ease-in-out infinite;
    }
    
    .gradient-border {
      background: linear-gradient(135deg, #a855f7, #3b82f6, #EC4A79, #a855f7);
      background-size: 300% 300%;
      animation: gradientShift 4s ease infinite;
    }
    
    .floating-orb {
      animation: floatOrb 6s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

export default function AICoachCard({ profile, t }) {
  const archetype = profile?.archetype || 'STANDARD';
  
  const archetypeConfig = {
    UNICORN: { icon: '🦄', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
    SNIPER: { icon: '🎯', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
    GRINDER: { icon: '💪', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    RISING_STAR: { icon: '⭐', color: '#EC4A79', gradient: 'linear-gradient(135deg, #EC4A79, #db2777)' },
    STANDARD: { icon: '🧪', color: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', displayName: 'BETA' },
  };
  
  const config = archetypeConfig[archetype] || archetypeConfig.STANDARD;
  
  const getCoachMessage = () => {
    const messages = {
      SNIPER: t?.('influencer.coachMessages.sniper') || "Your efficiency is exceptional! You're earning more tokens per hour than most. Consider extending your stream duration slightly to maximize total earnings while maintaining your impressive RV score.",
      GRINDER: t?.('influencer.coachMessages.grinder') || "You're putting in serious hours—that dedication shows! Focus on boosting engagement during streams. Quality interactions can significantly improve your Hype Factor and overall revenue velocity.",
      RISING_STAR: t?.('influencer.coachMessages.risingStar') || "You're on an impressive upward trajectory! Your metrics are improving week over week. Maintain consistency with a regular streaming schedule to keep building this momentum.",
      UNICORN: t?.('influencer.coachMessages.unicorn') || "Outstanding balance across all metrics! You're in the elite tier. Keep doing what you're doing and consider mentoring other influencers to share your expertise.",
      STANDARD: t?.('influencer.coachMessages.standard') || "You're maintaining steady metrics across the board. Small, consistent improvements in RV, HF, and SS can compound into significant gains over time. Focus on one metric each week.",
    };
    return messages[archetype] || messages.STANDARD;
  };
  
  const getArchetypeLabel = () => {
    const labels = {
      UNICORN: t?.('influencer.archetypes.unicorn') || 'Unicorn Status!',
      SNIPER: t?.('influencer.archetypes.sniper') || 'Sniper Mode Active!',
      GRINDER: t?.('influencer.archetypes.grinder') || 'Grinder Profile',
      RISING_STAR: t?.('influencer.archetypes.risingStar') || 'Rising Star!',
      STANDARD: t?.('influencer.archetypes.standard') || 'Beta Testing',
    };
    return labels[archetype] || labels.STANDARD;
  };

  return (
    <div 
      className="ai-coach-card"
      style={{
        position: 'relative',
        padding: '2px', // Gradient border thickness
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #a855f7, #3b82f6, #EC4A79)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 4s ease infinite, pulseGlow 3s ease-in-out infinite',
      }}
    >
      {/* Inner content */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(145deg, rgba(15, 15, 25, 0.98) 0%, rgba(20, 15, 30, 0.95) 100%)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100%',
      }}>
        {/* Floating orbs for tech effect */}
        <div 
          className="floating-orb"
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-20px',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} 
        />
        <div 
          className="floating-orb"
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-30px',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
            animationDelay: '-2s',
          }} 
        />
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* AI Icon with glow */}
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, #a855f7, #EC4A79)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '24px',
              boxShadow: '0 4px 20px rgba(168,85,247,0.5), 0 0 40px rgba(168,85,247,0.2)',
              position: 'relative',
            }}>
              <Sparkles size={24} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                  {t?.('influencer.aiCoach') || 'AI Coach'}
                </h3>
                {/* AI Powered Badge with pulse */}
                <span 
                  className="ai-badge-pulse"
                  style={{ 
                    fontSize: '9px', 
                    padding: '4px 10px', 
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)', 
                    borderRadius: '12px', 
                    fontWeight: '700',
                    letterSpacing: '0.8px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 10px rgba(168,85,247,0.4)',
                  }}
                >
                  <Zap size={10} />
                  AI POWERED
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {t?.('influencer.personalizedInsights') || 'Personalized insights for you'}
              </span>
            </div>
          </div>
          
          {/* Archetype Badge */}
          <div style={{
            padding: '6px 16px',
            background: config.gradient,
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '0.5px',
            boxShadow: `0 2px 15px ${config.color}50`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>{config.icon}</span>
            {config.displayName || archetype}
          </div>
        </div>
        
        {/* Main Insight Card */}
        <div style={{ 
          flex: 1,
          background: 'rgba(15,23,42,0.8)', 
          borderRadius: '14px', 
          padding: '20px',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          backdropFilter: 'blur(10px)',
          marginBottom: '18px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Insight Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: `${config.color}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              border: `1px solid ${config.color}40`,
            }}>
              {config.icon}
            </div>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '700', 
              color: config.color,
            }}>
              {getArchetypeLabel()}
            </span>
          </div>
          
          {/* Insight Text */}
          <p style={{ 
            fontSize: '13px', 
            color: '#cbd5e1', 
            lineHeight: 1.8, 
            margin: 0,
            letterSpacing: '0.2px',
          }}>
            {getCoachMessage()}
          </p>
        </div>
        
        {/* Today's Focus Section */}
        <div style={{ 
          background: 'rgba(15,23,42,0.9)', 
          borderRadius: '14px', 
          padding: '18px',
          border: '1px solid rgba(96,195,201,0.2)',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '800', 
              color: '#60C3C9', 
              letterSpacing: '0.5px', 
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Target size={16} />
              {t?.('influencer.todaysFocus') || "Today's Focus"}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              3 {t?.('influencer.actions') || 'actions'}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Action 1 */}
            <ActionItem 
              icon={<Clock size={14} />}
              color="#60C3C9"
              text="Stream for at least"
              highlight="2 hours"
            />
            
            {/* Action 2 */}
            <ActionItem 
              icon={<TrendingUp size={14} />}
              color="#EC4A79"
              text="Aim for"
              highlight="+2% improvement"
              suffix="in HF"
            />
            
            {/* Action 3 */}
            <ActionItem 
              icon={<MessageCircle size={14} />}
              color="#a855f7"
              text="End with a"
              highlight="community poll"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for TrendingUp icon
function TrendingUp({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function ActionItem({ icon, color, text, highlight, suffix }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      padding: '12px 14px',
      background: `${color}10`,
      borderRadius: '10px',
      border: `1px solid ${color}25`,
      transition: 'all 0.2s ease',
    }}>
      <div style={{ 
        width: '28px', 
        height: '28px', 
        borderRadius: '8px', 
        background: `${color}20`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: color,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '12px', color: '#e2e8f0' }}>{text} </span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: color }}>{highlight}</span>
        {suffix && <span style={{ fontSize: '12px', color: '#e2e8f0' }}> {suffix}</span>}
      </div>
      <div style={{ 
        width: '20px', 
        height: '20px', 
        borderRadius: '5px', 
        border: `2px solid ${color}40`,
        transition: 'all 0.2s ease',
      }} />
    </div>
  );
}
