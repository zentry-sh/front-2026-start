import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';

export default function CoolingControl() {
    const [data, setData] = useState(null);
    const [realSystem, setRealSystem] = useState(null);

    useEffect(() => {
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            // Force new object references to trigger React re-render
            setData({ ...newData.coolingSystem });
            setRealSystem({
                ...newData.realSystem,
                // Deep clone arrays to ensure child lists re-render
                chillers: [...newData.realSystem.chillers],
                condenserPumps: [...newData.realSystem.condenserPumps],
                chilledPumps: [...newData.realSystem.chilledPumps]
            });
        });
        return () => unsubscribe();
    }, []);

    if (!data || !realSystem) return <div className="loading">Cargando sistema...</div>;

    return (
        <div className="cooling-dashboard">
            {/* Top: Global Status & Delta T (Keep existing visual) */}
            <div className="global-status glass-panel">
                <div className="status-header">
                    <h3>Global Stats</h3>
                    <div className="kpi-row">
                        <div className="kpi">
                            <label>Load</label>
                            <span>{Math.round(data.coolingLoad)}%</span>
                        </div>
                        <div className="kpi">
                            <label>COP</label>
                            <span>3.2</span>
                        </div>
                        <div className="kpi">
                            <label>Power</label>
                            <span>{(realSystem.condenserPumps.filter(p => p.on).length * 45 + realSystem.chillers.filter(c => c.on).length * 150)} kW</span>
                        </div>
                    </div>
                </div>

                <div className="delta-mini">
                    <div className="pipe cold"><small>In</small> {data.inletTemp.toFixed(1)}°</div>
                    <div className="arrow">→</div>
                    <div className="pipe hot"><small>Out</small> {data.returnTemp.toFixed(1)}°</div>
                    <div className="delta-badge">Δ {(data.returnTemp - data.inletTemp).toFixed(1)}</div>
                </div>
            </div>

            {/* Main: Asset Inventory Grid */}
            <div className="assets-grid">
                {/* Chillers Column */}
                <div className="asset-col">
                    <h4 className="col-title">Chillers (CHI)</h4>
                    <div className="card-list">
                        {realSystem.chillers.map(chi => (
                            <div key={chi.id} className={`asset-card ${chi.on ? 'on' : 'off'}`}>
                                <div className="card-header">
                                    <span className="id">{chi.id}</span>
                                    <label className="switch">
                                        <input type="checkbox" checked={chi.on} onChange={() => mockApi.toggleChiller(chi.id)} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="card-body">
                                    <div className="metric">
                                        <span className="lbl">LWT</span>
                                        <span className="val">{chi.leavingTemp.toFixed(1)}°C</span>
                                    </div>
                                    <div className="metric">
                                        <span className="lbl">EWT</span>
                                        <span className="val">{chi.enteringTemp.toFixed(1)}°C</span>
                                    </div>
                                    <div className="metric">
                                        <span className="lbl">Flow</span>
                                        <span className="val">{Math.round(chi.flow)} L/s</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pumps Column */}
                <div className="asset-col">
                    <h4 className="col-title">Pumps (CDWP)</h4>
                    <div className="card-list compact">
                        {realSystem.condenserPumps.map(pump => (
                            <div key={pump.id} className={`asset-card compact ${pump.on ? 'on' : 'off'}`}>
                                <div className="card-header">
                                    <span className="id">{pump.id}</span>
                                    <span className="rpm">{Math.round(pump.rpm)} RPM</span>
                                    <button className="toggle-btn-small" onClick={() => mockApi.togglePump('condenserPumps', pump.id)}>
                                        {pump.on ? 'STOP' : 'START'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h4 className="col-title mt-4">Pumps (CHWP)</h4>
                    <div className="card-list compact">
                        {realSystem.chilledPumps.map(pump => (
                            <div key={pump.id} className={`asset-card compact ${pump.on ? 'on' : 'off'}`}>
                                <div className="card-header">
                                    <span className="id">{pump.id}</span>
                                    <span className="rpm">{Math.round(pump.rpm)} RPM</span>
                                    <button className="toggle-btn-small" onClick={() => mockApi.togglePump('chilledPumps', pump.id)}>
                                        {pump.on ? 'STOP' : 'START'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .cooling-dashboard {
            display: grid;
            grid-template-rows: auto 1fr;
            gap: 1rem;
            height: 100%;
            overflow-y: auto;
            padding-right: 5px;
        }

        .glass-panel {
            background: var(--glass-surface);
            backdrop-filter: blur(var(--blur-amount));
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 1rem 1.5rem;
        }

        .global-status {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .status-header h3 { margin: 0 0 0.5rem 0; font-size: 1rem; color: var(--text-muted); }
        
        .kpi-row { display: flex; gap: 2rem; }
        .kpi { display: flex; flex-direction: column; }
        .kpi label { font-size: 0.75rem; color: var(--text-muted); }
        .kpi span { font-size: 1.25rem; font-weight: 700; color: #fff; }

        .delta-mini {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(0,0,0,0.2);
            padding: 0.5rem 1rem;
            border-radius: 12px;
        }
        .pipe { font-weight: 600; font-size: 1.1rem; }
        .pipe small { font-size: 0.7rem; color: var(--text-muted); margin-right: 4px; font-weight: 400; }
        .pipe.cold { color: var(--acc-primary); }
        .pipe.hot { color: var(--acc-danger); }
        .delta-badge { background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 6px; font-size: 0.9rem; }

        .assets-grid {
            display: grid;
            grid-template-columns: 2fr 1.5fr;
            gap: 1.5rem;
        }
        
        .col-title {
            margin: 0 0 1rem 0;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-muted);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 0.5rem;
        }
        
        .mt-4 { margin-top: 1.5rem; }

        .card-list {
            display: grid;
            gap: 0.75rem;
        }
        
        /* Chiller Card */
        .asset-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 1rem;
            transition: all 0.2s;
        }
        
        .asset-card.on {
            border-color: rgba(56, 189, 248, 0.3);
            background: linear-gradient(90deg, rgba(56, 189, 248, 0.05), transparent);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }
        
        .id { font-weight: 700; color: #fff; }
        
        .card-body {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 0.5rem;
        }
        
        .metric { display: flex; flex-direction: column; }
        .metric .lbl { font-size: 0.65rem; color: var(--text-muted); }
        .metric .val { font-size: 0.9rem; font-weight: 600; font-variant-numeric: tabular-nums; }

        /* Compact Pump Card */
        .asset-card.compact {
            padding: 0.75rem 1rem;
        }
        .asset-card.compact .card-header { margin-bottom: 0; }
        
        .rpm { font-family: monospace; color: var(--acc-secondary); font-size: 0.9rem; }
        
        .toggle-btn-small {
            background: rgba(255,255,255,0.1);
            border: none;
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            cursor: pointer;
        }
        .toggle-btn-small:hover { background: rgba(255,255,255,0.2); }

        /* Switch UI */
        .switch { position: relative; display: inline-block; width: 34px; height: 20px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #334155; transition: .4s; border-radius: 20px;
        }
        .slider:before {
            position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px;
            background-color: white; transition: .4s; border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--acc-success); }
        input:checked + .slider:before { transform: translateX(14px); }
      `}</style>
        </div>
    );
}
