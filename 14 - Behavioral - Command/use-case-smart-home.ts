import { exit } from 'process';

// Command interface
interface Command {
  execute(): void;
  undo(): void;
}

// Device receivers
class Light {
  private isOn: boolean = false;
  private brightness: number = 100;
  private location: string;
  
  constructor(location: string) {
    this.location = location;
  }
  
  turnOn(): void {
    this.isOn = true;
    console.log(`💡 ${this.location} light turned ON`);
  }
  
  turnOff(): void {
    this.isOn = false;
    console.log(`💡 ${this.location} light turned OFF`);
  }
  
  setBrightness(level: number): void {
    this.brightness = Math.max(0, Math.min(100, level));
    console.log(`💡 ${this.location} light brightness set to ${this.brightness}%`);
  }
  
  getState(): { isOn: boolean; brightness: number } {
    return { isOn: this.isOn, brightness: this.brightness };
  }
  
  setState(state: { isOn: boolean; brightness: number }): void {
    this.isOn = state.isOn;
    this.brightness = state.brightness;
  }
}

class Thermostat {
  private temperature: number = 22;
  private mode: 'heat' | 'cool' | 'off' = 'off';
  private location: string;
  
  constructor(location: string) {
    this.location = location;
  }
  
  setTemperature(temp: number): void {
    this.temperature = temp;
    console.log(`🌡️  ${this.location} thermostat set to ${temp}°C`);
  }
  
  setMode(mode: 'heat' | 'cool' | 'off'): void {
    this.mode = mode;
    console.log(`🌡️  ${this.location} thermostat mode set to ${mode}`);
  }
  
  getState(): { temperature: number; mode: 'heat' | 'cool' | 'off' } {
    return { temperature: this.temperature, mode: this.mode };
  }
  
  setState(state: { temperature: number; mode: 'heat' | 'cool' | 'off' }): void {
    this.temperature = state.temperature;
    this.mode = state.mode;
  }
}

class SecuritySystem {
  private isArmed: boolean = false;
  private mode: 'home' | 'away' | 'night' = 'home';
  
  arm(mode: 'home' | 'away' | 'night'): void {
    this.isArmed = true;
    this.mode = mode;
    console.log(`🔒 Security system armed in ${mode} mode`);
  }
  
  disarm(): void {
    this.isArmed = false;
    console.log(`🔓 Security system disarmed`);
  }
  
  getState(): { isArmed: boolean; mode: 'home' | 'away' | 'night' } {
    return { isArmed: this.isArmed, mode: this.mode };
  }
  
  setState(state: { isArmed: boolean; mode: 'home' | 'away' | 'night' }): void {
    this.isArmed = state.isArmed;
    this.mode = state.mode;
  }
}

// Light commands
class LightOnCommand implements Command {
  private light: Light;
  private previousState: { isOn: boolean; brightness: number };
  
  constructor(light: Light) {
    this.light = light;
    this.previousState = light.getState();
  }
  
  execute(): void {
    this.light.turnOn();
  }
  
  undo(): void {
    this.light.setState(this.previousState);
    console.log(`↩️  Light command undone`);
  }
}

class LightOffCommand implements Command {
  private light: Light;
  private previousState: { isOn: boolean; brightness: number };
  
  constructor(light: Light) {
    this.light = light;
    this.previousState = light.getState();
  }
  
  execute(): void {
    this.light.turnOff();
  }
  
  undo(): void {
    this.light.setState(this.previousState);
    console.log(`↩️  Light command undone`);
  }
}

class SetBrightnessCommand implements Command {
  private light: Light;
  private brightness: number;
  private previousState: { isOn: boolean; brightness: number };
  
  constructor(light: Light, brightness: number) {
    this.light = light;
    this.brightness = brightness;
    this.previousState = light.getState();
  }
  
  execute(): void {
    this.light.setBrightness(this.brightness);
  }
  
  undo(): void {
    this.light.setState(this.previousState);
    console.log(`↩️  Brightness command undone`);
  }
}

// Thermostat commands
class SetTemperatureCommand implements Command {
  private thermostat: Thermostat;
  private temperature: number;
  private previousState: { temperature: number; mode: 'heat' | 'cool' | 'off' };
  
  constructor(thermostat: Thermostat, temperature: number) {
    this.thermostat = thermostat;
    this.temperature = temperature;
    this.previousState = thermostat.getState();
  }
  
  execute(): void {
    this.thermostat.setTemperature(this.temperature);
  }
  
  undo(): void {
    this.thermostat.setState(this.previousState);
    console.log(`↩️  Temperature command undone`);
  }
}

// Security commands
class ArmSecurityCommand implements Command {
  private security: SecuritySystem;
  private mode: 'home' | 'away' | 'night';
  private previousState: { isArmed: boolean; mode: 'home' | 'away' | 'night' };
  
  constructor(security: SecuritySystem, mode: 'home' | 'away' | 'night') {
    this.security = security;
    this.mode = mode;
    this.previousState = security.getState();
  }
  
  execute(): void {
    this.security.arm(this.mode);
  }
  
  undo(): void {
    this.security.setState(this.previousState);
    console.log(`↩️  Security command undone`);
  }
}

// Macro command for "Good Night" scene
class GoodNightSceneCommand implements Command {
  private commands: Command[];
  
  constructor(commands: Command[]) {
    this.commands = commands;
  }
  
  execute(): void {
    console.log('🌙 Executing "Good Night" scene...');
    this.commands.forEach(cmd => cmd.execute());
  }
  
  undo(): void {
    console.log('↩️  Undoing "Good Night" scene...');
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

// Command invoker
class SmartHomeController {
  private commandHistory: Command[] = [];
  
  executeCommand(command: Command): void {
    command.execute();
    this.commandHistory.push(command);
  }
  
  undoLastCommand(): void {
    if (this.commandHistory.length > 0) {
      const command = this.commandHistory.pop()!;
      command.undo();
    } else {
      console.log('⚠️  No commands to undo');
    }
  }
}

// Demo
const livingRoomLight = new Light('Living Room');
const bedroomLight = new Light('Bedroom');
const thermostat = new Thermostat('Main Floor');
const security = new SecuritySystem();

const controller = new SmartHomeController();

console.log('=== SMART HOME AUTOMATION DEMO ===\n');

// Individual commands
console.log('--- Individual Commands ---');
controller.executeCommand(new LightOnCommand(livingRoomLight));
controller.executeCommand(new SetBrightnessCommand(livingRoomLight, 75));
controller.executeCommand(new SetTemperatureCommand(thermostat, 24));
controller.executeCommand(new ArmSecurityCommand(security, 'home'));

console.log('\n--- Undoing Last Command ---');
controller.undoLastCommand();

// Macro command
console.log('\n--- Macro Command: Good Night Scene ---');
const goodNightCommands = [
  new LightOffCommand(livingRoomLight),
  new SetBrightnessCommand(bedroomLight, 30),
  new SetTemperatureCommand(thermostat, 20),
  new ArmSecurityCommand(security, 'night')
];

const goodNightScene = new GoodNightSceneCommand(goodNightCommands);
controller.executeCommand(goodNightScene);

console.log('\n--- Undoing Good Night Scene ---');
controller.undoLastCommand();

exit(0); 