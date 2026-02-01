export interface ForecastItem {
    dt: number;
    main: {
        temp: number;
        humidity: number;
        temp_min: number;
        temp_max: number;
    };
    dt_txt: string;
}

export interface ForecastResponse {
    list: ForecastItem[];
}

export interface TriggerResult {
    id: string;
    active: boolean;
    reason: string;
    evidence: number; // e.g., temperature difference
    action: string;
    validityWindow: string; // e.g., "Mainly at night"
    type: 'cooling' | 'power' | 'risk';
    saving?: string;
}

const API_KEY = "00f39d66189d09086de1ae243fc9d037";
const LAT = 20.5888;
const LON = -100.3899;

export class WeatherService {
    private static instance: WeatherService;
    private forecastCache: ForecastResponse | null = null;
    private lastFetch: number = 0;

    private constructor() { }

    public static getInstance(): WeatherService {
        if (!WeatherService.instance) {
            WeatherService.instance = new WeatherService();
        }
        return WeatherService.instance;
    }

    // 1. Fetch Forecast from OpenWeather
    async fetchForecast(lat: number = LAT, lon: number = LON): Promise<ForecastResponse | null> {
        // Simple cache key based on location (very basic)
        const cacheKey = `${lat},${lon}`;
        // Note: For a robust app, use a Map<string, ForecastResponse> for cache. 
        // For now, we just invalidate if location changes or time expires.

        // This simple cache check logic needs to be a bit smarter if we switch locations often
        // But for this demo, we'll just fetch fresh if called.

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            );
            if (!response.ok) throw new Error("Weather API fetch failed");

            const data: ForecastResponse = await response.json();
            this.forecastCache = data;
            this.lastFetch = Date.now();
            return data;
        } catch (error) {
            console.error("Failed to fetch weather:", error);
            return null;
        }
    }

    // 2. Project Daily Data (Aggregation)
    projectDaily(list: ForecastItem[]): Record<string, number[]> {
        const days: Record<string, number[]> = {};

        list.forEach(item => {
            // dt is in seconds, convert to ms
            const date = new Date(item.dt * 1000).toISOString().split('T')[0];
            if (!days[date]) {
                days[date] = [];
            }
            days[date].push(item.main.temp);
        });

        return days;
    }

    // 3. Evaluate Triggers
    evaluateTriggers(forecast: ForecastItem[], indoorTemp: number = 24): TriggerResult[] {
        const triggers: TriggerResult[] = [];

        // Trigger 1: Free Cooling
        // Logic: If outdoor temp is significantly lower than indoor temp (e.g. >= 2 degree diff)
        const freeCoolingOpportunities = forecast.filter(f => (indoorTemp - f.main.temp) >= 3);

        if (freeCoolingOpportunities.length > 0) {
            // Find the best window (lowest temp)
            const best = freeCoolingOpportunities.reduce((prev, curr) =>
                prev.main.temp < curr.main.temp ? prev : curr
            );

            triggers.push({
                id: 'free-cooling',
                active: true,
                reason: `Aire exterior fresco detectado (${best.main.temp}°C)`,
                evidence: indoorTemp - best.main.temp,
                action: "Activar inyección aire exterior",
                validityWindow: "Próximas 24h",
                type: 'cooling',
                saving: '45%'
            });
        }

        // Trigger 2: Pre-Cooling (Night)
        // Logic: Detect hot next day (> 28°C) but cool night tonight (< 18°C)
        // Simplified check: Check next 24h
        const next24h = forecast.slice(0, 8); // 3h * 8 = 24h
        const maxTemp = Math.max(...next24h.map(f => f.main.temp));
        const minTemp = Math.min(...next24h.map(f => f.main.temp));

        if (maxTemp > 26 && minTemp < 18) {
            triggers.push({
                id: 'precooling',
                active: true,
                reason: `Pico térmico previsto (${maxTemp}°C) con noche fresca`,
                evidence: maxTemp,
                action: "Subenfriar masa térmica nocturna",
                validityWindow: "Noche actual",
                type: 'power',
                saving: '30%'
            });
        }

        // Trigger 3: Thermal Risk Trend
        // Logic: Check if average temperature of next 3 days is strictly increasing
        const projection = this.projectDaily(forecast);
        const dates = Object.keys(projection).sort().slice(0, 3);

        if (dates.length >= 3) {
            const avgs = dates.map(d => {
                const temps = projection[d];
                return temps.reduce((a, b) => a + b, 0) / temps.length;
            });

            if (avgs[1] > avgs[0] + 1 && avgs[2] > avgs[1] + 1) {
                triggers.push({
                    id: 'thermal-risk',
                    active: true,
                    reason: "Tendencia de calentamiento sostenido (+3 días)",
                    evidence: avgs[2] - avgs[0],
                    action: "Preparar enfriadores de respaldo",
                    validityWindow: "Próximos 3 días",
                    type: 'risk'
                });
            }
        }

        return triggers;
    }
}
