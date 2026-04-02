import React from 'react';

export default function InfluencerCard({ data }) {
  const { username, ovr, archetype, rv, hf, ss, followers } = data;

  // Archetype colors/icons
  const archetypeConfig = {
    'Sniper': { color: '#ef4444', icon: '🎯' }, // Red
    'Grinder': { color: '#f59e0b', icon: '⚙️' }, // Amber
    'Rising Star': { color: '#3b82f6', icon: '⭐' }, // Blue
    'Unicorn': { color: '#a855f7', icon: '🦄' }, // Purple
    'NPC': { color: '#6b7280', icon: '🤖' } // Gray
  };

  const config = archetypeConfig[archetype] || archetypeConfig['NPC'];

  return (
    <div style={{
      width: '300px',
      height: '480px',
      background: `linear-gradient(135deg, #1a1a24 0%, #2d2d3f 100%)`,
      borderRadius: '20px',
      border: `2px solid ${config.color}`,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 0 30px ${config.color}40`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      color: '#fff',
      fontFamily: "'Rajdhani', sans-serif" // Assuming a techy font, fallback to sans
    }}>
      {/* Card Header */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
      }}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <span style={{fontSize: '42px', fontWeight: '800', lineHeight: '1', color: config.color}}>{ovr || 75}</span>
          <span style={{fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', opacity: 0.8}}>OVR</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
           <span style={{fontSize: '32px'}}>{config.icon}</span>
        </div>
      </div>

      {/* Avatar Placeholder */}
      <div style={{
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${config.color} 0%, #1a1a24 70%)`,
        border: `4px solid ${config.color}`,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
        boxShadow: `0 0 20px ${config.color}60`
      }}>
        {username.charAt(0).toUpperCase()}
      </div>

      {/* Name & Archetype */}
      <h2 style={{
        fontSize: '24px', 
        fontWeight: '700', 
        margin: '0 0 5px 0',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        {username}
      </h2>
      <div style={{
        background: config.color,
        color: '#000',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: '24px',
        letterSpacing: '1px'
      }}>
        {archetype || 'ROOKIE'}
      </div>

      {/* Stats Grid */}
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '10px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '20px'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '18px', fontWeight: '700', color: '#60C3C9'}}>{rv ? rv.toFixed(1) : '-'}</div>
          <div style={{fontSize: '10px', color: '#8b8b9e', fontWeight: '600'}}>RV</div>
        </div>
        <div style={{textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)'}}>
          <div style={{fontSize: '18px', fontWeight: '700', color: '#EC4A79'}}>{hf ? hf.toFixed(1) : '-'}</div>
          <div style={{fontSize: '10px', color: '#8b8b9e', fontWeight: '600'}}>HF</div>
        </div>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '18px', fontWeight: '700', color: '#a855f7'}}>{ss ? ss.toFixed(1) : '-'}</div>
          <div style={{fontSize: '10px', color: '#8b8b9e', fontWeight: '600'}}>SS</div>
        </div>
      </div>
      
      {/* Footer Decoration */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`
      }} />
    </div>
  );
}
