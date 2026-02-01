
export class MockApiService {
  constructor() {
    this.listeners = new Set();
    this.interval = null;
    this.data = this.generateInitialData();
  }

  generateInitialData() {
    return {
      serverMetrics: {
        cpu: 45,
        ram: 62,
        power: 1200, // Watts
        temp: 24, // Celsius
      },
      climate: {
        temp: 28,
        humidity: 65,
        rainProb: 30,
        trend: 'rising' // rising, falling, stable
      },
      tariff: {
        currentPrice: 0.14, // $ per kWh
        period: 'standard', // peak, off-peak, standard
        accumulatedCost: 145.20
      },
      alerts: [
        {
          id: 1,
          level: "critical",
          title: "Nivel Crítico en Tanque Auxiliar",
          time: "2 min ago",
          desc: "Reserva al 15%. Iniciar protocolo de contingencia.",
        },
        {
          id: 2,
          level: "warning",
          title: "Eficiencia de Enfriamiento Baja",
          time: "24 min ago",
          desc: "Torre B operando fuera de rango óptimo.",
        }
      ],
      recommendations: [
        {
          id: 1,
          type: 'cooling',
          title: 'Optimización de Enfriamiento',
          impact: 'medium',
          saving: '5000L',
          desc: 'Reducir flujo en Torre A en 15%. Condiciones ambientales favorables.',
          applied: false
        },
        {
          id: 2,
          type: 'power',
          title: 'Cambio a Modo Eco',
          impact: 'high',
          saving: '$45/dia',
          desc: 'Sistemas auxiliares pueden reducir potencia por baja demanda.',
          applied: false
        }
      ]
    };
  }

  startSimulation() {
    if (this.interval) return;
    
    this.interval = setInterval(() => {
      this.updateData();
      this.notifyListeners();
    }, 2000); // Update every 2 seconds
  }

  stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  updateData() {
    // Simulate server fluctuations
    this.data.serverMetrics = {
      cpu: this.fluctuate(this.data.serverMetrics.cpu, 2, 10, 95),
      ram: this.fluctuate(this.data.serverMetrics.ram, 1, 20, 90),
      power: this.fluctuate(this.data.serverMetrics.power, 50, 800, 2000),
      temp: this.fluctuate(this.data.serverMetrics.temp, 0.5, 18, 35)
    };

    // Simulate climate slow changes
    if (Math.random() > 0.8) {
      this.data.climate.temp = this.fluctuate(this.data.climate.temp, 0.2, 15, 40);
      this.data.climate.humidity = this.fluctuate(this.data.climate.humidity, 1, 30, 90);
    }
  }

  fluctuate(current, delta, min, max) {
    let change = (Math.random() * delta * 2) - delta;
    let newValue = current + change;
    return Math.max(min, Math.min(max, parseFloat(newValue.toFixed(1))));
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.data); // Immediate update
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.data));
  }
}

export const mockApi = new MockApiService();
