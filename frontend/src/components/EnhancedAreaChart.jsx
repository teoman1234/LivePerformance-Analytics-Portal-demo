import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

/**
 * EnhancedAreaChart Component
 * Professional AreaChart with gradient fill, custom tooltips, and formatted Y-axis
 */
export default function EnhancedAreaChart({ 
  data = [], 
  label = 'Revenue',
  color = '#60C3C9',
  gradientStart = 0.4,
  gradientEnd = 0,
  height = 300,
  showCurrency = true,
  currencySymbol = '₺',
  dateFormat = 'short', // 'short' = DD/MM, 'long' = DD/MM/YYYY
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, hexToRgba(color, gradientStart));
    gradient.addColorStop(1, hexToRgba(color, gradientEnd));

    // Format labels based on date
    const labels = data.map(item => {
      if (item.date) {
        const d = new Date(item.date);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          return dateFormat === 'long' ? `${day}/${month}/${d.getFullYear()}` : `${day}/${month}`;
        }
        return item.date;
      }
      return item.label || '';
    });

    const values = data.map(item => item.value ?? item.tokens ?? item.revenue ?? 0);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: color,
            borderWidth: 1,
            cornerRadius: 8,
            padding: 14,
            displayColors: false,
            titleFont: {
              size: 13,
              weight: '600',
            },
            bodyFont: {
              size: 12,
            },
            callbacks: {
              title: function(context) {
                const item = data[context[0].dataIndex];
                if (item?.date) {
                  const d = new Date(item.date);
                  if (!isNaN(d.getTime())) {
                    return d.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }
                }
                return context[0].label;
              },
              label: function(context) {
                const value = context.parsed.y;
                if (showCurrency) {
                  return `${label}: ${formatCurrency(value, currencySymbol)}`;
                }
                return `${label}: ${formatNumber(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(148, 163, 184, 0.08)',
              drawBorder: false,
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11,
              },
              padding: 8,
              callback: function(value) {
                if (showCurrency) {
                  return formatCompactCurrency(value);
                }
                return formatCompactNumber(value);
              },
            },
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, label, color, height, showCurrency, currencySymbol, dateFormat, gradientStart, gradientEnd]);

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// Helper functions
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

function formatCurrency(n, symbol = '₺') {
  return `${symbol}${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatCompactNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function formatCompactCurrency(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

/**
 * MultiLineAreaChart Component
 * For comparing multiple datasets
 */
export function MultiLineAreaChart({
  datasets = [],
  height = 300,
  showLegend = true,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || datasets.length === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const chartDatasets = datasets.map((ds, index) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, hexToRgba(ds.color, 0.3));
      gradient.addColorStop(1, hexToRgba(ds.color, 0));

      return {
        label: ds.label,
        data: ds.data.map(d => d.value ?? d),
        borderColor: ds.color,
        backgroundColor: gradient,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      };
    });

    const labels = datasets[0]?.data.map(d => {
      if (d.date) {
        const date = new Date(d.date);
        if (!isNaN(date.getTime())) {
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
      }
      return d.label || '';
    }) || [];

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: chartDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: showLegend,
            position: 'top',
            align: 'end',
            labels: {
              color: '#94a3b8',
              font: { size: 11 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(148, 163, 184, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { 
              color: '#64748b',
              font: { size: 10 },
              maxRotation: 0,
            },
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: (value) => formatCompactNumber(value),
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [datasets, height, showLegend]);

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
