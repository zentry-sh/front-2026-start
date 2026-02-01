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
    this.loadState();
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
    this.saveState();
    this.subscribers.forEach(cb => cb(this.currentState));
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hydroops_state', JSON.stringify(this.currentState));
      } catch (e) {
        // Ignore quota limits
      }
    }
  }

  private loadState() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hydroops_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.currentState = { ...this.currentState, ...parsed };
        } catch (e) {
          console.error("Failed to load state", e);
        }
      }
    }
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
    // 1. SIMULATE TIME (Accelerated for demo: 1 real sec = 1 sim min could be cool, but let's stick to real time or just noise)
    // Actually, for "realism" in a demo, we usually want it to look alive.
    // Let's make Server CPU correlate with specific "Business Hours" if we wanted, 
    // but random walk is fine as long as other metrics follow it.

    // --- SERVER PHYSICS ---
    // Random walk for CPU
    const cpuChange = (Math.random() - 0.5) * 8;
    let newCpu = this.currentState.serverMetrics.cpu + cpuChange;
    // Bound CPU
    newCpu = Math.max(10, Math.min(98, newCpu));
    this.currentState.serverMetrics.cpu = newCpu;

    // RAM lags CPU (Smooth follow)
    const targetRam = 30 + (newCpu * 0.6);
    this.currentState.serverMetrics.ram += (targetRam - this.currentState.serverMetrics.ram) * 0.1;

    // Power is DIRECTLY related to CPU + a baseline
    // P = P_idle + (P_max - P_idle) * (Utilization)
    // Idle 500W, Max 1500W per rack (avg)
    this.currentState.serverMetrics.power = 800 + (newCpu * 20) + (Math.random() * 20);

    // Temp lags Power (Thermal mass)
    // Target Temp = Ambient + (Power * EfficiencyFactor) - CoolingEffect
    // Simplified: T_target = 18 + (Power/100)
    const targetTemp = 18 + (this.currentState.serverMetrics.power / 150);
    this.currentState.serverMetrics.temp += (targetTemp - this.currentState.serverMetrics.temp) * 0.05;


    // --- CLIMATE (Real + Noise) ---
    this.currentState.climate.temp += (Math.random() - 0.5) * 0.05;


    // --- TARIFF SCHEDULE (Industrial GDMTH-like) ---
    // Base: 00:00 - 06:00
    // Intermedia: 06:00 - 18:00 && 22:00 - 24:00
    // Punta (Peak): 18:00 - 22:00
    const now = new Date();
    const hour = now.getHours();
    let period: 'peak' | 'standard' | 'off-peak' = 'off-peak';
    let price = 1.2; // Base price MXN

    if (hour >= 18 && hour < 22) {
      period = 'peak';
      price = 2.85; // Expensive
    } else if ((hour >= 6 && hour < 18) || (hour >= 22)) {
      period = 'standard';
      price = 1.65;
    } else {
      period = 'off-peak';
      price = 0.95;
    }

    this.currentState.tariff.period = period;
    this.currentState.tariff.currentPrice = price;

    // Smooth accumulation based on Real Power
    // Energy (kWh) = Power (kW) * Time (h). 
    // We update every ~2s. 2s = 0.00055 hours. 
    // Real Power ~2000kW (TOTAL system).
    // Let's use the Real System Global Power for cost

    // --- COOLING PHYSICS ---
    // Cooling Load depends on: Server Load (Heat) + Outdoor Temp (DeltaT)
    const outdoorImpact = Math.max(0, this.currentState.climate.temp - 15) * 1.5;
    const serverHeatImpact = this.currentState.serverMetrics.power / 40; // Scaling factor

    let targetCoolingLoad = 20 + outdoorImpact + serverHeatImpact;
    // Bound
    targetCoolingLoad = Math.max(10, Math.min(100, targetCoolingLoad));

    // Smooth transition
    this.currentState.coolingSystem.coolingLoad += (targetCoolingLoad - this.currentState.coolingSystem.coolingLoad) * 0.1;

    const loadFactor = this.currentState.coolingSystem.coolingLoad / 100;

    // --- REAL ASSET SIMULATION ---
    const activeChillers = this.currentState.realSystem.chillers.filter(c => c.on);
    const activeChillerCount = activeChillers.length || 1; // avoid /0

    // Distribute load among active chillers
    // If load is 80% and 3 chillers are on, each takes substantial load.
    // If load is 80% and 1 chiller is on, it overloads (simulated by high temps)

    // Capacity per chiller (arbitrary units, say 1 chiller handles 25% global load comfortably)
    const loadPerChiller = this.currentState.coolingSystem.coolingLoad / (activeChillerCount * 25);

    let totalCoolingPower = 0;

    this.currentState.realSystem.chillers.forEach(chi => {
      if (chi.on) {
        // Power consumption (kW) non-linear with load
        // P = Base + (Load^2)
        const chillerLoad = Math.min(1.2, loadPerChiller); // Cap at 120%
        const powerDraw = 50 + (chillerLoad * 180) + (Math.random() * 5);
        totalCoolingPower += powerDraw;

        // Physics: Leaving Water Temp (LWT)
        // If overloaded (load > 1), LWT rises above Setpoint
        const overloadFactor = Math.max(0, chillerLoad - 1);
        chi.leavingTemp = chi.setPoint + (overloadFactor * 5) + (Math.random() * 0.2);

        // Physics: Entering Water Temp (EWT)
        // EWT = LWT + DeltaT (where DeltaT proportional to Heat Load)
        const deltaT = 4 + (chillerLoad * 3);
        chi.enteringTemp = chi.leavingTemp + deltaT;

        chi.flow = 80 + (chillerLoad * 50) + (Math.random() * 2);
      } else {
        chi.flow = 0;
        chi.enteringTemp += (20 - chi.enteringTemp) * 0.05;
        chi.leavingTemp += (20 - chi.leavingTemp) * 0.05;
      }
    });

    // Pumps Power
    this.currentState.realSystem.condenserPumps.forEach(p => {
      if (p.on) totalCoolingPower += 22; // kW approx
    });

    // Total Facility Power = Servers + Cooling
    const totalFacilityPower = (this.currentState.serverMetrics.power * 50) + totalCoolingPower; // 50x scaling for "Data Center Size" vs "Single Rack" metrics
    // Cost Accumulation
    const kWh = (totalFacilityPower / 1000) * (2 / 3600); // 2 sec duration
    this.currentState.tariff.accumulatedCost += kWh * price;


    // --- ALERTS LOGIC (CORRELATION ENGINE) ---

    // 1. High Cost Efficiency Alert
    // If in PEAK time AND Cooling Load is High (>80%)
    if (period === 'peak' && this.currentState.coolingSystem.coolingLoad > 80) {
      this.triggerAlert('al-cost', 'Ineficiencia de Costo', 'warning',
        `Operando a alta carga (${Math.round(this.currentState.coolingSystem.coolingLoad)}%) durante horario Punta. Se sugiere activar descarga térmica.`);
    }

    // 2. Capacity Risk
    // If Load per chiller > 100% (Implied by High LWT check or direct calc)
    if (activeChillerCount > 0 && (this.currentState.coolingSystem.coolingLoad / (activeChillerCount * 25)) > 1.1) {
      this.triggerAlert('al-cap', 'Sobrecarga de Chillers', 'critical',
        `Capacidad excedida. Chillers activos (${activeChillerCount}) insuficientes para la demanda actual.`);
    } else {
      // Auto-resolve if condition clears? 
      // For simplicity in this mock, we assume user dismisses or we implement auto-clear logic separate.
      // Let's implement auto-clear only for "Live" states if we wanted, but let's stick to adding.
    }
  }

  private triggerAlert(uid: string, title: string, level: 'critical' | 'warning' | 'info', desc: string) {
    // Prevent flood: Check if alert with same UID exists or same title recently
    const exists = this.currentState.alerts.some(a => a.title === title);
    if (!exists) {
      this.currentState.alerts.unshift({
        id: Date.now(),
        title,
        time: 'Ahora',
        level,
        desc
      });
      // Keep list size manageable
      if (this.currentState.alerts.length > 20) this.currentState.alerts.pop();
    }
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
