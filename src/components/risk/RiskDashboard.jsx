import React, { useState, useEffect, useRef } from 'react';
import { mockApi } from '../../services/api';
import EarthGlobe from '../dashboard/EarthGlobe';

export default function RiskDashboard() {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState({ hz: [] });
    const globeRef = useRef(null);

    useEffect(() => {
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            // Clone objects to force React re-render, especially nested riskMetrics
            setData({
                ...newData,
                riskMetrics: { ...newData.riskMetrics, grid: { ...newData.riskMetrics.grid }, water: { ...newData.riskMetrics.water } }
            });

            // Maintain history for Sparklines
            setHistory(prev => {
                const newHz = [...prev.hz, newData.riskMetrics.grid.frequency].slice(-50); // Keep last 50 points
                return { hz: newHz };
            });
        });
        return () => unsubscribe();
    }, []);

    if (!data) return <div className="loading">Inicializando Análisis de Riesgo...</div>;

    const { riskMetrics, locationName } = data;

    // Helper for grid sparkline
    const Sparkline = ({ points, color = '#34d399', min = 59.9, max = 60.1 }) => {
        const height = 40;
        const width = 120;

        // Normalize points to SVG path
        const pathData = points.map((p, i) => {
            const x = (i / (points.length - 1 || 1)) * width;
            const y = height - ((p - min) / (max - min)) * height;
            return `${x},${y}`;
        }).join(' L ');

        return (
            <svg width="100%" height="40" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="gradSpark" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M 0,${height} L ${pathData} L ${width},${height} Z`} fill="url(#gradSpark)" />
                <path d={`M ${pathData}`} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
        );
    };

    return (
        <div className="risk-dashboard">
            {/* TOP ROW: Vital Telemetry (KRI) */}
            <div className="kri-grid">
                {/* 1. GRID HEALTH */}
                <div className="kri-card">
                    <div className="kri-header">
                        <span className="icon">⚡</span>
                        <span className="lbl">Estabilidad de Red</span>
                    </div>
                    <div className="kri-body">
                        <div className="main-stat">
                            <span className="val">{riskMetrics.grid.frequency.toFixed(3)}</span>
                            <span className="unit">Hz</span>
                        </div>
                        <div className="spark-container">
                            <Sparkline points={history.hz} color={Math.abs(riskMetrics.grid.frequency - 60) > 0.05 ? '#fbbf24' : '#34d399'} />
                        </div>
                    </div>
                    <div className="kri-footer">
                        <span>{riskMetrics.grid.voltage.toFixed(1)} V</span>
                        <span className={`status ${riskMetrics.grid.stability}`}>{riskMetrics.grid.stability.toUpperCase()}</span>
                    </div>
                </div>

                {/* 2. WATER AUTONOMY */}
                <div className="kri-card">
                    <div className="kri-header">
                        <span className="icon">💧</span>
                        <span className="lbl">Suministro Hídrico</span>
                    </div>
                    <div className="kri-body centered">
                        <div className="circle-gauge">
                            <svg viewBox="0 0 36 36">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle-fill" strokeDasharray={`${riskMetrics.water.reservoirLevel}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="gauge-val">
                                <span>{Math.round(riskMetrics.water.reservoirLevel)}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="kri-footer">
                        <span>Reservas: {riskMetrics.water.daysOfAutonomy.toFixed(1)} días</span>
                    </div>
                </div>

                {/* 3. SEISMIC */}
                <div className="kri-card">
                    <div className="kri-header">
                        <span className="icon">🌋</span>
                        <span className="lbl">Sensores Sísmicos</span>
                    </div>
                    <div className="kri-body">
                        <div className="seismic-readout">
                            <label>Vibración Local (g)</label>
                            <div className="bar-g">
                                <div className="fill" style={{ width: `${(riskMetrics.seismic.localVibration * 10000)}%` }}></div>
                            </div>
                            <span className="g-val">{riskMetrics.seismic.localVibration.toFixed(4)} g</span>
                        </div>
                        <div className="last-event">
                            <small>Último Evento:</small>
                            <strong>Mag {riskMetrics.seismic.lastEvent.mag}</strong>
                        </div>
                    </div>
                </div>

                {/* 4. FUEL / OPS */}
                <div className="kri-card">
                    <div className="kri-header">
                        <span className="icon">⛽</span>
                        <span className="lbl">Autonomía Diesel</span>
                    </div>
                    <div className="kri-body centered">
                        <div className="fuel-tank">
                            <div className="fuel-level" style={{ height: `${riskMetrics.fuel.dieselLevel}%` }}></div>
                            <span className="fuel-text">{riskMetrics.fuel.dieselLevel}%</span>
                        </div>
                    </div>
                    <div className="kri-footer">
                        <span>{riskMetrics.fuel.runtimeHours} hrs operación continua</span>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: GEOSPATIAL + ACTIONS */}
            <div className="geo-row">
                <div className="map-container glass-panel">
                    <h3>Amenazas Regionales</h3>
                    <div className="map-wrapper">
                        {/* Reusing existing Globe component for visualization */}
                        <EarthGlobe />
                    </div>
                    <div className="map-overlay">
                        <div className="region-badge">
                            <strong>{locationName}</strong>
                            <span className="risk-score">Nivel Riesgo: MEDIO</span>
                        </div>
                    </div>
                </div>

                <div className="controls-container glass-panel">
                    <h3>Protocolos de Emergencia</h3>

                    <div className="control-group">
                        <div className="switch-row">
                            <div className="switch-info">
                                <h4>Modo Isla (Grid Decoupling)</h4>
                                <p>Desconectar de CFE y activar gen. locales.</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="switch-row">
                            <div className="switch-info">
                                <h4>Bypass Agua de Emergencia</h4>
                                <p>Habilitar toma secundaria de pozo.</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="drill-btn-container">
                        <button className="drill-btn">INICIAR SIMULACRO DE SISMO</button>
                    </div>
                </div>
            </div>

            <style>{`
                .risk-dashboard {
                    display: grid;
                    grid-template-rows: auto 1fr;
                    gap: 1.5rem;
                    height: 100%;
                    overflow-y: auto;
                    padding-right: 5px;
                }

                /* KRI GRID */
                .kri-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }

                .kri-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 160px;
                }

                .kri-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .kri-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .kri-body.centered { align-items: center; }

                .main-stat {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                }
                .main-stat .val { font-size: 2rem; font-weight: 700; color: #fff; }
                .main-stat .unit { color: var(--text-muted); }

                /* Sparkline */
                .spark-container {
                    width: 100%;
                    height: 40px;
                    margin-top: 0.5rem;
                }

                /* Circular Gauge */
                .circle-gauge {
                    width: 80px;
                    height: 80px;
                    position: relative;
                }
                .circle-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 3; }
                .circle-fill { fill: none; stroke: var(--acc-primary); stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 0.5s ease; stroke-dasharray: 0, 100; }
                .gauge-val {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    display: flex; justify-content: center; align-items: center;
                    font-weight: 700; font-size: 1.2rem; color: #fff;
                }

                /* Seismic */
                .bar-g {
                    width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin: 5px 0; overflow: hidden;
                }
                .bar-g .fill { height: 100%; background: var(--acc-warning); transition: width 0.1s; }
                .last-event { margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between; }

                /* Fuel Tank */
                .fuel-tank {
                    width: 40px; height: 60px; border: 2px solid rgba(255,255,255,0.2); border-radius: 4px; position: relative; display: flex; align-items: flex-end; justify-content: center; overflow: hidden;
                }
                .fuel-level { width: 100%; background: var(--acc-secondary); transition: height 0.5s; opacity: 0.8; }
                .fuel-text { position: absolute; bottom: 4px; font-size: 0.8rem; font-weight: 700; text-shadow: 0 1px 2px black; z-index: 2; }


                .kri-footer {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    display: flex;
                    justify-content: space-between;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding-top: 0.5rem;
                    margin-top: 0.5rem;
                }
                .status.stable { color: var(--acc-success); }


                /* MIDDLE ROW */
                .geo-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 1.5rem;
                    min-height: 0; /* Important for grid nesting */
                }

                .glass-panel {
                    background: var(--glass-surface);
                    backdrop-filter: blur(var(--blur-amount));
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                }

                .map-container h3, .controls-container h3 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    color: rgba(255,255,255,0.8);
                }

                .map-wrapper { flex: 1; border-radius: 12px; overflow: hidden; background: rgba(0,0,0,0.2); position: relative; }
                .map-overlay { position: absolute; bottom: 1rem; left: 1rem; pointer-events: none; }
                .region-badge {
                    background: rgba(20,25,40,0.85); backdrop-filter: blur(8px);
                    padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border);
                    color: #fff; display: flex; flex-direction: column;
                }
                .risk-score { font-size: 0.75rem; color: var(--acc-warning); font-weight: 600; margin-top: 2px; }

                /* Controls */
                .control-group { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: auto; }
                .switch-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
                .switch-info h4 { margin: 0; font-size: 0.9rem; color: #fff; }
                .switch-info p { margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-muted); }

                /* Toggle Switch */
                .toggle-switch { position: relative; width: 44px; height: 24px; }
                .toggle-switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--acc-danger); }
                input:checked + .slider:before { transform: translateX(20px); }

                .drill-btn {
                    width: 100%;
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.5);
                    color: #f87171;
                    padding: 1rem;
                    font-weight: 700;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 2rem;
                }
                .drill-btn:hover {
                    background: rgba(239, 68, 68, 0.3);
                    box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
                }

            `}</style>
        </div>
    );
}
