import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    mockApi.startSimulation();
    const unsubscribe = mockApi.subscribe((newData) => {
      setAlerts(newData.alerts);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="alert-feed-panel">
      <div className="header">
        <h3>Alertas</h3>
        <span className="live-dot">●</span>
      </div>

      <div className="feed-list">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-item ${alert.level}`}>
            <div className="alert-icon">
              {alert.level === 'critical' && '🚨'}
              {alert.level === 'warning' && '⚠️'}
              {alert.level === 'info' && 'ℹ️'}
            </div>
            <div className="alert-content">
              <div className="alert-top">
                <span className="alert-title">{alert.title}</span>
                <span className="alert-time">{alert.time}</span>
              </div>
              <p className="alert-desc">{alert.desc}</p>
            </div>
            <button className="dismiss-btn" onClick={() => mockApi.dismissAlert(alert.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
        {alerts.length === 0 && <div className="empty-state">Sin alertas activas</div>}
      </div>

      <style>{`
        /* ... existing styles ... */
        .dismiss-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 1.2rem;
            line-height: 1;
            cursor: pointer;
            padding: 0 4px;
            opacity: 0.5;
            transition: opacity 0.2s;
            margin-left: 0.5rem;
        }
        .dismiss-btn:hover {
            opacity: 1;
            color: var(--text-main);
        }

        .alert-feed-panel {
          height: 100%;
        display: flex;
        flex-direction: column;
           /* Intentionally transparent here as wrapper handles glass in dashboard.astro or we add it here? 
              Based on plan, we wrap it or style it. Let's adding glass style here for safety.
           */
        }

        .header {
          display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        }

        .header h3 {
          margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-main);
        }

        .live-dot {
          color: var(--acc-danger);
        animation: blink 2s infinite;
        font-size: 0.8rem;
        }

        @keyframes blink {
          0 % { opacity: 1; }
          50% {opacity: 0.2; }
        100% {opacity: 1; }
        }

        .feed-list {
          display: flex;
        flex-direction: column;
        gap: 0.85rem;
        overflow-y: auto;
        flex: 1;
        padding-right: 4px;
        }

        /* Custom scrollbar for feed */
        .feed-list::-webkit-scrollbar {
          width: 4px;
        }
        .feed-list::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
        border-radius: 4px;
        }

        .alert-item {
          display: flex;
        gap: 1rem;
        padding: 1rem;
        border-radius: 12px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        position: relative;
        overflow: hidden;
        transition: transform 0.2s;
        }

        .alert-item:hover {
          transform: translateX(2px);
        background: rgba(255,255,255,0.05);
        }

        .alert-item::before {
          content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        }

        .alert-item.critical::before {
          background: var(--acc-danger);
        box-shadow: 2px 0 10px rgba(239, 68, 68, 0.4);
        }

        .alert-item.critical {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), transparent);
        }

        .alert-item.warning::before {
          background: var(--acc-warning);
        box-shadow: 2px 0 10px rgba(245, 158, 11, 0.4);
        }

        .alert-item.warning {
          background: linear-gradient(90deg, rgba(245, 158, 11, 0.1), transparent);
        }

        .alert-item.info::before {
          background: var(--acc-primary);
        box-shadow: 2px 0 10px rgba(56, 189, 248, 0.4);
        }

        .alert-item.info {
          background: linear-gradient(90deg, rgba(56, 189, 248, 0.1), transparent);
        }

        .alert-icon {
          font - size: 1.25rem;
        padding-top: 2px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-top {
          display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.35rem;
        }

        .alert-title {
          font - weight: 600;
        font-size: 0.9rem;
        color: var(--text-main);
        }

        .alert-time {
          font - size: 0.75rem;
        color: var(--text-muted);
        background: rgba(0,0,0,0.2);
        padding: 2px 6px;
        border-radius: 4px;
        }

        .alert-desc {
          margin: 0;
        font-size: 0.85rem;
        color: rgba(255,255,255,0.8);
        line-height: 1.4;
        }

        .empty-state {
          text - align: center;
        padding: 3rem;
        color: var(--text-muted);
        font-size: 0.95rem;
        font-style: italic;
        background: rgba(255,255,255,0.02);
        border-radius: 12px;
        }
      `}</style>
    </div>
  );
}
