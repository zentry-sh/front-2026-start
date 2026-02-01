import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';

export default function CoolingControl() {
    const [data, setData] = useState(null);

    // Local state for controls to show interaction immediately
    const [targetTemp, setTargetTemp] = useState(18);

    useEffect(() => {
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            setData(newData.coolingSystem);
        });
        return () => unsubscribe();
    }, []);

    if (!data) return <div className="loading">Cargando sistema...</div>;

    return (
        <div className="cooling-dashboard">
            {/* Main Status Panel */}
            <div className="status-panel glass-panel">
                <div className="panel-header">
                    <h3>Estado del Sistema</h3>
                    <span className={`status-badge ${data.chillerStatus}`}>
                        {data.chillerStatus === 'active' ? 'ACTIVO' : 'STANDBY'}
                    </span>
                </div>

                <div className="gauges-grid">
                    <div className="gauge-item">
                        <span className="label">Carga Térmica</span>
                        <div className="value-large">{Math.round(data.coolingLoad)}%</div>
                        <div className="progress-bar">
                            <div className="fill" style={{ width: `${data.coolingLoad}%`, background: 'var(--acc-primary)' }}></div>
                        </div>
                    </div>

                    <div className="gauge-item">
                        <span className="label">Velocidad Ventilador</span>
                        <div className="value-large">{Math.round(data.fanSpeed)} <small>RPM</small></div>
                        <div className="progress-bar">
                            <div className="fill" style={{ width: `${(data.fanSpeed / 3000) * 100}%`, background: 'var(--acc-secondary)' }}></div>
                        </div>
                    </div>

                    <div className="gauge-item">
                        <span className="label">Válvula 3-Vías</span>
                        <div className="value-large">{Math.round(data.valvePosition)}%</div>
                        <div className="progress-bar">
                            <div className="fill" style={{ width: `${data.valvePosition}%`, background: 'var(--acc-success)' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Temperature Delta Visualization */}
            <div className="delta-panel glass-panel">
                <h3>Delta T (ΔT) Monitor</h3>
                <div className="delta-viz">
                    <div className="pipe cold">
                        <span className="pipe-label">Inlet</span>
                        <span className="pipe-val">{data.inletTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="chiller-unit">
                        <div className="fan-animation"></div>
                    </div>
                    <div className="pipe hot">
                        <span className="pipe-label">Return</span>
                        <span className="pipe-val">{data.returnTemp.toFixed(1)}°C</span>
                    </div>
                </div>
                <div className="delta-value">
                    ΔT: {(data.returnTemp - data.inletTemp).toFixed(1)}°C
                </div>
            </div>

            {/* Manual Controls */}
            <div className="controls-panel glass-panel">
                <h3>Control Manual</h3>
                <div className="control-group">
                    <label>Set Point Temperatura</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="16" max="24" step="0.5"
                            value={targetTemp}
                            onChange={(e) => setTargetTemp(e.target.value)}
                        />
                        <span className="slider-val">{targetTemp}°C</span>
                    </div>
                </div>

                <div className="control-actions">
                    <button className="action-btn emergency">Parada Emergencia</button>
                    <button className="action-btn mode">Cambiar Modo Eco</button>
                </div>
            </div>

            <style>{`
        .cooling-dashboard {
            display: grid;
            grid-template-columns: 2fr 1fr;
            grid-template-rows: auto auto;
            gap: 1.5rem;
            height: 100%;
        }

        .glass-panel {
            background: var(--glass-surface);
            backdrop-filter: blur(var(--blur-amount));
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 1.5rem;
        }
        
        .status-panel { grid-column: 1 / 2; grid-row: 1 / 2; }
        .delta-panel { grid-column: 2 / 3; grid-row: 1 / 3; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .controls-panel { grid-column: 1 / 2; grid-row: 2 / 3; }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .panel-header h3 { margin: 0; }

        .status-badge {
            padding: 4px 12px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.8rem;
            letter-spacing: 1px;
        }
        .status-badge.active { background: rgba(56, 189, 248, 0.2); color: var(--acc-primary); border: 1px solid rgba(56, 189, 248, 0.4); }
        
        .gauges-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 2rem;
        }
        
        .gauge-item { text-align: center; }
        .label { color: var(--text-muted); font-size: 0.9rem; display: block; margin-bottom: 0.5rem; }
        .value-large { font-size: 2.5rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .value-large small { font-size: 1rem; color: var(--text-muted); font-weight: 400; }
        
        .progress-bar {
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            margin-top: 1rem;
            overflow: hidden;
        }
        .fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

        /* Delta Viz */
        .delta-viz {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .pipe {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(0,0,0,0.3);
            padding: 1rem;
            border-radius: 12px;
            width: 80px;
        }
        .pipe.cold { border-bottom: 3px solid var(--acc-primary); }
        .pipe.hot { border-bottom: 3px solid var(--acc-danger); }
        
        .pipe-label { font-size: 0.75rem; color: var(--text-muted); }
        .pipe-val { font-size: 1.2rem; font-weight: 700; margin-top: 5px; }
        
        .chiller-unit {
            width: 60px;
            height: 60px;
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .fan-animation {
            width: 40px;
            height: 40px;
            border: 2px dashed rgba(255,255,255,0.4);
            border-radius: 50%;
            animation: spin 2s linear infinite;
        }
        
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .delta-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-main);
        }

        /* Controls */
        .control-group {
            margin-bottom: 1.5rem;
        }
        
        .slider-container {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-top: 0.5rem;
        }
        
        input[type=range] {
            flex: 1;
            height: 6px;
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
            appearance: none;
        }
        
        input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: var(--acc-primary);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
        }
        
        .control-actions {
            display: flex;
            gap: 1rem;
        }
        
        .action-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.05);
            color: white;
            font-weight: 600;
            cursor: pointer;
            flex: 1;
            transition: all 0.2s;
        }
        
        .action-btn.emergency { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: var(--acc-danger); }
        .action-btn.emergency:hover { background: rgba(239, 68, 68, 0.25); }
        
        .action-btn.mode:hover { background: rgba(255,255,255,0.1); }
      `}</style>
        </div>
    );
}
