import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';
import EarthGlobe from '../dashboard/EarthGlobe';

export default function RiskDashboard() {
    const [data, setData] = useState(null);
    const [rackTemps, setRackTemps] = useState([]);
    const [selectedLocId, setSelectedLocId] = useState('cdmx');

    useEffect(() => {
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            setData(newData);

            // Simulate Rack Temperatures
            // Use global temp + noise
            const baseTemp = newData.serverMetrics.temp;
            const racks = Array.from({ length: 12 }, (_, i) => {
                const noise = (Math.random() - 0.5) * 4;
                const hotspot = (i % 4 === 0) ? 2 : 0;
                return baseTemp + noise + hotspot;
            });
            setRackTemps(racks);
        });
        return () => unsubscribe();
    }, []);

    const handleLocationChange = (e) => {
        const id = e.target.value;
        setSelectedLocId(id);
        mockApi.setLocation(id);
    };

    if (!data) return <div className="loading">Cargando Riesgos Globales...</div>;

    const { riskMetrics, locationName, alerts, registeredLocations } = data;
    const globalRisk = alerts.length > 2 ? 'Alto' : alerts.length > 0 ? 'Medio' : 'Bajo';
    const riskColor = globalRisk === 'Alto' ? 'critical' : globalRisk === 'Medio' ? 'warning' : 'success';

    // Prepare Globe Markers
    // Highlight the current location
    const globalMarkers = registeredLocations ? registeredLocations.map(loc => ({
        lat: loc.lat,
        lon: loc.lon,
        highlight: loc.name === locationName
    })) : [];

    // Find coords to focus globe
    const currentLocObj = registeredLocations?.find(l => l.name === locationName);
    const focusCoords = currentLocObj ? { lat: currentLocObj.lat, lon: currentLocObj.lon } : null;


    return (
        <div className="risk-dashboard">
            {/* LEFT: INCIDENTS & METRICS */}
            <div className="left-panel">
                <div className="location-selector-container">
                    <label>Sede Activa:</label>
                    <select value={selectedLocId} onChange={handleLocationChange} className="loc-select">
                        {registeredLocations?.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>

                {/* 1. Global Status */}
                <div className={`status-card ${riskColor}`}>
                    <div className="icon-box">
                        <span className="icon">🛡️</span>
                    </div>
                    <div className="info">
                        <h3>Nivel de Riesgo Global</h3>
                        <div className="val">{globalRisk.toUpperCase()}</div>
                        <small>{alerts.length} Alertas Activas</small>
                    </div>
                </div>

                {/* 2. Water Stress */}
                <div className="water-card glass-panel">
                    <div className="card-header">
                        <span className="icon">💧</span>
                        <span>Estrés Hídrico & Reservas</span>
                    </div>
                    <div className="water-vis">
                        <div className="reservoir-container">
                            <div className="water-level" style={{ height: `${riskMetrics.water.reservoirLevel}%` }}></div>
                            <div className="level-text">{Math.round(riskMetrics.water.reservoirLevel)}%</div>
                        </div>
                        <div className="water-stats">
                            <div className="stat">
                                <span className="lbl">Autonomía</span>
                                <span className="num">{riskMetrics.water.daysOfAutonomy.toFixed(1)} días</span>
                            </div>
                            <div className="stat">
                                <span className="lbl">Flujo</span>
                                <span className="num">{riskMetrics.water.flowRate} L/s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Incidents */}
                <div className="incidents-panel glass-panel">
                    <h3>Bitácora de Incidentes (Tiempo Real)</h3>
                    <div className="incident-list">
                        {alerts.length === 0 ? (
                            <div className="empty-state">Sin incidentes activos. Operación normal.</div>
                        ) : (
                            alerts.map(alert => (
                                <div key={alert.id} className={`incident-row ${alert.level}`}>
                                    <div className="inc-time">{new Date(alert.id).toLocaleTimeString()}</div>
                                    <div className="inc-info">
                                        <strong>{alert.title}</strong>
                                        <p>{alert.desc}</p>
                                    </div>
                                    <div className="inc-level">{alert.level}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: GLOBAL & THERMAL */}
            <div className="right-panel">
                {/* GLOBAL MAP */}
                <div className="globe-panel glass-panel">
                    <div className="panel-header">
                        <h3>Visibilidad Global</h3>
                        <span className="live-tag">● EN VIVO</span>
                    </div>
                    <div className="globe-wrapper">
                        <EarthGlobe markers={globalMarkers} focusOn={focusCoords} />
                    </div>
                </div>

                {/* THERMAL */}
                <div className="thermal-panel glass-panel">
                    <div className="panel-header">
                        <h3>Monitoreo Térmico ({locationName})</h3>
                    </div>
                    <div className="heatmap-grid">
                        {rackTemps.map((temp, i) => {
                            const isHot = temp > 28;
                            const isCrit = temp > 35;
                            const statusClass = isCrit ? 'crit' : isHot ? 'warn' : 'ok';
                            return (
                                <div key={i} className={`rack-unit ${statusClass}`}>
                                    <div className="rack-id">R-{100 + i}</div>
                                    <div className="rack-temp">{temp.toFixed(1)}°C</div>
                                    <div className="heat-bar">
                                        <div className="bar-fill" style={{ height: `${Math.min(100, (temp / 40) * 100)}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                .risk-dashboard {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 1.5rem;
                    height: 100%;
                    padding-right: 5px;
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

                /* LEFT PANEL */
                .left-panel { display: flex; flex-direction: column; gap: 1.5rem; }
                
                .location-selector-container {
                    display: flex; flex-direction: column; gap: 0.5rem;
                }
                .location-selector-container label {
                    font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;
                }
                .loc-select {
                    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2);
                    color: #fff; padding: 0.8rem; border-radius: 8px; font-size: 1rem;
                    cursor: pointer; outline: none; transition: border-color 0.2s;
                }
                .loc-select:hover { border-color: rgba(255,255,255,0.5); }

                .status-card {
                    padding: 1.5rem; border-radius: 20px;
                    background: rgba(255,255,255,0.05);
                    display: flex; align-items: center; gap: 1.5rem;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .status-card.critical { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); }
                .status-card.warning { background: rgba(234, 179, 8, 0.1); border-color: rgba(234, 179, 8, 0.3); }
                .status-card.success { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }

                .icon-box { font-size: 2rem; }
                .info h3 { margin: 0; font-size: 0.9rem; opacity: 0.8; }
                .info .val { font-size: 1.8rem; font-weight: 700; color: #fff; }

                 .water-card .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--text-muted); }
                .water-vis { display: flex; gap: 2rem; align-items: center; }
                 .reservoir-container {
                     width: 60px; height: 100px; border: 2px solid rgba(255,255,255,0.2); border-radius: 8px;
                     position: relative; display: flex; align-items: flex-end; justify-content: center; overflow: hidden;
                     background: rgba(0,0,0,0.2);
                }
                .water-level { width: 100%; background: #3b82f6; transition: height 0.5s; opacity: 0.8; }
                .level-text { position: absolute; bottom: 5px; font-weight: 700; font-size: 0.9rem; text-shadow: 0 1px 2px black; z-index: 2; color: #fff; }
                .water-stats { display: flex; flex-direction: column; gap: 1rem; }
                .stat { display: flex; flex-direction: column; }
                .stat .lbl { font-size: 0.8rem; color: var(--text-muted); }
                .stat .num { font-size: 1.2rem; font-weight: 600; color: #fff; }

                /* INCIDENTS */
                .incidents-panel { flex: 1; min-height: 200px; }
                .incidents-panel h3 { margin: 0 0 1rem 0; font-size: 1rem; }
                .incident-list { display: flex; flex-direction: column; gap: 0.5rem; overflow-y: auto; flex: 1; min-height: 100px; max-height: 300px; }
                .incident-row {
                    background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px;
                    display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: center;
                    border-left: 3px solid transparent;
                }
                .incident-row.warning { border-left-color: var(--acc-warning); }
                .incident-row.critical { border-left-color: var(--acc-danger); }
                .inc-time { font-size: 0.75rem; color: var(--text-muted); }
                .inc-info strong { display: block; font-size: 0.9rem; color: #eee; }
                .inc-info p { margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-muted); }
                .inc-level { font-size: 0.7rem; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); }
                .empty-state { text-align: center; color: var(--text-muted); padding: 2rem; }

                /* RIGHT PANEL: Stacked Globe + Thermal */
                .right-panel { display: flex; flex-direction: column; gap: 1.5rem; height: 100%; overflow: hidden; }
                
                .globe-panel { flex: 1; min-height: 300px; padding: 0; position: relative; overflow: hidden; }
                .globe-wrapper { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
                .panel-header {
                    position: absolute; top: 1rem; left: 1rem; z-index: 10;
                    display: flex; justify-content: space-between; align-items: center; width: calc(100% - 2rem);
                    pointer-events: none;
                }
                .panel-header h3 { margin: 0; font-size: 1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                .live-tag { font-size: 0.7rem; color: var(--acc-danger); font-weight: 700; background: rgba(0,0,0,0.6); padding: 2px 8px; border-radius: 12px; }

                .thermal-panel { flex: 0 0 auto; padding-top: 2rem; }
                .thermal-panel .panel-header { position: static; width: 100%; margin-bottom: 1rem; pointer-events: auto; }

                .heatmap-grid {
                    display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;
                }
                .rack-unit {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
                    padding: 10px; height: 100px; display: flex; flex-direction: column; justify-content: space-between;
                    transition: all 0.5s;
                }
                .rack-unit.warn { background: rgba(249, 115, 22, 0.15); border-color: rgba(249, 115, 22, 0.4); }
                .rack-unit.crit { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); animation: pulse 2s infinite; }
                .rack-id { font-size: 0.7rem; color: var(--text-muted); }
                .rack-temp { font-size: 1.1rem; font-weight: 700; text-align: center; }
                .heat-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
                .bar-fill { background: var(--acc-primary); transition: height 0.3s; width: 100%; } 
                .rack-unit.warn .bar-fill { background: var(--acc-warning); }
                .rack-unit.crit .bar-fill { background: var(--acc-danger); }
            `}</style>
        </div>
    );
}
