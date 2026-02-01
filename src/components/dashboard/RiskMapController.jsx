import { useState } from "react";
import EarthGlobe from "./EarthGlobe.jsx";
import "./RiskMap.css";

const LOCATIONS = [
    { id: "cdmx", name: "CDMX - Centro", lat: 19.4326, lon: -99.1332, label: "CDMX", risk: "med", riskLabel: "Medio" },
    { id: "gdl", name: "Guadalajara, Jal", lat: 20.6597, lon: -103.3496, label: "GDL", risk: "high", riskLabel: "Alto (Hídrico)" },
    { id: "oax", name: "Oaxaca, Oax", lat: 17.0732, lon: -96.7266, label: "OAX", risk: "critical", riskLabel: "Crítico (Sísmico)" },
];

export default function RiskMapController() {
    const [selectedId, setSelectedId] = useState("cdmx");

    const selectedLocation = LOCATIONS.find((l) => l.id === selectedId) || LOCATIONS[0];

    const markers = LOCATIONS.map((loc) => ({
        lat: loc.lat,
        lon: loc.lon,
        label: loc.label,
        highlight: loc.id === selectedId
    }));

    return (
        <div className="risk-map-container">
            <div className="risk-header">
                <h3>Estrés Hídrico Regional</h3>

                <div className="risk-controls">
                    <span className={`risk-badge ${selectedLocation.risk}`}>
                        {selectedLocation.riskLabel}
                    </span>

                    <select
                        className="region-select"
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                    >
                        {LOCATIONS.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="map-visual">
                <EarthGlobe
                    markers={markers}
                    focusOn={{ lat: selectedLocation.lat, lon: selectedLocation.lon }}
                />

                <div className="map-legend">
                    <div className="legend-item">
                        <span className="legend-dot high"></span> &gt;80% Estrés
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot med"></span> 40–80% Estrés
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot low"></span> &lt;40% Estrés
                    </div>
                </div>
            </div>
        </div>
    );
}
