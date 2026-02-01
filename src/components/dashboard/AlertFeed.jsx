
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
                    </div>
                ))}
                {alerts.length === 0 && <div className="empty-state">Sin alertas activas</div>}
            </div>

            <style>{`
        .alert-feed-panel {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .live-dot {
          color: var(--acc-danger);
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }

        .feed-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
          flex: 1;
          padding-right: 4px;
        }

        .alert-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border-left: 3px solid transparent;
        }

        .alert-item.critical {
          background: rgba(239, 68, 68, 0.1);
          border-left-color: var(--acc-danger);
        }

        .alert-item.warning {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: var(--acc-warning);
        }

        .alert-item.info {
          background: rgba(14, 165, 233, 0.1);
          border-left-color: var(--acc-primary);
        }

        .alert-icon {
          font-size: 1.2rem;
        }

        .alert-content {
          flex: 1;
        }

        .alert-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.2rem;
        }

        .alert-title {
          font-weight: 600;
          font-size: 0.85rem;
        }

        .alert-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .alert-desc {
          margin: 0;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.3;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
}
