
import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/api';

const Gauge = ({ value, label, unit, color = '#0ea5e9' }) => {
    const strokeDasharray = 283; // 2 * pi * 45
    const strokeDashoffset = strokeDasharray - (value / 100) * strokeDasharray;

    return (
        <div className="gauge-container">
            <div className="gauge-visual">
                <svg viewBox="0 0 100 100" className="gauge-svg">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
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
            setData(newData.serverMetrics);
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
                    LIVE
                </div>
            </div>

            <div className="gauges-row">
                <Gauge value={data.cpu} label="CPU" color="#0ea5e9" />
                <Gauge value={data.ram} label="RAM" color="#8b5cf6" />
            </div>

            <div className="metrics-list">
                <MetricRow
                    label="Consumo Energía"
                    value={Math.round(data.power)}
                    unit="W"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    }
                />
                <MetricRow
                    label="Temperatura Prom."
                    value={data.temp}
                    unit="°C"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
                    }
                />
            </div>

            <style>{`
        .server-consumption-panel {
          background: var(--bg-panel);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--acc-success);
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pulse {
          width: 6px;
          height: 6px;
          background: var(--acc-success);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .gauges-row {
          display: flex;
          justify-content: space-around;
          margin-bottom: 2rem;
        }

        .gauge-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .gauge-visual {
          width: 100px;
          height: 100px;
          position: relative;
        }

        .gauge-svg {
          transform: rotate(-90deg);
        }

        .gauge-progress {
          transition: stroke-dashoffset 0.5s ease;
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
          font-size: 1.5rem;
          font-weight: 700;
        }

        .value-unit {
          font-size: 0.7rem;
          color: var(--text-muted);
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
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .metric-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--acc-primary);
        }

        .metric-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .metric-val-group {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .metric-value {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .metric-unit {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
