
import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';

export default function EfficiencyRecommendations() {
    const [recs, setRecs] = useState([]);

    useEffect(() => {
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            setRecs(newData.recommendations);
        });
        return () => unsubscribe();
    }, []);

    const handleApply = (id) => {
        // Simulate applying the recommendation locally for UI feedback
        setRecs(prev => prev.map(rec =>
            rec.id === id ? { ...rec, applied: true } : rec
        ));
        // In a real app, this would call an API
    };

    return (
        <div className="recs-panel">
            <div className="header">
                <h3>Recomendaciones de Eficiencia</h3>
                <div className="ai-badge">
                    <span>AI Powered</span>
                </div>
            </div>

            <div className="recs-list">
                {recs.map(rec => (
                    <div key={rec.id} className={`rec-item ${rec.applied ? 'applied' : ''}`}>
                        <div className="rec-left">
                            <div className={`rec-icon ${rec.type}`}>
                                {rec.type === 'cooling' ? '❄️' : '⚡'}
                            </div>
                            <div className="rec-info">
                                <h4>{rec.title}</h4>
                                <p>{rec.desc}</p>
                                <div className="rec-tags">
                                    <span className="tag impact">{rec.impact === 'high' ? 'Alto Impacto' : 'Impacto Medio'}</span>
                                    <span className="tag saving">Ahorro: {rec.saving}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            className="apply-btn"
                            onClick={() => handleApply(rec.id)}
                            disabled={rec.applied}
                        >
                            {rec.applied ? 'Aplicado' : 'Aplicar'}
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
        .recs-panel {
          background: var(--bg-panel);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.5rem;
          color: white;
          grid-column: span 2; /* Spans 2 cols in some layouts */
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .ai-badge {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .recs-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rec-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }

        .rec-item.applied {
          opacity: 0.6;
          border-color: var(--acc-success);
          background: rgba(16, 185, 129, 0.05);
        }

        .rec-left {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          flex: 1;
        }

        .rec-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          background: rgba(255,255,255,0.05);
        }

        .rec-icon.cooling { background: rgba(14, 165, 233, 0.1); }
        .rec-icon.power { background: rgba(245, 158, 11, 0.1); }

        .rec-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .rec-info p {
          margin: 0 0 0.75rem 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .rec-tags {
          display: flex;
          gap: 0.5rem;
        }

        .tag {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .tag.impact { background: rgba(255,255,255,0.1); }
        .tag.saving { background: rgba(16, 185, 129, 0.15); color: var(--acc-success); }

        .apply-btn {
          background: var(--acc-primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .apply-btn:hover:not(:disabled) {
          background: #0284c7;
        }

        .apply-btn:disabled {
          background: transparent;
          color: var(--acc-success);
          cursor: default;
        }
      `}</style>
        </div>
    );
}
