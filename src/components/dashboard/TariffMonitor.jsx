
import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/api';

export default function TariffMonitor() {
    const [data, setData] = useState(null);

    useEffect(() => {
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            setData(newData.tariff);
        });
        return () => unsubscribe();
    }, []);

    if (!data) return null;

    const isPeak = data.period === 'peak';

    return (
        <div className="tariff-card">
            <div className="tariff-content">
                <div className="icon-area">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
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
                <span className="acc-label">Acumulado Hoy:</span>
                <span className="acc-value">${data.accumulatedCost.toFixed(2)}</span>
            </div>

            <style>{`
        .tariff-card {
          background: var(--bg-panel);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tariff-content {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .icon-area {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.1);
          color: var(--acc-warning);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tariff-info {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .price {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .badge {
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .badge.peak {
          background: rgba(239, 68, 68, 0.2);
          color: var(--acc-danger);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .badge.standard {
          background: rgba(14, 165, 233, 0.2);
          color: var(--acc-primary);
          border: 1px solid rgba(14, 165, 233, 0.3);
        }

        .badge.off-peak {
          background: rgba(16, 185, 129, 0.2);
          color: var(--acc-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .accumulated {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .acc-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .acc-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
        }
      `}</style>
        </div>
    );
}
