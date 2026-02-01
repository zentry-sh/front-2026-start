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
    mockApi.applyRecommendation(id);
  };

  return (
    <div className="recs-panel">
      <div className="header">
        <h3>Recomendaciones de Eficiencia</h3>
        <div className="ai-badge">
          <span className="sparkles">✨</span>
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
          background: var(--glass-surface);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 20px;
          padding: 1.5rem;
          color: white;
          grid-column: span 2; 
          height: 100%;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .ai-badge {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .sparkles {
            font-size: 0.9rem;
        }

        .recs-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rec-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .rec-item:hover {
            background: rgba(255, 255, 255, 0.06);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .rec-item.applied {
          opacity: 0.6;
          border-color: var(--acc-success);
          background: rgba(16, 185, 129, 0.05);
        }
        
        .rec-item.applied::after {
            content: '✓';
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 4rem;
            color: var(--acc-success);
            opacity: 0.1;
            font-weight: 900;
        }

        .rec-left {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          flex: 1;
        }

        .rec-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        .rec-icon.cooling { background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.05)); }
        .rec-icon.power { background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05)); }

        .rec-info h4 {
          margin: 0 0 0.35rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .rec-info p {
          margin: 0 0 0.85rem 0;
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .rec-tags {
          display: flex;
          gap: 0.75rem;
        }

        .tag {
          font-size: 0.75rem;
          padding: 3px 10px;
          border-radius: 6px;
          font-weight: 500;
        }

        .tag.impact { 
            background: rgba(255,255,255,0.08); 
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .tag.saving { 
            background: rgba(52, 211, 153, 0.1); 
            color: var(--acc-success); 
            border: 1px solid rgba(52, 211, 153, 0.2);
        }

        .apply-btn {
          background: var(--acc-primary);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
          z-index: 2;
        }

        .apply-btn:hover:not(:disabled) {
          background: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
        }

        .apply-btn:disabled {
          background: transparent;
          color: var(--acc-success);
          cursor: default;
          box-shadow: none;
          border: 1px solid var(--acc-success);
        }
      `}</style>
    </div>
  );
}
