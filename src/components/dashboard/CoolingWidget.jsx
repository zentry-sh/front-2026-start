import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';

export default function CoolingWidget() {
    const [data, setData] = useState(null);
    const [realSystem, setRealSystem] = useState(null);

    useEffect(() => {
        // Ensure simulation is running
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            setData(newData.coolingSystem);
            setRealSystem(newData.realSystem);
        });
        return () => unsubscribe();
    }, []);

    if (!data || !realSystem) return <div className="p-4 text-xs text-slate-400">Cargando...</div>;

    const activeChillers = realSystem.chillers.filter(c => c.on).length;
    const totalPower = (realSystem.condenserPumps.filter(p => p.on).length * 45 + realSystem.chillers.filter(c => c.on).length * 150);
    const avgLWT = realSystem.chillers.filter(c => c.on).reduce((acc, c) => acc + c.leavingTemp, 0) / (activeChillers || 1);

    return (
        <div className="cooling-widget">
            <div className="widget-header">
                <h3>Sistema de Enfriamiento</h3>
                <span className={`status-badge ${activeChillers > 0 ? 'active' : 'idle'}`}>
                    {activeChillers > 0 ? 'En Línea' : 'Standby'}
                </span>
            </div>

            <div className="kpi-grid">
                <div className="widget-kpi">
                    <span className="label">Chillers Activos</span>
                    <span className="value">{activeChillers} <small>/ 6</small></span>
                </div>
                <div className="widget-kpi">
                    <span className="label">Potencia Total</span>
                    <span className="value">{totalPower} <small>kW</small></span>
                </div>
                <div className="widget-kpi">
                    <span className="label">Temp. Salida (Prom)</span>
                    <span className="value">
                        {activeChillers > 0 ? avgLWT.toFixed(1) : '--'}
                        <small>°C</small>
                    </span>
                </div>
            </div>

            <div className="visual-mini">
                {/* Simple visualization of load */}
                <div className="load-bar-label">Carga Térmica Global</div>
                <div className="load-track">
                    <div className="load-fill" style={{ width: `${data.coolingLoad}%` }}></div>
                </div>
                <div className="load-val">{Math.round(data.coolingLoad)}%</div>
            </div>

            <style>{`
                .cooling-widget {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-panel);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 1.5rem;
                }
                .widget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .widget-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    color: #fff;
                    font-weight: 600;
                }
                .status-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .status-badge.active { background: rgba(16, 185, 129, 0.1); color: var(--acc-success); }
                .status-badge.idle { background: rgba(255, 255, 255, 0.1); color: var(--text-muted); }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .widget-kpi {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .label { font-size: 0.75rem; color: var(--text-muted); }
                .value { font-size: 1.1rem; font-weight: 700; color: #fff; }
                .value small { font-size: 0.8rem; font-weight: 400; color: var(--text-muted); margin-left: 2px; }

                .visual-mini {
                    margin-top: auto;
                }
                .load-bar-label { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; }
                .load-track {
                    width: 100%;
                    height: 8px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 4px;
                }
                .load-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--acc-primary), var(--acc-secondary));
                    transition: width 0.5s ease;
                }
                .load-val { text-align: right; font-size: 0.8rem; font-weight: 600; color: var(--acc-primary); }
            `}</style>
        </div>
    );
}
