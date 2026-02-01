import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/api';

export default function RiskDashboard() {
    const [alerts, setAlerts] = useState([]);
    const [incidents, setIncidents] = useState([
        { id: 1, type: 'Thermal', loc: 'Rack A-12', status: 'Resolved', time: '10:00 AM' },
        { id: 2, type: 'Power', loc: 'UPS-B', status: 'Monitoring', time: '11:30 AM' },
        { id: 3, type: 'Security', loc: 'Door 4', status: 'Closed', time: 'Yesterday' },
    ]);

    useEffect(() => {
        mockApi.startSimulation();
        const unsubscribe = mockApi.subscribe((newData) => {
            setAlerts(newData.alerts);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="risk-dashboard">
            {/* Left Column: Metrics & Incidents */}
            <div className="risk-panels">
                <div className="risk-metric-card critical">
                    <h3>Riesgo Global</h3>
                    <div className="metric-value">Bajo</div>
                    <div className="metric-trend">Stable</div>
                </div>

                <div className="incident-log glass-panel">
                    <h3>Registro de Incidentes</h3>
                    <div className="table-header">
                        <span>Tipo</span>
                        <span>Ubicación</span>
                        <span>Estado</span>
                        <span>Hora</span>
                    </div>
                    <div className="table-body">
                        {incidents.map(inc => (
                            <div key={inc.id} className="table-row">
                                <span className={`type-tag ${inc.type.toLowerCase()}`}>{inc.type}</span>
                                <span>{inc.loc}</span>
                                <span className={`status-tag ${inc.status.toLowerCase()}`}>{inc.status}</span>
                                <span className="time">{inc.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: 3D Visualization Placeholder (or move Globe here) */}
            <div className="risk-visual glass-panel">
                <h3>Mapa de Calor en Tiempo Real</h3>
                <div className="heatmap-mock">
                    <div className="server-rack warm"></div>
                    <div className="server-rack"></div>
                    <div className="server-rack"></div>
                    <div className="server-rack hot"></div>
                    <div className="server-rack"></div>
                    <div className="server-rack"></div>
                    <div className="server-rack"></div>
                    <div className="server-rack warm"></div>
                </div>
                <p className="caption">Visualización de Pasillo Caliente/Frío - Sala 1</p>
            </div>

            <style>{`
        .risk-dashboard {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            height: 100%;
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

        .risk-panels {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .risk-metric-card {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
        }

        .risk-metric-card h3 {
            margin: 0;
            font-size: 1rem;
            color: var(--acc-success);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .metric-value {
            font-size: 3rem;
            font-weight: 700;
            color: #fff;
            margin: 0.5rem 0;
            text-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        .metric-trend {
            color: rgba(255,255,255,0.6);
            font-size: 0.9rem;
        }

        .incident-log h3 {
            margin-top: 0;
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .table-header {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            font-size: 0.85rem;
            color: var(--text-muted);
            padding-bottom: 0.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 0.5rem;
        }

        .table-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            align-items: center;
            padding: 0.75rem 0;
            font-size: 0.9rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .table-row:last-child { border-bottom: none; }

        .type-tag {
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
            width: fit-content;
        }
        .type-tag.thermal { background: rgba(249, 115, 22, 0.2); color: #fb923c; }
        .type-tag.power { background: rgba(234, 179, 8, 0.2); color: #facc15; }
        .type-tag.security { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }

        .status-tag {
            font-size: 0.75rem;
            font-weight: 600;
        }
        .status-tag.resolved { color: var(--acc-success); }
        .status-tag.monitoring { color: var(--acc-warning); }
        .status-tag.closed { color: var(--text-muted); }
        
        .time { color: var(--text-muted); font-size: 0.85rem; }

        .risk-visual {
            justify-content: center;
            align-items: center;
            position: relative;
        }
        
        .heatmap-mock {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 2rem 0;
            width: 80%;
        }
        
        .server-rack {
            height: 120px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
        }
        
        .server-rack.hot {
            background: linear-gradient(to top, rgba(239, 68, 68, 0.4), rgba(255,255,255,0.05));
            border-color: rgba(239, 68, 68, 0.5);
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
            animation: pulse-red 2s infinite;
        }
        
        .server-rack.warm {
            background: linear-gradient(to top, rgba(249, 115, 22, 0.2), rgba(255,255,255,0.05));
        }
        
        @keyframes pulse-red {
            0% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
            50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.5); }
            100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
        }
        
        .caption {
            font-size: 0.9rem;
            color: var(--text-muted);
            margin-top: 1rem;
        }

      `}</style>
        </div>
    );
}
