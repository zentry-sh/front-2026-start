
import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/api';

export default function ClimateMonitor() {
    const [data, setData] = useState(null);

    useEffect(() => {
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            setData(newData.climate);
        });
        return () => unsubscribe();
    }, []);

    if (!data) return <div className="loading">...</div>;

    return (
        <div className="climate-panel">
            <div className="header">
                <h3>Predicción Climática</h3>
                <span className="location">Zona Norte</span>
            </div>

            <div className="main-metric">
                <div className="temp-display">
                    <span className="temp-val">{Math.round(data.temp)}°</span>
                    <div className="weather-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sun-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    </div>
                </div>
                <div className="trend-indicator">
                    Tendencia: {data.trend === 'rising' ? 'Sube ↗' : data.trend === 'falling' ? 'Baja ↘' : 'Estable →'}
                </div>
            </div>

            <div className="secondary-metrics">
                <div className="sec-metric">
                    <span className="label">Humedad</span>
                    <span className="val">{Math.round(data.humidity)}%</span>
                    <div className="bar-bg">
                        <div className="bar-fill" style={{ width: `${data.humidity}%` }}></div>
                    </div>
                </div>
                <div className="sec-metric">
                    <span className="label">Prob. Lluvia</span>
                    <span className="val">{Math.round(data.rainProb)}%</span>
                    <div className="bar-bg">
                        <div className="bar-fill blue" style={{ width: `${data.rainProb}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="forecast-mini">
                <div className="day">
                    <span>Hoy</span>
                    <div className="day-icon">☀️</div>
                    <span>28°</span>
                </div>
                <div className="day">
                    <span>Mañ</span>
                    <div className="day-icon">⛅</div>
                    <span>26°</span>
                </div>
                <div className="day">
                    <span>Mié</span>
                    <div className="day-icon">🌧️</div>
                    <span>22°</span>
                </div>
            </div>

            <style>{`
        .climate-panel {
          background: linear-gradient(145deg, var(--bg-panel), rgba(30, 41, 59, 0.8));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          color: white;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .location {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255,255,255,0.05);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .main-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .temp-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .temp-val {
          font-size: 3.5rem;
          font-weight: 700;
          background: -webkit-linear-gradient(top, #fff, #aaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sun-icon {
          color: var(--acc-warning);
          animation: rotate 10s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .trend-indicator {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }

        .secondary-metrics {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .sec-metric {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sec-metric .label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .sec-metric .val {
          font-size: 1rem;
          font-weight: 600;
          align-self: flex-end;
          margin-top: -1.2rem;
        }

        .bar-bg {
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--acc-success);
          width: 50%;
          transition: width 0.5s ease;
        }

        .bar-fill.blue {
          background: var(--acc-primary);
        }

        .forecast-mini {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1rem;
          margin-top: auto;
        }

        .day {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .day-icon {
          font-size: 1.25rem;
          margin: 0.25rem 0;
        }
      `}</style>
        </div>
    );
}
