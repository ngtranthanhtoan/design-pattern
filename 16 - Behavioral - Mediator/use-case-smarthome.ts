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

// Smart Device base class
abstract class SmartDevice implements Colleague {
  protected mediator: Mediator | null = null;
  protected isOn: boolean = false;
  protected name: string;

  constructor(
    protected id: string,
    name: string
  ) {
    this.name = name;
  }

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(event: string, data?: any): void {
    if (this.mediator) {
      console.log(`🏠 ${this.name}: Sending ${event}`);
      this.mediator.notify(this, event, data);
    }
  }

  receive(event: string, data?: any): void {
    console.log(`🏠 ${this.name}: Received ${event}`);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  abstract turnOn(): void;
  abstract turnOff(): void;
  abstract getStatus(): any;
}

// Light class
class SmartLight extends SmartDevice {
  private brightness: number = 100;
  private color: string = 'white';

  turnOn(): void {
    this.isOn = true;
    console.log(`    💡 ${this.name}: Turned ON`);
    this.send('light_on', { brightness: this.brightness, color: this.color });
  }

  turnOff(): void {
    this.isOn = false;
    console.log(`    💡 ${this.name}: Turned OFF`);
    this.send('light_off');
  }

  setBrightness(brightness: number): void {
    this.brightness = brightness;
    if (this.isOn) {
      console.log(`    💡 ${this.name}: Brightness set to ${brightness}%`);
      this.send('brightness_changed', { brightness });
    }
  }

  setColor(color: string): void {
    this.color = color;
    if (this.isOn) {
      console.log(`    💡 ${this.name}: Color changed to ${color}`);
      this.send('color_changed', { color });
    }
  }

  getStatus(): any {
    return {
      id: this.id,
      name: this.name,
      isOn: this.isOn,
      brightness: this.brightness,
      color: this.color
    };
  }
}

// Thermostat class
class SmartThermostat extends SmartDevice {
  private temperature: number = 22;
  private targetTemperature: number = 22;
  private mode: 'heat' | 'cool' | 'auto' = 'auto';

  turnOn(): void {
    this.isOn = true;
    console.log(`    🌡️  ${this.name}: Turned ON at ${this.temperature}°C`);
    this.send('thermostat_on', { temperature: this.temperature, mode: this.mode });
  }

  turnOff(): void {
    this.isOn = false;
    console.log(`    🌡️  ${this.name}: Turned OFF`);
    this.send('thermostat_off');
  }

  setTemperature(temp: number): void {
    this.targetTemperature = temp;
    console.log(`    🌡️  ${this.name}: Target temperature set to ${temp}°C`);
    this.send('temperature_set', { target: temp, current: this.temperature });
  }

  setMode(mode: 'heat' | 'cool' | 'auto'): void {
    this.mode = mode;
    console.log(`    🌡️  ${this.name}: Mode set to ${mode}`);
    this.send('mode_changed', { mode });
  }

  getStatus(): any {
    return {
      id: this.id,
      name: this.name,
      isOn: this.isOn,
      temperature: this.temperature,
      targetTemperature: this.targetTemperature,
      mode: this.mode
    };
  }
}

// Security Camera class
class SecurityCamera extends SmartDevice {
  private isRecording: boolean = false;
  private motionDetected: boolean = false;

  turnOn(): void {
    this.isOn = true;
    console.log(`    📹 ${this.name}: Turned ON`);
    this.send('camera_on');
  }

  turnOff(): void {
    this.isOn = false;
    this.isRecording = false;
    console.log(`    📹 ${this.name}: Turned OFF`);
    this.send('camera_off');
  }

  startRecording(): void {
    if (this.isOn) {
      this.isRecording = true;
      console.log(`    📹 ${this.name}: Started recording`);
      this.send('recording_started');
    }
  }

  stopRecording(): void {
    this.isRecording = false;
    console.log(`    📹 ${this.name}: Stopped recording`);
    this.send('recording_stopped');
  }

  detectMotion(): void {
    this.motionDetected = true;
    console.log(`    📹 ${this.name}: Motion detected!`);
    this.send('motion_detected', { timestamp: new Date().toISOString() });
  }

  getStatus(): any {
    return {
      id: this.id,
      name: this.name,
      isOn: this.isOn,
      isRecording: this.isRecording,
      motionDetected: this.motionDetected
    };
  }
}

// Door Lock class
class SmartDoorLock extends SmartDevice {
  private isLocked: boolean = true;
  private lastUnlockTime: Date | null = null;

  turnOn(): void {
    this.isOn = true;
    console.log(`    🔒 ${this.name}: System activated`);
    this.send('lock_system_on');
  }

  turnOff(): void {
    this.isOn = false;
    console.log(`    🔒 ${this.name}: System deactivated`);
    this.send('lock_system_off');
  }

  lock(): void {
    this.isLocked = true;
    console.log(`    🔒 ${this.name}: Door locked`);
    this.send('door_locked');
  }

  unlock(): void {
    this.isLocked = false;
    this.lastUnlockTime = new Date();
    console.log(`    🔓 ${this.name}: Door unlocked`);
    this.send('door_unlocked', { timestamp: this.lastUnlockTime.toISOString() });
  }

  getStatus(): any {
    return {
      id: this.id,
      name: this.name,
      isOn: this.isOn,
      isLocked: this.isLocked,
      lastUnlockTime: this.lastUnlockTime
    };
  }
}

// Home Automation Mediator
class HomeAutomationMediator implements Mediator {
  private devices: Map<string, SmartDevice> = new Map();
  private scenes: Map<string, any> = new Map();
  private automationRules: any[] = [];

  addDevice(device: SmartDevice): void {
    this.devices.set(device.getId(), device);
    device.setMediator(this);
    console.log(`🏠 Home: Device ${device.getName()} registered`);
  }

  notify(sender: Colleague, event: string, data?: any): void {
    console.log(`🎯 Home: Routing ${event} from ${sender.getId()}`);
    
    switch (event) {
      case 'motion_detected':
        this.handleMotionDetected(sender as SecurityCamera, data);
        break;
      case 'door_unlocked':
        this.handleDoorUnlocked(sender as SmartDoorLock, data);
        break;
      case 'temperature_set':
        this.handleTemperatureSet(sender as SmartThermostat, data);
        break;
      case 'light_on':
        this.handleLightOn(sender as SmartLight, data);
        break;
    }

    // Check automation rules
    this.checkAutomationRules(event, sender, data);
  }

  private handleMotionDetected(camera: SecurityCamera, data: any): void {
    console.log(`🚨 Home: Motion detected by ${camera.getName()} - activating security mode`);
    
    // Turn on lights in the area
    this.devices.forEach(device => {
      if (device instanceof SmartLight) {
        device.turnOn();
        device.setBrightness(50);
      }
    });

    // Start recording on all cameras
    this.devices.forEach(device => {
      if (device instanceof SecurityCamera) {
        device.startRecording();
      }
    });
  }

  private handleDoorUnlocked(lock: SmartDoorLock, data: any): void {
    console.log(`🚪 Home: Door unlocked - activating welcome mode`);
    
    // Turn on entry lights
    this.devices.forEach(device => {
      if (device instanceof SmartLight && device.getName().includes('Entry')) {
        device.turnOn();
        device.setBrightness(100);
      }
    });

    // Adjust thermostat for comfort
    this.devices.forEach(device => {
      if (device instanceof SmartThermostat) {
        device.setTemperature(22);
      }
    });
  }

  private handleTemperatureSet(thermostat: SmartThermostat, data: any): void {
    console.log(`🌡️  Home: Temperature adjusted - optimizing energy usage`);
    
    // Adjust lights based on temperature
    this.devices.forEach(device => {
      if (device instanceof SmartLight) {
        if (data.target > 25) {
          device.setColor('cool_white');
        } else if (data.target < 18) {
          device.setColor('warm_white');
        }
      }
    });
  }

  private handleLightOn(light: SmartLight, data: any): void {
    console.log(`💡 Home: Light turned on - checking energy optimization`);
    
    // Adjust other lights for energy efficiency
    this.devices.forEach(device => {
      if (device instanceof SmartLight && device.getId() !== light.getId()) {
        device.setBrightness(Math.max(30, data.brightness - 20));
      }
    });
  }

  private checkAutomationRules(event: string, sender: Colleague, data: any): void {
    this.automationRules.forEach(rule => {
      if (rule.trigger === event && rule.condition(sender, data)) {
        console.log(`🤖 Home: Executing automation rule: ${rule.name}`);
        rule.action(this.devices);
      }
    });
  }

  // Home automation-specific methods
  createScene(name: string, actions: any[]): void {
    this.scenes.set(name, actions);
    console.log(`🎭 Home: Scene "${name}" created`);
  }

  activateScene(name: string): void {
    const scene = this.scenes.get(name);
    if (scene) {
      console.log(`🎭 Home: Activating scene "${name}"`);
      scene.forEach((action: any) => {
        const device = this.devices.get(action.deviceId);
        if (device) {
          action.execute(device);
        }
      });
    }
  }

  addAutomationRule(rule: any): void {
    this.automationRules.push(rule);
    console.log(`🤖 Home: Automation rule "${rule.name}" added`);
  }

  getDeviceStatus(): any {
    const status: any = {};
    this.devices.forEach(device => {
      status[device.getId()] = device.getStatus();
    });
    return status;
  }
}

// Demo
console.log('=== SMART HOME AUTOMATION MEDIATOR DEMO ===\n');

// Create mediator
const homeMediator = new HomeAutomationMediator();

// Create devices
const livingRoomLight = new SmartLight('light-001', 'Living Room Light');
const kitchenLight = new SmartLight('light-002', 'Kitchen Light');
const entryLight = new SmartLight('light-003', 'Entry Light');
const thermostat = new SmartThermostat('therm-001', 'Main Thermostat');
const frontCamera = new SecurityCamera('cam-001', 'Front Door Camera');
const backCamera = new SecurityCamera('cam-002', 'Backyard Camera');
const frontDoorLock = new SmartDoorLock('lock-001', 'Front Door Lock');

// Register devices
homeMediator.addDevice(livingRoomLight);
homeMediator.addDevice(kitchenLight);
homeMediator.addDevice(entryLight);
homeMediator.addDevice(thermostat);
homeMediator.addDevice(frontCamera);
homeMediator.addDevice(backCamera);
homeMediator.addDevice(frontDoorLock);

// Create scenes
homeMediator.createScene('Movie Night', [
  { deviceId: 'light-001', execute: (device: SmartLight) => { device.turnOn(); device.setBrightness(20); device.setColor('blue'); } },
  { deviceId: 'therm-001', execute: (device: SmartThermostat) => { device.setTemperature(20); } }
]);

homeMediator.createScene('Good Morning', [
  { deviceId: 'light-001', execute: (device: SmartLight) => { device.turnOn(); device.setBrightness(100); device.setColor('warm_white'); } },
  { deviceId: 'light-002', execute: (device: SmartLight) => { device.turnOn(); device.setBrightness(80); } },
  { deviceId: 'therm-001', execute: (device: SmartThermostat) => { device.setTemperature(22); } }
]);

// Add automation rules
homeMediator.addAutomationRule({
  name: 'Energy Saving',
  trigger: 'light_on',
  condition: (sender: Colleague, data: any) => data.brightness > 80,
  action: (devices: Map<string, SmartDevice>) => {
    console.log('    💚 Energy saving mode activated');
  }
});

console.log('\n--- Smart Home Interactions ---');

// Activate scenes
homeMediator.activateScene('Good Morning');

// Simulate motion detection
frontCamera.turnOn();
frontCamera.detectMotion();

// Simulate door unlock
frontDoorLock.turnOn();
frontDoorLock.unlock();

// Manual device control
livingRoomLight.turnOn();
livingRoomLight.setBrightness(90);
livingRoomLight.setColor('red');

thermostat.turnOn();
thermostat.setTemperature(24);

console.log('\n--- Device Status ---');
const status = homeMediator.getDeviceStatus();
console.log('Device Status:', JSON.stringify(status, null, 2));

console.log('\n✅ Smart home automation mediation completed successfully');

exit(0); 