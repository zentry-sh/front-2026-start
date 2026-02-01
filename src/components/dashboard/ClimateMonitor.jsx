
import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/api';
import { WeatherService } from '../../services/WeatherService';

export default function ClimateMonitor() {
  const [data, setData] = useState(null);
  const [forecastDays, setForecastDays] = useState([]);

  useEffect(() => {
    mockApi.startSimulation();
    const unsubscribe = mockApi.subscribe((newData) => {
      setData(newData.climate);
    });

    // Load real forecast for valid mini-forecast days
    const loadForecast = async () => {
      const service = WeatherService.getInstance();
      const forecast = await service.fetchForecast();
      if (forecast) {
        const daily = service.projectDaily(forecast.list);
        // Get next 3 days
        const days = Object.keys(daily).sort().slice(0, 3).map(date => {
          const temps = daily[date];
          const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
          return {
            day: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
            temp: Math.round(avg),
            icon: avg > 25 ? '☀️' : avg > 18 ? '⛅' : '🌧️'
          };
        });
        setForecastDays(days);
      }
    };
    loadForecast();

    return () => unsubscribe();
  }, []);

  if (!data) return <div className="loading">...</div>;

  return (
    <div className="climate-panel">
      <div className="header">
        <h3>Predicción Climática</h3>
        <span className="location">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          Zona Norte
        </span>
      </div>

      <div className="main-metric">
        <div className="temp-display">
          <span className="temp-val">{Math.round(data.temp)}°</span>
          <div className="weather-icon-wrapper">
            <div className="sun-glow"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sun-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          </div>
        </div>
        <div className="trend-indicator">
          Tendencia: <span className={data.trend === 'rising' ? 'warm' : 'cool'}>{data.trend === 'rising' ? 'Calentamiento ↗' : data.trend === 'falling' ? 'Enfriamiento ↘' : 'Estable →'}</span>
        </div>
      </div>

      <div className="secondary-metrics">
        <div className="sec-metric">
          <div className="metric-header">
            <span className="label">Humedad</span>
            <span className="val">{Math.round(data.humidity)}%</span>
          </div>
          <div className="bar-bg">
            <div className="bar-fill" style={{ width: `${data.humidity}%` }}></div>
          </div>
        </div>
        <div className="sec-metric">
          <div className="metric-header">
            <span className="label">Prob. Lluvia</span>
            <span className="val">{Math.round(data.rainProb)}%</span>
          </div>
          <div className="bar-bg">
            <div className="bar-fill blue" style={{ width: `${data.rainProb}%` }}></div>
          </div>
        </div>
      </div>

      <div className="forecast-mini">
        {forecastDays.length > 0 ? forecastDays.map((day, idx) => (
          <div key={idx} className="day">
            <span>{day.day.replace('.', '')}</span>
            <div className="day-icon">{day.icon}</div>
            <span>{day.temp}°</span>
          </div>
        )) : (
          <>
            <div className="day">
              <span>HOY</span>
              <div className="day-icon sun">☀️</div>
              <span>--</span>
            </div>
            <div className="day">
              <span>MAÑ</span>
              <div className="day-icon cloud">⛅</div>
              <span>--</span>
            </div>
          </>
        )}
      </div>

      <style>{`
        .climate-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
          color: white;
          /* Glassmorphism applied via container in CSS usually, but here specific styles */
          background: linear-gradient(145deg, rgba(20, 25, 40, 0.6), rgba(30, 40, 60, 0.4));
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 20px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        
        /* Sun glare */
        .climate-panel::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(251, 191, 36, 0.15), transparent 70%);
            z-index: 0;
            pointer-events: none;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .location {
          font-size: 0.75rem;
          color: var(--text-main);
          background: rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .main-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .temp-display {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .temp-val {
          font-size: 4rem;
          font-weight: 700;
          background: linear-gradient(to bottom, #fff 30%, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -2px;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.2));
        }

        .weather-icon-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .sun-glow {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.4);
            animation: pulse-sun 4s infinite ease-in-out;
        }
        
        @keyframes pulse-sun {
            0%, 100% { opacity: 0.5; transform: scale(0.9); }
            50% { opacity: 0.8; transform: scale(1.1); }
        }

        .sun-icon {
          color: var(--acc-warning);
          animation: rotate 20s linear infinite;
          filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .trend-indicator {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
          font-weight: 500;
        }
        
        .trend-indicator span.warm { color: var(--acc-warning); }
        .trend-indicator span.cool { color: var(--acc-primary); }

        .secondary-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .sec-metric {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .sec-metric .label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sec-metric .val {
          font-size: 1rem;
          font-weight: 600;
        }

        .bar-bg {
          width: 100%;
          height: 8px;
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
        }

        .bar-fill {
          height: 100%;
          background: var(--acc-success);
          width: 50%;
          transition: width 0.5s ease;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.4);
        }

        .bar-fill.blue {
          background: var(--acc-primary);
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
        }

        .forecast-mini {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1.5rem;
          margin-top: auto;
          position: relative;
          z-index: 1;
        }

        .day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          flex: 1;
          margin: 0 4px;
          transition: transform 0.2s;
        }
        
        .day:hover {
            background: rgba(255,255,255,0.08);
            transform: translateY(-2px);
        }

        .day span:first-child {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }
        
        .day span:last-child {
            font-weight: 600;
            font-size: 0.95rem;
        }

        .day-icon {
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
}
