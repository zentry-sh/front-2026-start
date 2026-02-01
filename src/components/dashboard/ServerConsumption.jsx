import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/api';

const Gauge = ({ value, label, unit, color = '#38bdf8' }) => {
  const strokeDasharray = 283; // 2 * pi * 45
  const strokeDashoffset = strokeDasharray - (value / 100) * strokeDasharray;

  return (
    <div className="gauge-container">
      <div className="gauge-visual">
        <svg viewBox="0 0 100 100" className="gauge-svg">
          <defs>
            <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`url(#grad-${label})`}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="gauge-progress"
          />
        </svg>
        <div className="gauge-value">
          <span className="value-num">{Math.round(value)}</span>
          <span className="value-unit">%</span>
        </div>
      </div>
      <span className="gauge-label">{label}</span>
    </div>
  );
};

const MetricRow = ({ label, value, unit, icon }) => (
  <div className="metric-row">
    <div className="metric-icon">{icon}</div>
    <div className="metric-info">
      <span className="metric-label">{label}</span>
      <div className="metric-val-group">
        <span className="metric-value">{value}</span>
        <span className="metric-unit">{unit}</span>
      </div>
    </div>
  </div>
);

export default function ServerConsumption() {
  const [data, setData] = useState(null);

  useEffect(() => {
    mockApi.startSimulation();
    const unsubscribe = mockApi.subscribe((newData) => {
      setData({ ...newData.serverMetrics });
    });
    return () => {
      unsubscribe();
      // Don't stop simulation here as other components might use it
      // mockApi.stopSimulation(); 
    };
  }, []);

  if (!data) return <div className="loading">Cargando métricas...</div>;

  return (
    <div className="server-consumption-panel">
      <div className="panel-header">
        <h3>Monitoreo Servidores</h3>
        <div className="live-indicator">
          <span className="pulse"></span>
          REALTIME
        </div>
      </div>

      <div className="gauges-row">
        <Gauge value={data.cpu} label="CPU" color="#38bdf8" />
        <Gauge value={data.ram} label="RAM" color="#818cf8" />
      </div>

      <div className="metrics-list">
        <MetricRow
          label="Consumo Energía"
          value={Math.round(data.power)}
          unit="W"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          }
        />
        <MetricRow
          label="Temperatura Prom."
          value={data.temp.toFixed(2)}
          unit="°C"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
          }
        />
      </div>

      <style>{`
        .server-consumption-panel {
          background: var(--glass-surface);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 20px;
          padding: 1.5rem;
          color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        /* Shine effect */
        .server-consumption-panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--acc-success);
          background: rgba(52, 211, 153, 0.1);
          padding: 3px 8px;
          border-radius: 12px;
          border: 1px solid rgba(52, 211, 153, 0.2);
        }

        .pulse {
          width: 5px;
          height: 5px;
          background: var(--acc-success);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--acc-success);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.5); }
          100% { opacity: 1; transform: scale(1); }
        }

        .gauges-row {
          display: flex;
          justify-content: space-around;
          margin-bottom: 2.5rem;
        }

        .gauge-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .gauge-visual {
          width: 110px;
          height: 110px;
          position: relative;
        }

        .gauge-svg {
          transform: rotate(-90deg);
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
        }

        .gauge-progress {
          transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gauge-value {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .value-num {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -1px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        .value-unit {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .gauge-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .metric-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          transition: background 0.3s;
        }
        
        .metric-row:hover {
            background: rgba(255,255,255,0.06);
        }

        .metric-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.1));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--acc-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .metric-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-label {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .metric-val-group {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .metric-value {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        .metric-unit {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
