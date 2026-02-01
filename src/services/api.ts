import { WeatherService, type TriggerResult } from './WeatherService';

// Tipos de datos para el dashboard
export interface ServerMetrics {
  cpu: number;
  ram: number;
  power: number;
  temp: number;
}

export interface ClimateData {
  temp: number;
  humidity: number;
  rainProb: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface Alert {
  id: number;
  title: string;
  time: string;
  level: 'critical' | 'warning' | 'info';
  desc: string;
}

export interface Recommendation {
  id: string;
  type: 'cooling' | 'power';
  title: string;
  desc: string;
  impact: 'high' | 'medium' | 'low';
  saving: string;
  applied: boolean;
}

export interface TariffData {
  currentPrice: number;
  period: 'peak' | 'standard' | 'off-peak';
  accumulatedCost: number;
}

export interface CoolingSystemState {
  chillerStatus: 'active' | 'standby' | 'fault';
  coolingLoad: number; // Percentage
  inletTemp: number;
  returnTemp: number;
  fanSpeed: number; // RPM
  valvePosition: number; // % Open
}

export interface RealSystemData {
  // Condensed structure for the detailed inventory
  chillers: { id: string; on: boolean; setPoint: number; leavingTemp: number; enteringTemp: number; flow: number }[];
  condenserPumps: { id: string; on: boolean; rpm: number }[];
  chilledPumps: { id: string; on: boolean; rpm: number }[];
  towers: { id: string; fans: number[]; valves: boolean[] }[]; // Simplified for list
  totalPower: number;
}

export interface DashboardData {
  serverMetrics: ServerMetrics;
  climate: ClimateData;
  alerts: Alert[];
  recommendations: Recommendation[];
  tariff: TariffData;
  coolingSystem: CoolingSystemState;
  realSystem: RealSystemData;
  locationName: string;
  forecast: { day: string; temp: number; icon: string }[];
}

export class MockApiService {
  private subscribers: ((data: DashboardData) => void)[] = [];
  private intervalId: number | null = null;
  private weatherService: WeatherService;

  // Estado inicial simulado
  private currentState: DashboardData = {
    serverMetrics: { cpu: 45, ram: 60, power: 1200, temp: 24 },
    climate: { temp: 22, humidity: 45, rainProb: 10, trend: 'stable' },
    alerts: [],
    recommendations: [],
    tariff: { currentPrice: 0.15, period: 'standard', accumulatedCost: 124.50 },
    coolingSystem: {
      chillerStatus: 'active',
      coolingLoad: 65,
      inletTemp: 18.5,
      returnTemp: 26.2,
      fanSpeed: 2400,
      valvePosition: 45
    },
    realSystem: {
      chillers: Array.from({ length: 6 }, (_, i) => ({
        id: `CHI0${i + 1}`,
        on: i < 3, // Start with 3 active
        setPoint: 7.0,
        leavingTemp: 7.2,
        enteringTemp: 12.5,
        flow: 120
      })),
      condenserPumps: Array.from({ length: 6 }, (_, i) => ({
        id: `CDWP0${i + 1}`,
        on: i < 3,
        rpm: i < 3 ? 1450 : 0
      })),
      chilledPumps: Array.from({ length: 6 }, (_, i) => ({
        id: `CHWP0${i + 1}`,
        on: i < 3,
        rpm: i < 3 ? 1450 : 0
      })),
      towers: Array.from({ length: 6 }, (_, i) => ({
        id: `CT0${i + 1}`,
        fans: [0, 0], // Normalized speed 0-1
        valves: [i < 3]
      })),
      totalPower: 0
    },
    locationName: 'CDMX - Centro',
    forecast: []
  };

  // Location State
  private currentLocation = {
    name: 'CDMX - Centro',
    lat: 19.4326,
    lon: -99.1332
  };

  constructor() {
    this.weatherService = WeatherService.getInstance();
  }

  // Iniciar simulación de datos (Polling + Real Weather Fetch)
  public startSimulation(intervalMs: number = 2000) {
    if (this.intervalId) return;

    // Fetch initial weather data
    this.updateFromRealWeather();

    // We schedule weather updates, but careful not to duplicate if called multiple times
    // (In this mock structure, assuming singleton usage mostly)

    this.intervalId = window.setInterval(() => {
      this.updateState();
      this.notifySubscribers();
    }, intervalMs);
  }

  public stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async setLocation(name: string, lat: number, lon: number) {
    this.currentLocation = { name, lat, lon };
    // Trigger update immediately
    await this.updateFromRealWeather();
    this.notifySubscribers();
  }

  public subscribe(callback: (data: DashboardData) => void): () => void {
    this.subscribers.push(callback);
    callback(this.currentState); // Emitir estado actual inmediatamente
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  public applyRecommendation(id: string) {
    const rec = this.currentState.recommendations.find(r => r.id === id);
    if (rec) {
      rec.applied = true;
      this.notifySubscribers();
    }
  }

  public dismissAlert(id: number) {
    this.currentState.alerts = this.currentState.alerts.filter(a => a.id !== id);
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.currentState));
  }

  private async updateFromRealWeather() {
    const forecast = await this.weatherService.fetchForecast(this.currentLocation.lat, this.currentLocation.lon);
    if (forecast && forecast.list.length > 0) {
      const current = forecast.list[0];
      const triggers = this.weatherService.evaluateTriggers(forecast.list);

      // Update Climate Data from Valid API
      this.currentState.climate = {
        temp: current.main.temp,
        humidity: current.main.humidity,
        rainProb: 0, // OpenWeather free api generic forecast sometimes lacks pop in standard list main, handling simply
        trend: 'stable' // Logic to determine trend could be added here
      };

      // Map triggers to recommendations and alerts
      this.mapTriggersToState(triggers);

      // Populate Forecast for UI
      const daily = this.weatherService.projectDaily(forecast.list);
      const days = Object.keys(daily).sort().slice(0, 3).map(date => {
        const temps = daily[date];
        const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
        return {
          day: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
          temp: Math.round(avg),
          icon: avg > 25 ? '☀️' : avg > 18 ? '⛅' : '🌧️'
        };
      });
      this.currentState.forecast = days;
    }
  }

  private mapTriggersToState(triggers: TriggerResult[]) {
    const newRecs: Recommendation[] = triggers.filter(t => t.type !== 'risk').map(t => ({
      id: t.id,
      type: t.type as 'cooling' | 'power',
      title: t.id === 'free-cooling' ? 'Free Cooling Disponible' : 'Pre-Enfriamiento Sugerido',
      desc: `${t.reason}. ${t.action}.`,
      impact: 'high',
      saving: t.saving || '10%',
      applied: false
    }));

    this.currentState.recommendations = newRecs;

    const riskTriggers = triggers.filter(t => t.type === 'risk');
    riskTriggers.forEach(t => {
      // Check if alert already exists to avoid spam
      if (!this.currentState.alerts.find(a => a.title === 'Riesgo Térmico')) {
        this.currentState.alerts.unshift({
          id: Date.now(),
          title: 'Riesgo Térmico',
          time: 'Ahora',
          level: 'warning',
          desc: `${t.reason}. ${t.action}`
        });
      }
    });
  }

  private updateState() {
    // 1. Variar Métricas de Servidor (Simulado)
    const cpuChange = (Math.random() - 0.5) * 5;
    this.currentState.serverMetrics.cpu = Math.max(10, Math.min(90, this.currentState.serverMetrics.cpu + cpuChange));

    // RAM sigue un poco al CPU con retardo
    this.currentState.serverMetrics.ram = Math.max(20, Math.min(95, this.currentState.serverMetrics.ram + cpuChange * 0.5));

    // Power depende de CPU
    this.currentState.serverMetrics.power = 800 + (this.currentState.serverMetrics.cpu * 15) + (Math.random() * 50);

    // Temp depende de Power
    this.currentState.serverMetrics.temp = 20 + (this.currentState.serverMetrics.power / 100) + (Math.random() - 0.5);


    // 2. Clima (Simulado, small noise around the real value if we fetched it, or just noise)
    // We keep the real fetched value mostly steady but add tiny noise for "live" feel
    this.currentState.climate.temp += (Math.random() - 0.5) * 0.1;

    // 3. Tarifa (Simulado acumulado)
    // Add small cost every tick
    this.currentState.tariff.accumulatedCost += 0.005;

    // Period logic usually time based, simplified here
    const hour = new Date().getHours();
    if (hour >= 18 && hour <= 22) this.currentState.tariff.period = 'peak';
    else if (hour >= 23 || hour <= 6) this.currentState.tariff.period = 'off-peak';
    else this.currentState.tariff.period = 'standard';

    this.currentState.tariff.currentPrice =
      this.currentState.tariff.period === 'peak' ? 0.35 :
        this.currentState.tariff.period === 'standard' ? 0.15 : 0.08;

    // 4. Cooling System Simulation
    const loadChange = (Math.random() - 0.5) * 2;
    this.currentState.coolingSystem.coolingLoad = Math.max(30, Math.min(98, this.currentState.coolingSystem.coolingLoad + loadChange));

    // Fan speed follows load
    const targetFan = 1500 + (this.currentState.coolingSystem.coolingLoad * 20);
    this.currentState.coolingSystem.fanSpeed += (targetFan - this.currentState.coolingSystem.fanSpeed) * 0.1;

    // Temperatures fluctuate slightly
    this.currentState.coolingSystem.inletTemp = 18 + (Math.random() * 0.5);
    this.currentState.coolingSystem.returnTemp = 24 + (this.currentState.coolingSystem.coolingLoad * 0.05) + (Math.random() * 0.5);

    // 5. Update Real System Details (Simulated Physics)
    const loadFactor = this.currentState.coolingSystem.coolingLoad / 100;

    this.currentState.realSystem.chillers.forEach(chi => {
      if (chi.on) {
        // Simulate realistic fluctuations
        chi.enteringTemp = 12 + (loadFactor * 2) + (Math.random() * 0.2);
        chi.leavingTemp = chi.setPoint + (Math.random() * 0.1); // Close to setpoint
        chi.flow = 110 + (loadFactor * 20) + (Math.random() * 2);
      } else {
        // Return to ambient if off
        chi.enteringTemp += (20 - chi.enteringTemp) * 0.05;
        chi.leavingTemp += (20 - chi.leavingTemp) * 0.05;
        chi.flow = 0;
      }
    });

    this.currentState.realSystem.condenserPumps.forEach(pump => {
      if (pump.on) {
        pump.rpm = 1400 + (loadFactor * 100) + (Math.random() * 10); // Var around 1400-1500
      } else {
        pump.rpm = 0;
      }
    });

    // Check synchronization (Simple logic: if Chiller 1 is on, ensure pump 1 is on for "correct" operation)
    // For now independent to allow user control
  }

  // --- Real System Control Methods ---
  public toggleChiller(id: string) {
    const chi = this.currentState.realSystem.chillers.find(c => c.id === id);
    if (chi) {
      chi.on = !chi.on;
      this.notifySubscribers();
    }
  }

  public setChillerSetPoint(id: string, temp: number) {
    const chi = this.currentState.realSystem.chillers.find(c => c.id === id);
    if (chi) {
      chi.setPoint = temp;
      this.notifySubscribers();
    }
  }

  public togglePump(type: 'condenserPumps' | 'chilledPumps', id: string) {
    const pump = this.currentState.realSystem[type].find(p => p.id === id);
    if (pump) {
      pump.on = !pump.on;
      this.notifySubscribers();
    }
  }
}

export const mockApi = new MockApiService();
