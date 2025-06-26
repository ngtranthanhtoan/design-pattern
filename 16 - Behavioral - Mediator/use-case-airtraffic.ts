import { exit } from 'process';

// Mediator interface
interface Mediator {
  notify(sender: Colleague, event: string, data?: any): void;
}

// Colleague interface
interface Colleague {
  setMediator(mediator: Mediator): void;
  send(event: string, data?: any): void;
  receive(event: string, data?: any): void;
  getId(): string;
}

// Aircraft class
class Aircraft implements Colleague {
  private mediator: Mediator | null = null;
  private altitude: number;
  private speed: number;
  private heading: number;
  private isEmergency: boolean = false;

  constructor(
    private id: string,
    private callsign: string,
    private type: string,
    altitude: number = 30000,
    speed: number = 500,
    heading: number = 0
  ) {
    this.altitude = altitude;
    this.speed = speed;
    this.heading = heading;
  }

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`✈️  ${this.callsign}: Sending ${event}`, data ? `- ${JSON.stringify(data)}` : '');
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`✈️  ${this.callsign}: Received ${event}`, data ? `- ${JSON.stringify(data)}` : '');
    
    switch (event) {
      case 'weather_alert':
        this.handleWeatherAlert(data);
        break;
      case 'runway_assignment':
        this.handleRunwayAssignment(data);
        break;
      case 'traffic_alert':
        this.handleTrafficAlert(data);
        break;
      case 'emergency_broadcast':
        this.handleEmergencyBroadcast(data);
        break;
      case 'clearance_request':
        this.handleClearanceRequest(data);
        break;
    }
  }

  getId(): string {
    return this.id;
  }

  private handleWeatherAlert(data: any): void {
    console.log(`    ⚠️  ${this.callsign}: Adjusting course for weather conditions`);
    this.send('weather_response', { status: 'acknowledged', action: 'course_adjusted' });
  }

  private handleRunwayAssignment(data: any): void {
    console.log(`    🛬 ${this.callsign}: Assigned to runway ${data.runway}`);
    this.send('runway_confirmation', { runway: data.runway, eta: data.eta });
  }

  private handleTrafficAlert(data: any): void {
    console.log(`    🚨 ${this.callsign}: Traffic alert - adjusting altitude`);
    this.altitude += data.altitude_change || 1000;
    this.send('traffic_response', { new_altitude: this.altitude });
  }

  private handleEmergencyBroadcast(data: any): void {
    if (data.aircraft_id !== this.id) {
      console.log(`    🆘 ${this.callsign}: Emergency broadcast received - clearing area`);
      this.send('emergency_response', { status: 'area_cleared' });
    }
  }

  private handleClearanceRequest(data: any): void {
    console.log(`    ✅ ${this.callsign}: Clearance request processed`);
  }

  // Aircraft-specific methods
  requestLanding(): void {
    this.send('landing_request', {
      callsign: this.callsign,
      type: this.type,
      altitude: this.altitude,
      speed: this.speed
    });
  }

  reportEmergency(): void {
    this.isEmergency = true;
    this.send('emergency_declared', {
      callsign: this.callsign,
      type: this.type,
      altitude: this.altitude,
      speed: this.speed,
      heading: this.heading
    });
  }

  requestWeatherUpdate(): void {
    this.send('weather_request', { location: 'current_position' });
  }
}

// Weather System class
class WeatherSystem implements Colleague {
  private mediator: Mediator | null = null;
  private weatherConditions: Map<string, any> = new Map();

  constructor(private id: string) {
    this.initializeWeatherConditions();
  }

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`🌤️  Weather System: Sending ${event}`, data ? `- ${JSON.stringify(data)}` : '');
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`🌤️  Weather System: Received ${event}`, data ? `- ${JSON.stringify(data)}` : '');
    
    switch (event) {
      case 'weather_request':
        this.handleWeatherRequest(data);
        break;
      case 'weather_update':
        this.updateWeatherConditions(data);
        break;
    }
  }

  getId(): string {
    return this.id;
  }

  private handleWeatherRequest(data: any): void {
    const conditions = this.getCurrentConditions(data.location);
    this.send('weather_response', conditions);
  }

  private updateWeatherConditions(data: any): void {
    this.weatherConditions.set(data.location, data.conditions);
    this.send('weather_alert', {
      location: data.location,
      conditions: data.conditions,
      severity: data.severity
    });
  }

  private initializeWeatherConditions(): void {
    this.weatherConditions.set('north', { visibility: 'good', wind: 'light', turbulence: 'none' });
    this.weatherConditions.set('south', { visibility: 'poor', wind: 'strong', turbulence: 'moderate' });
    this.weatherConditions.set('east', { visibility: 'fair', wind: 'moderate', turbulence: 'light' });
    this.weatherConditions.set('west', { visibility: 'excellent', wind: 'calm', turbulence: 'none' });
  }

  private getCurrentConditions(location: string): any {
    return this.weatherConditions.get(location) || { visibility: 'unknown', wind: 'unknown', turbulence: 'unknown' };
  }

  // Weather system-specific methods
  updateWeatherData(location: string, conditions: any): void {
    this.send('weather_update', { location, conditions, severity: 'moderate' });
  }

  issueSevereWeatherAlert(location: string): void {
    this.send('weather_alert', {
      location,
      conditions: { visibility: 'poor', wind: 'severe', turbulence: 'severe' },
      severity: 'severe'
    });
  }
}

// Runway Management class
class RunwayManagement implements Colleague {
  private mediator: Mediator | null = null;
  private runways: Map<string, { status: 'available' | 'occupied' | 'maintenance', aircraft?: string }> = new Map();

  constructor(private id: string) {
    this.initializeRunways();
  }

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`🛬 Runway Management: Sending ${event}`, data ? `- ${JSON.stringify(data)}` : '');
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`🛬 Runway Management: Received ${event}`, data ? `- ${JSON.stringify(data)}` : '');
    
    switch (event) {
      case 'landing_request':
        this.handleLandingRequest(data);
        break;
      case 'runway_clearance':
        this.handleRunwayClearance(data);
        break;
    }
  }

  getId(): string {
    return this.id;
  }

  private handleLandingRequest(data: any): void {
    const availableRunway = this.findAvailableRunway();
    if (availableRunway) {
      this.assignRunway(availableRunway, data.callsign);
      this.send('runway_assignment', {
        callsign: data.callsign,
        runway: availableRunway,
        eta: this.calculateETA(data.altitude, data.speed)
      });
    } else {
      this.send('runway_unavailable', { callsign: data.callsign, reason: 'no_available_runways' });
    }
  }

  private handleRunwayClearance(data: any): void {
    this.clearRunway(data.runway);
    this.send('runway_cleared', { runway: data.runway });
  }

  private initializeRunways(): void {
    this.runways.set('09L', { status: 'available' });
    this.runways.set('09R', { status: 'available' });
    this.runways.set('27L', { status: 'maintenance' });
    this.runways.set('27R', { status: 'available' });
  }

  private findAvailableRunway(): string | null {
    for (const [runway, info] of this.runways) {
      if (info.status === 'available') {
        return runway;
      }
    }
    return null;
  }

  private assignRunway(runway: string, aircraft: string): void {
    this.runways.set(runway, { status: 'occupied', aircraft });
  }

  private clearRunway(runway: string): void {
    this.runways.set(runway, { status: 'available' });
  }

  private calculateETA(altitude: number, speed: number): number {
    // Simple ETA calculation (minutes)
    return Math.ceil(altitude / 1000) + Math.ceil(speed / 100);
  }

  // Runway management-specific methods
  reportRunwayMaintenance(runway: string): void {
    this.runways.set(runway, { status: 'maintenance' });
    this.send('runway_maintenance', { runway, status: 'maintenance' });
  }

  clearRunwayForEmergency(runway: string): void {
    this.clearRunway(runway);
    this.send('emergency_runway_cleared', { runway });
  }
}

// Air Traffic Control Mediator
class AirTrafficControlMediator implements Mediator {
  private aircraft: Map<string, Aircraft> = new Map();
  private weatherSystem: WeatherSystem | null = null;
  private runwayManagement: RunwayManagement | null = null;
  private emergencyQueue: string[] = [];

  addAircraft(aircraft: Aircraft): void {
    this.aircraft.set(aircraft.getId(), aircraft);
    aircraft.setMediator(this);
    console.log(`🛫 ATC: Aircraft ${aircraft.getId()} registered`);
  }

  setWeatherSystem(weatherSystem: WeatherSystem): void {
    this.weatherSystem = weatherSystem;
    weatherSystem.setMediator(this);
    console.log(`🌤️  ATC: Weather system registered`);
  }

  setRunwayManagement(runwayManagement: RunwayManagement): void {
    this.runwayManagement = runwayManagement;
    runwayManagement.setMediator(this);
    console.log(`🛬 ATC: Runway management registered`);
  }

  notify(sender: Colleague, event: string, data?: any): void {
    console.log(`🎯 ATC: Routing ${event} from ${sender.getId()}`);
    
    switch (event) {
      case 'landing_request':
        this.handleLandingRequest(sender as Aircraft, data);
        break;
      case 'emergency_declared':
        this.handleEmergency(sender as Aircraft, data);
        break;
      case 'weather_request':
        this.handleWeatherRequest(sender as Aircraft, data);
        break;
      case 'weather_alert':
        this.handleWeatherAlert(data);
        break;
      case 'runway_maintenance':
        this.handleRunwayMaintenance(data);
        break;
      case 'traffic_conflict':
        this.handleTrafficConflict(data);
        break;
    }
  }

  private handleLandingRequest(aircraft: Aircraft, data: any): void {
    if (this.runwayManagement) {
      this.runwayManagement.send('landing_request', data);
    }
  }

  private handleEmergency(aircraft: Aircraft, data: any): void {
    console.log(`🚨 ATC: Emergency declared by ${data.callsign} - Priority handling`);
    this.emergencyQueue.unshift(aircraft.getId());
    
    // Notify all aircraft of emergency
    this.aircraft.forEach(ac => {
      if (ac.getId() !== aircraft.getId()) {
        ac.send('emergency_broadcast', data);
      }
    });

    // Clear runways for emergency landing
    if (this.runwayManagement) {
      this.runwayManagement.send('emergency_runway_clearance', { priority: 'emergency' });
    }
  }

  private handleWeatherRequest(aircraft: Aircraft, data: any): void {
    if (this.weatherSystem) {
      this.weatherSystem.send('weather_request', data);
    }
  }

  private handleWeatherAlert(data: any): void {
    // Notify all aircraft in affected area
    this.aircraft.forEach(aircraft => {
      aircraft.send('weather_alert', data);
    });
  }

  private handleRunwayMaintenance(data: any): void {
    console.log(`🔧 ATC: Runway ${data.runway} under maintenance`);
  }

  private handleTrafficConflict(data: any): void {
    console.log(`⚠️  ATC: Traffic conflict detected between ${data.aircraft1} and ${data.aircraft2}`);
    // Implement conflict resolution logic
  }

  // ATC-specific methods
  detectTrafficConflict(aircraft1: string, aircraft2: string): void {
    console.log(`⚠️  ATC: Traffic conflict detected between ${aircraft1} and ${aircraft2}`);
    // Implement conflict resolution logic
  }

  getSystemStatus(): any {
    return {
      aircraft_count: this.aircraft.size,
      emergency_queue_length: this.emergencyQueue.length,
      weather_system_active: !!this.weatherSystem,
      runway_management_active: !!this.runwayManagement
    };
  }
}

// Demo
console.log('=== AIR TRAFFIC CONTROL MEDIATOR DEMO ===\n');

// Create mediator
const atc = new AirTrafficControlMediator();

// Create components
const weatherSystem = new WeatherSystem('weather-001');
const runwayManagement = new RunwayManagement('runway-001');

const aircraft1 = new Aircraft('ac-001', 'UAL123', 'Boeing 737', 35000, 450, 90);
const aircraft2 = new Aircraft('ac-002', 'AAL456', 'Airbus A320', 32000, 480, 180);
const aircraft3 = new Aircraft('ac-003', 'DAL789', 'Boeing 777', 38000, 520, 270);

// Register components with mediator
atc.setWeatherSystem(weatherSystem);
atc.setRunwayManagement(runwayManagement);
atc.addAircraft(aircraft1);
atc.addAircraft(aircraft2);
atc.addAircraft(aircraft3);

console.log('\n--- Normal Operations ---');
// Aircraft requests landing
aircraft1.requestLanding();

// Aircraft requests weather update
aircraft2.requestWeatherUpdate();

// Weather system issues alert
weatherSystem.issueSevereWeatherAlert('south');

console.log('\n--- Emergency Situation ---');
// Aircraft declares emergency
aircraft3.reportEmergency();

// Runway management reports maintenance
runwayManagement.reportRunwayMaintenance('09L');

console.log('\n--- System Status ---');
const status = atc.getSystemStatus();
console.log('System Status:', status);

console.log('\n✅ Air traffic control mediation completed successfully');

exit(0); 