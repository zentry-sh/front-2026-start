import React from 'react';

export default function ReportCenter() {
    const reports = [
        { id: 101, name: 'Reporte Mensual de Eficiencia - Enero', size: '2.4 MB', date: '01/02/2026', type: 'PDF' },
        { id: 102, name: 'Auditoría de Incidencias Térmicas', size: '1.2 MB', date: '28/01/2026', type: 'CSV' },
        { id: 103, name: 'Análisis de Consumo Energético', size: '850 KB', date: '25/01/2026', type: 'PDF' },
        { id: 104, name: 'Logs de Mantenimiento Preventivo', size: '4.5 MB', date: '15/01/2026', type: 'XLSX' },
    ];

    const handleDownload = (name) => {
        alert(`Iniciando descarga de: ${name}...`);
    };

    return (
        <div className="reports-container">
            <div className="glass-panel full-height">
                <div className="reports-header">
                    <h2>Centro de Reportes</h2>
                    <div className="filter-group">
                        <button className="filter-btn active">Todos</button>
                        <button className="filter-btn">PDF</button>
                        <button className="filter-btn">CSV</button>
                    </div>
                </div>

                <div className="reports-grid">
                    {reports.map(report => (
                        <div key={report.id} className="report-card">
                            <div className={`file-icon ${report.type.toLowerCase()}`}>
                                {report.type}
                            </div>
                            <div className="report-info">
                                <h4>{report.name}</h4>
                                <div className="meta">
                                    <span>{report.date}</span>
                                    <span>•</span>
                                    <span>{report.size}</span>
                                </div>
                            </div>
                            <button className="download-btn" onClick={() => handleDownload(report.name)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="generation-section">
                    <h3>Generar Reporte Personalizado</h3>
                    <div className="gen-controls">
                        <select>
                            <option>Seleccionar Métricas...</option>
                            <option>Temperatura</option>
                            <option>Energía</option>
                        </select>
                        <select>
                            <option>Últimos 7 días</option>
                            <option>Último mes</option>
                        </select>
                        <button className="generate-btn">Generar</button>
                    </div>
                </div>
            </div>

            <style>{`
        .reports-container {
            height: 100%;
        }

        .glass-panel {
            background: var(--glass-surface);
            backdrop-filter: blur(var(--blur-amount));
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 2rem;
            display: flex;
            flex-direction: column;
        }
        
        .full-height { height: 100%; }

        .reports-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .reports-header h2 { margin: 0; }

        .filter-group {
            display: flex;
            gap: 0.5rem;
            background: rgba(0,0,0,0.2);
            padding: 4px;
            border-radius: 10px;
        }
        
        .filter-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .filter-btn.active {
            background: rgba(255,255,255,0.1);
            color: #fff;
        }
        
        .filter-btn:hover:not(.active) {
            color: var(--text-main);
        }

        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 1rem;
            margin-bottom: 3rem;
        }

        .report-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: transform 0.2s;
        }
        
        .report-card:hover {
            transform: translateY(-2px);
            background: rgba(255,255,255,0.06);
        }

        .file-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
        }
        .file-icon.pdf { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .file-icon.csv { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .file-icon.xlsx { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }

        .report-info { flex: 1; }
        .report-info h4 { margin: 0 0 0.25rem 0; font-size: 0.95rem; font-weight: 600; }
        
        .meta {
            font-size: 0.8rem;
            color: var(--text-muted);
            display: flex;
            gap: 0.5rem;
        }

        .download-btn {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.1);
            width: 36px;
            height: 36px;
            border-radius: 8px;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .download-btn:hover {
            background: var(--acc-primary);
            color: #fff;
            border-color: var(--acc-primary);
        }
        
        .generation-section {
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            margin-top: auto;
        }
        
        .gen-controls {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        select {
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            color: #fff;
            padding: 0.75rem;
            border-radius: 10px;
            flex: 1;
        }
        
        .generate-btn {
            background: var(--acc-secondary);
            color: white;
            border: none;
            padding: 0 2rem;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
        }
      `}</style>
        </div>
    );
}
