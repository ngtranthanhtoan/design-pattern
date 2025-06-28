import { exit } from 'process';

// ===============================
// 1. Interfaces and Types
// ===============================

interface TrafficLightState {
  enter(): void;
  exit(): void;
  update(): void;
  handleEmergency(): void;
  handlePedestrianRequest(): void;
}

interface TrafficLightData {
  id: string;
  location: string;
  currentState: string;
  timer: number;
  emergencyMode: boolean;
  pedestrianWaiting: boolean;
  vehicleCount: number;
}

// ===============================
// 2. State Classes
// ===============================

class TrafficLight {
  private state: TrafficLightState;
  private data: TrafficLightData;
  private stateTimer: number = 0;
  private emergencyTimer: number = 0;
  private pedestrianTimer: number = 0;

  constructor(id: string, location: string) {
    this.data = {
      id,
      location,
      currentState: 'Red',
      timer: 0,
      emergencyMode: false,
      pedestrianWaiting: false,
      vehicleCount: 0
    };
    this.state = new RedState(this);
  }

  setState(state: TrafficLightState) {
    this.state.exit();
    this.state = state;
    this.state.enter();
    this.stateTimer = 0;
  }

  getData(): TrafficLightData {
    return { ...this.data };
  }

  updateData(updates: Partial<TrafficLightData>) {
    this.data = { ...this.data, ...updates };
  }

  getStateTimer(): number {
    return this.stateTimer;
  }

  incrementTimer() {
    this.stateTimer++;
  }

  resetTimer() {
    this.stateTimer = 0;
  }

  setEmergencyMode(emergency: boolean) {
    this.data.emergencyMode = emergency;
    if (emergency) {
      this.emergencyTimer = 0;
    }
  }

  isEmergencyMode(): boolean {
    return this.data.emergencyMode;
  }

  getEmergencyTimer(): number {
    return this.emergencyTimer;
  }

  incrementEmergencyTimer() {
    this.emergencyTimer++;
  }

  setPedestrianWaiting(waiting: boolean) {
    this.data.pedestrianWaiting = waiting;
    if (waiting) {
      this.pedestrianTimer = 0;
    }
  }

  isPedestrianWaiting(): boolean {
    return this.data.pedestrianWaiting;
  }

  getPedestrianTimer(): number {
    return this.pedestrianTimer;
  }

  incrementPedestrianTimer() {
    this.pedestrianTimer++;
  }

  addVehicle() {
    this.data.vehicleCount++;
  }

  removeVehicle() {
    this.data.vehicleCount = Math.max(0, this.data.vehicleCount - 1);
  }

  getVehicleCount(): number {
    return this.data.vehicleCount;
  }

  // State API
  enter() { this.state.enter(); }
  exit() { this.state.exit(); }
  update() { this.state.update(); }
  handleEmergency() { this.state.handleEmergency(); }
  handlePedestrianRequest() { this.state.handlePedestrianRequest(); }

  // For demonstration
  printStatus() {
    const data = this.getData();
    console.log(`\n[${data.id}] ${data.location} - State: ${data.currentState}`);
    console.log(`Timer: ${this.stateTimer}s, Emergency: ${data.emergencyMode}, Pedestrian: ${data.pedestrianWaiting}`);
    console.log(`Vehicles: ${data.vehicleCount}, Emergency Timer: ${this.emergencyTimer}s, Pedestrian Timer: ${this.pedestrianTimer}s`);
  }
}

// -------------------------------
// Red State
// -------------------------------
class RedState implements TrafficLightState {
  private readonly RED_DURATION = 30; // 30 seconds
  private readonly EMERGENCY_RED_DURATION = 10; // 10 seconds in emergency mode
  
  constructor(private trafficLight: TrafficLight) {}

  enter(): void {
    this.trafficLight.updateData({ currentState: 'Red' });
    this.trafficLight.resetTimer();
    console.log('🔴 Red light activated. Stop all vehicles.');
  }

  exit(): void {
    console.log('🔴 Red light deactivated.');
  }

  update(): void {
    this.trafficLight.incrementTimer();
    
    // Check for emergency mode
    if (this.trafficLight.isEmergencyMode()) {
      this.trafficLight.incrementEmergencyTimer();
      
      // Emergency vehicles get priority
      if (this.trafficLight.getEmergencyTimer() >= this.EMERGENCY_RED_DURATION) {
        console.log('🚨 Emergency vehicle detected. Switching to emergency mode.');
        this.trafficLight.setState(new EmergencyState(this.trafficLight));
        return;
      }
    }
    
    // Check for pedestrian request
    if (this.trafficLight.isPedestrianWaiting()) {
      this.trafficLight.incrementPedestrianTimer();
      
      // Give pedestrians priority after 15 seconds of waiting
      if (this.trafficLight.getPedestrianTimer() >= 15) {
        console.log('🚶 Pedestrian waiting too long. Switching to pedestrian mode.');
        this.trafficLight.setState(new PedestrianState(this.trafficLight));
        return;
      }
    }
    
    // Normal red light duration
    if (this.trafficLight.getStateTimer() >= this.RED_DURATION) {
      console.log('🟡 Red light duration complete. Switching to yellow.');
      this.trafficLight.setState(new YellowState(this.trafficLight));
    }
  }

  handleEmergency(): void {
    console.log('🚨 Emergency signal received. Activating emergency mode.');
    this.trafficLight.setEmergencyMode(true);
  }

  handlePedestrianRequest(): void {
    console.log('🚶 Pedestrian request received. Will be processed after current cycle.');
    this.trafficLight.setPedestrianWaiting(true);
  }
}

// -------------------------------
// Yellow State
// -------------------------------
class YellowState implements TrafficLightState {
  private readonly YELLOW_DURATION = 5; // 5 seconds
  
  constructor(private trafficLight: TrafficLight) {}

  enter(): void {
    this.trafficLight.updateData({ currentState: 'Yellow' });
    this.trafficLight.resetTimer();
    console.log('🟡 Yellow light activated. Prepare to stop.');
  }

  exit(): void {
    console.log('🟡 Yellow light deactivated.');
  }

  update(): void {
    this.trafficLight.incrementTimer();
    
    // Yellow light is shorter, no emergency or pedestrian handling
    if (this.trafficLight.getStateTimer() >= this.YELLOW_DURATION) {
      console.log('🟢 Yellow light duration complete. Switching to green.');
      this.trafficLight.setState(new GreenState(this.trafficLight));
    }
  }

  handleEmergency(): void {
    console.log('🚨 Emergency signal received. Will be processed after yellow cycle.');
  }

  handlePedestrianRequest(): void {
    console.log('🚶 Pedestrian request received. Will be processed after yellow cycle.');
  }
}

// -------------------------------
// Green State
// -------------------------------
class GreenState implements TrafficLightState {
  private readonly MIN_GREEN_DURATION = 20; // Minimum 20 seconds
  private readonly MAX_GREEN_DURATION = 60; // Maximum 60 seconds
  private readonly VEHICLE_THRESHOLD = 5; // Switch to red if more than 5 vehicles waiting
  
  constructor(private trafficLight: TrafficLight) {}

  enter(): void {
    this.trafficLight.updateData({ currentState: 'Green' });
    this.trafficLight.resetTimer();
    console.log('🟢 Green light activated. Proceed with caution.');
  }

  exit(): void {
    console.log('🟢 Green light deactivated.');
  }

  update(): void {
    this.trafficLight.incrementTimer();
    
    // Check for emergency mode
    if (this.trafficLight.isEmergencyMode()) {
      this.trafficLight.incrementEmergencyTimer();
      
      // Emergency vehicles get immediate priority
      if (this.trafficLight.getEmergencyTimer() >= 5) {
        console.log('🚨 Emergency vehicle detected. Switching to emergency mode.');
        this.trafficLight.setState(new EmergencyState(this.trafficLight));
        return;
      }
    }
    
    // Check for pedestrian request
    if (this.trafficLight.isPedestrianWaiting()) {
      this.trafficLight.incrementPedestrianTimer();
      
      // Give pedestrians priority after 10 seconds of waiting
      if (this.trafficLight.getPedestrianTimer() >= 10) {
        console.log('🚶 Pedestrian waiting. Switching to pedestrian mode.');
        this.trafficLight.setState(new PedestrianState(this.trafficLight));
        return;
      }
    }
    
    // Check if minimum green duration has passed
    if (this.trafficLight.getStateTimer() >= this.MIN_GREEN_DURATION) {
      // Check if there are vehicles waiting on the other side
      if (this.trafficLight.getVehicleCount() >= this.VEHICLE_THRESHOLD) {
        console.log('🚗 High vehicle count detected. Switching to yellow.');
        this.trafficLight.setState(new YellowState(this.trafficLight));
        return;
      }
      
      // Check if maximum green duration reached
      if (this.trafficLight.getStateTimer() >= this.MAX_GREEN_DURATION) {
        console.log('⏰ Maximum green duration reached. Switching to yellow.');
        this.trafficLight.setState(new YellowState(this.trafficLight));
        return;
      }
    }
  }

  handleEmergency(): void {
    console.log('🚨 Emergency signal received. Activating emergency mode.');
    this.trafficLight.setEmergencyMode(true);
  }

  handlePedestrianRequest(): void {
    console.log('🚶 Pedestrian request received. Will be processed after minimum green duration.');
    this.trafficLight.setPedestrianWaiting(true);
  }
}

// -------------------------------
// Emergency State
// -------------------------------
class EmergencyState implements TrafficLightState {
  private readonly EMERGENCY_DURATION = 15; // 15 seconds for emergency vehicles
  
  constructor(private trafficLight: TrafficLight) {}

  enter(): void {
    this.trafficLight.updateData({ currentState: 'Emergency' });
    this.trafficLight.resetTimer();
    console.log('🚨 EMERGENCY MODE: All traffic stopped for emergency vehicles.');
  }

  exit(): void {
    console.log('🚨 Emergency mode deactivated.');
    this.trafficLight.setEmergencyMode(false);
  }

  update(): void {
    this.trafficLight.incrementTimer();
    
    if (this.trafficLight.getStateTimer() >= this.EMERGENCY_DURATION) {
      console.log('🚨 Emergency duration complete. Returning to normal operation.');
      this.trafficLight.setState(new RedState(this.trafficLight));
    }
  }

  handleEmergency(): void {
    console.log('🚨 Emergency signal received. Already in emergency mode.');
  }

  handlePedestrianRequest(): void {
    console.log('🚶 Pedestrian request ignored during emergency mode.');
  }
}

// -------------------------------
// Pedestrian State
// -------------------------------
class PedestrianState implements TrafficLightState {
  private readonly PEDESTRIAN_DURATION = 20; // 20 seconds for pedestrians
  
  constructor(private trafficLight: TrafficLight) {}

  enter(): void {
    this.trafficLight.updateData({ currentState: 'Pedestrian' });
    this.trafficLight.resetTimer();
    console.log('🚶 PEDESTRIAN MODE: Walk signal activated.');
  }

  exit(): void {
    console.log('🚶 Pedestrian mode deactivated.');
    this.trafficLight.setPedestrianWaiting(false);
  }

  update(): void {
    this.trafficLight.incrementTimer();
    
    if (this.trafficLight.getStateTimer() >= this.PEDESTRIAN_DURATION) {
      console.log('🚶 Pedestrian duration complete. Returning to normal operation.');
      this.trafficLight.setState(new RedState(this.trafficLight));
    }
  }

  handleEmergency(): void {
    console.log('🚨 Emergency signal received. Will be processed after pedestrian cycle.');
  }

  handlePedestrianRequest(): void {
    console.log('🚶 Pedestrian request received. Already in pedestrian mode.');
  }
}

// ===============================
// 3. Usage Examples & Tests
// ===============================

function demoTrafficLight() {
  const trafficLight = new TrafficLight('TL-001', 'Main St & Oak Ave');
  
  console.log('--- Initial Traffic Light State ---');
  trafficLight.printStatus();
  
  // Simulate normal traffic cycle
  console.log('\n--- Normal Traffic Cycle ---');
  for (let i = 0; i < 40; i++) {
    trafficLight.update();
    if (i % 10 === 0) {
      trafficLight.printStatus();
    }
  }
  
  // Simulate pedestrian request
  console.log('\n--- Pedestrian Request ---');
  trafficLight.handlePedestrianRequest();
  for (let i = 0; i < 20; i++) {
    trafficLight.update();
    if (i % 5 === 0) {
      trafficLight.printStatus();
    }
  }
  
  // Simulate emergency vehicle
  console.log('\n--- Emergency Vehicle ---');
  trafficLight.handleEmergency();
  for (let i = 0; i < 20; i++) {
    trafficLight.update();
    if (i % 5 === 0) {
      trafficLight.printStatus();
    }
  }
  
  // Simulate high vehicle count
  console.log('\n--- High Vehicle Count ---');
  for (let i = 0; i < 10; i++) {
    trafficLight.addVehicle();
  }
  for (let i = 0; i < 25; i++) {
    trafficLight.update();
    if (i % 5 === 0) {
      trafficLight.printStatus();
    }
  }
  
  // Test edge cases
  console.log('\n--- Edge Cases ---');
  
  // Multiple emergency signals
  trafficLight.handleEmergency();
  trafficLight.handleEmergency();
  trafficLight.update();
  
  // Multiple pedestrian requests
  trafficLight.handlePedestrianRequest();
  trafficLight.handlePedestrianRequest();
  trafficLight.update();
  
  // Vehicle count management
  for (let i = 0; i < 15; i++) {
    trafficLight.removeVehicle();
  }
  trafficLight.update();
  trafficLight.printStatus();
}

demoTrafficLight();
exit(0);

export { TrafficLight, TrafficLightState, RedState, YellowState, GreenState, EmergencyState, PedestrianState, TrafficLightData }; 