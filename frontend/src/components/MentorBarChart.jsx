import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const metricConfig = {
  abps: {
    label: 'RV',
    field: 'avg_abps',
    influencerField: 'abps',
    color1: 'rgba(96, 195, 201, 0.8)',
    color2: 'rgba(96, 195, 201, 0.6)',
    borderColor: 'rgba(96, 195, 201, 0.9)',
  },
  tis: {
    label: 'HF',
    field: 'avg_tis',
    influencerField: 'tis',
    color1: 'rgba(236, 74, 121, 0.8)',
    color2: 'rgba(236, 74, 121, 0.6)',
    borderColor: 'rgba(236, 74, 121, 0.9)',
  },
  cos: {
    label: 'SS',
    field: 'avg_cos',
    influencerField: 'cos',
    color1: 'rgba(168, 85, 247, 0.8)',
    color2: 'rgba(168, 85, 247, 0.6)',
    borderColor: 'rgba(168, 85, 247, 0.9)',
  },
};

export default function MentorBarChart({ items, metric = 'abps', isInfluencer = false, limit = 20 }){
  const canvasRef = useRef();
  const chartRef = useRef(null);
  
  useEffect(()=>{
    if(!canvasRef.current || !items?.length) return;
    
    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const config = metricConfig[metric] || metricConfig.abps;
    const ctx = canvasRef.current.getContext('2d');
    
    // Veri yapısına göre doğru alanı belirle
    // API'den gelen veri 'abps' veya 'avg_abps' olabilir
    const getFieldValue = (item) => {
      // Önce influencerField dene (abps, tis, cos)
      if (item[config.influencerField] !== undefined) {
        return item[config.influencerField];
      }
      // Sonra field dene (avg_abps, avg_tis, avg_cos)
      if (item[config.field] !== undefined) {
        return item[config.field];
      }
      return 0;
    };
    
    // Sort items by selected metric
    const sortedItems = [...items].sort((a, b) => {
      return (getFieldValue(b) || 0) - (getFieldValue(a) || 0);
    });
    
    // Limit items for readability
    const limitedItems = sortedItems.slice(0, limit);
    
    // Handle influencer data differently - kısa etiketler
    const labels = isInfluencer 
      ? limitedItems.map(i => {
          const name = i.username || i.name || 'Anonymous';
          return name.length > 12 ? name.substring(0, 10) + '...' : name;
        })
      : limitedItems.map(i => {
          const mentor = i.mentor || i.username || 'Unknown';
          return mentor.length > 12 ? mentor.substring(0, 10) + '...' : mentor;
        });
    
    // Full names for tooltips
    const fullNames = isInfluencer
      ? limitedItems.map(i => i.username || i.name || 'Anonymous')
      : limitedItems.map(i => i.mentor || i.username || 'Unknown');
    
    const data = limitedItems.map(i => Number((getFieldValue(i) || 0).toFixed(2)));
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, canvasRef.current.width, 0);
    gradient.addColorStop(0, config.color1);
    gradient.addColorStop(1, config.color2);
    
    // Dinamik bar kalınlığı - daha fazla veri için daha ince bar
    const itemCount = limitedItems.length;
    const barThickness = itemCount <= 10 ? 40 : itemCount <= 20 ? 25 : itemCount <= 30 ? 18 : 12;
    
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: { 
        labels, 
        datasets: [{ 
          label: config.label, 
          data, 
          backgroundColor: gradient,
          borderColor: config.borderColor,
          borderWidth: 0,
          borderRadius: itemCount <= 20 ? 6 : 4,
          barThickness: barThickness,
          fullNames: fullNames, // Tooltip için tam isimler
        }] 
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            position: 'top',
            align: 'end',
            labels: { 
              color: '#8b8b9e',
              font: { weight: '500', size: 12 },
              usePointStyle: true,
              pointStyle: 'circle',
            }
          },
          tooltip: {
            backgroundColor: 'rgba(13, 13, 20, 0.95)',
            titleColor: '#fff',
            bodyColor: '#8b8b9e',
            borderColor: config.borderColor,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              title: function(context) {
                // Tam ismi göster
                const index = context[0].dataIndex;
                return fullNames[index];
              },
              label: function(context) {
                return `${config.label}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { 
              color: '#8b8b9e',
              font: { size: itemCount <= 15 ? 11 : itemCount <= 25 ? 9 : 8 },
              maxRotation: itemCount > 10 ? 45 : 0,
              minRotation: itemCount > 15 ? 45 : 0,
            },
            grid: { 
              display: false
            },
            border: {
              display: false
            }
          },
          y: {
            ticks: { 
              color: '#8b8b9e',
              font: { size: 11 }
            },
            grid: { 
              color: 'rgba(255,255,255,0.03)',
              drawBorder: false
            },
            border: {
              display: false
            }
          }
        }
      }
    });
    
    return ()=> {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [items, metric, isInfluencer, limit]);
  
  // Gösterilen / Toplam bilgisi
  const totalCount = items?.length || 0;
  const shownCount = Math.min(limit, totalCount);
  
  return (
    <div style={{height: '280px', position: 'relative'}}>
      <canvas ref={canvasRef} />
      {totalCount > limit && (
        <div style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          fontSize: '11px',
          color: '#8b8b9e',
          opacity: 0.7,
        }}>
          Showing first {shownCount} / {totalCount}
        </div>
      )}
    </div>
  );
}
