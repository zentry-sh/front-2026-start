import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/api';

export default function TariffMonitor() {
  const [data, setData] = useState(null);

  useEffect(() => {
    mockApi.startSimulation();
    const unsubscribe = mockApi.subscribe((newData) => {
      setData({ ...newData.tariff });
    });
    return () => unsubscribe();
  }, []);

  if (!data) return null;

  return (
    <div className="tariff-card">
      <div className="tariff-content">
        <div className="icon-area">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
        </div>
        <div className="tariff-info">
          <span className="label">Tarifa Actual / kWh</span>
          <div className="price-row">
            <span className="price">${data.currentPrice}</span>
            <span className={`badge ${data.period}`}>
              {data.period.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="accumulated">
        <span className="acc-label">Acumulado Hoy</span>
        <span className="acc-value">${data.accumulatedCost.toFixed(2)}</span>
      </div>

      <style>{`
        .tariff-card {
          background: var(--glass-surface);
          backdrop-filter: blur(var(--blur-amount));
          -webkit-backdrop-filter: blur(var(--blur-amount));
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .tariff-content {
          display: flex;
          gap: 1.25rem;
          align-items: center;
        }

        .icon-area {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.1));
          color: var(--acc-warning);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(245, 158, 11, 0.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .tariff-info {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .price {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
        }

        .badge {
          font-size: 0.65rem;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .badge.peak {
          background: rgba(239, 68, 68, 0.15);
          color: var(--acc-danger);
          border: 1px solid rgba(239, 68, 68, 0.3);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
        }

        .badge.standard {
          background: rgba(14, 165, 233, 0.15);
          color: var(--acc-primary);
          border: 1px solid rgba(14, 165, 233, 0.3);
        }

        .badge.off-peak {
          background: rgba(16, 185, 129, 0.15);
          color: var(--acc-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .accumulated {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .acc-label {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .acc-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-main);
          background: rgba(255,255,255,0.05);
          padding: 2px 8px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
