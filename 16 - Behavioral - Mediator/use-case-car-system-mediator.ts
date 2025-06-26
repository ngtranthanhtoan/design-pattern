import { exit } from 'process';

// Mediator interface
interface Mediator {
  notify(sender: CarComponent, event: string, data?: any): void;
}

// CarComponent interface
interface CarComponent {
  setMediator(mediator: Mediator): void;
  send(event: string, data?: any): void;
  receive(event: string, data?: any): void;
  getId(): string;
}

// CarRunningMediator
class CarRunningMediator implements Mediator {
  private ignition: Ignition | null = null;
  private gear: Gear | null = null;
  private accelerator: Accelerator | null = null;
  private brake: Brake | null = null;
  private running: boolean = false;
  private speed: number = 0;

  setIgnition(ignition: Ignition) {
    this.ignition = ignition;
    ignition.setMediator(this);
  }
  setGear(gear: Gear) {
    this.gear = gear;
    gear.setMediator(this);
  }
  setAccelerator(accelerator: Accelerator) {
    this.accelerator = accelerator;
    accelerator.setMediator(this);
  }
  setBrake(brake: Brake) {
    this.brake = brake;
    brake.setMediator(this);
  }

  notify(sender: CarComponent, event: string, data?: any): void {
    const senderId = sender.getId ? sender.getId() : 'mediator';
    console.log(`🚗 Mediator: Received ${event} from ${senderId}`);
    switch (event) {
      case 'ignition_on':
        this.handleIgnitionOn();
        break;
      case 'ignition_off':
        this.handleIgnitionOff();
        break;
      case 'gear_changed':
        this.handleGearChanged(data);
        break;
      case 'accelerate':
        this.handleAccelerate(data);
        break;
      case 'brake':
        this.handleBrake(data);
        break;
    }
  }

  private handleIgnitionOn() {
    if (this.gear && this.gear.getCurrentGear() !== 'P') {
      console.log('  ❌ Cannot start: Gear is not in Park.');
      this.ignition?.receive('ignition_blocked', { reason: 'Gear not in Park' });
      return;
    }
    this.running = true;
    this.speed = 0;
    console.log('  ✅ Car started.');
  }

  private handleIgnitionOff() {
    this.running = false;
    this.speed = 0;
    console.log('  🛑 Car turned off.');
  }

  private handleGearChanged(data: any) {
    if (!this.running && data.gear !== 'P') {
      console.log('  ❌ Cannot shift out of Park: Car is off.');
      this.gear?.receive('gear_blocked', { reason: 'Car is off' });
      return;
    }
    if (this.running && data.gear === 'R' && this.speed > 0) {
      console.log('  ❌ Cannot shift to Reverse while moving.');
      this.gear?.receive('gear_blocked', { reason: 'Car is moving' });
      return;
    }
    this.gear?.receive('gear_accepted', { gear: data.gear });
    console.log(`  🔄 Gear changed to ${data.gear}`);
  }

  private handleAccelerate(data: any) {
    if (!this.running) {
      console.log('  ❌ Cannot accelerate: Car is off.');
      this.accelerator?.receive('acceleration_blocked', { reason: 'Car is off' });
      return;
    }
    if (this.brake && this.brake.isPressed()) {
      console.log('  ❌ Cannot accelerate: Brake is pressed.');
      this.accelerator?.receive('acceleration_blocked', { reason: 'Brake is pressed' });
      return;
    }
    if (this.gear && (this.gear.getCurrentGear() === 'N' || this.gear.getCurrentGear() === 'P')) {
      console.log('  ❌ Cannot accelerate: Gear is not in Drive or Reverse.');
      this.accelerator?.receive('acceleration_blocked', { reason: 'Gear not in Drive/Reverse' });
      return;
    }
    this.speed += data.amount;
    console.log(`  🚀 Accelerated. Speed is now ${this.speed} km/h.`);
  }

  private handleBrake(data: any) {
    if (!this.running) {
      console.log('  🛑 Car is already stopped.');
      return;
    }
    if (this.speed > 0) {
      this.speed = Math.max(0, this.speed - data.amount);
      console.log(`  🛑 Braked. Speed is now ${this.speed} km/h.`);
    } else {
      console.log('  🛑 Car is stationary.');
    }
  }

  getCarState() {
    return {
      running: this.running,
      speed: this.speed,
      gear: this.gear?.getCurrentGear(),
      brakePressed: this.brake?.isPressed(),
    };
  }
}

// Ignition
class Ignition implements CarComponent {
  private mediator: Mediator | null = null;
  private id: string;
  constructor(id: string) { this.id = id; }
  setMediator(mediator: Mediator): void { this.mediator = mediator; }
  send(event: string, data?: any): void { this.mediator?.notify(this, event, data); }
  receive(event: string, data?: any): void {
    if (event === 'ignition_blocked') {
      console.log(`  🔑 Ignition blocked: ${data.reason}`);
    }
  }
  getId(): string { return this.id; }
  turnOn() { this.send('ignition_on'); }
  turnOff() { this.send('ignition_off'); }
}

// Gear
class Gear implements CarComponent {
  private mediator: Mediator | null = null;
  private id: string;
  private currentGear: 'P' | 'R' | 'N' | 'D' = 'P';
  constructor(id: string) { this.id = id; }
  setMediator(mediator: Mediator): void { this.mediator = mediator; }
  send(event: string, data?: any): void { this.mediator?.notify(this, event, data); }
  receive(event: string, data?: any): void {
    if (event === 'gear_blocked') {
      console.log(`  ⚙️ Gear change blocked: ${data.reason}`);
    }
    if (event === 'gear_accepted') {
      this.currentGear = data.gear;
    }
  }
  getId(): string { return this.id; }
  changeGear(gear: 'P' | 'R' | 'N' | 'D') { this.send('gear_changed', { gear }); }
  getCurrentGear() { return this.currentGear; }
}

// Accelerator
class Accelerator implements CarComponent {
  private mediator: Mediator | null = null;
  private id: string;
  constructor(id: string) { this.id = id; }
  setMediator(mediator: Mediator): void { this.mediator = mediator; }
  send(event: string, data?: any): void { this.mediator?.notify(this, event, data); }
  receive(event: string, data?: any): void {
    if (event === 'acceleration_blocked') {
      console.log(`  🦶 Acceleration blocked: ${data.reason}`);
    }
  }
  getId(): string { return this.id; }
  press(amount: number) { this.send('accelerate', { amount }); }
}

// Brake
class Brake implements CarComponent {
  private mediator: Mediator | null = null;
  private id: string;
  private pressed: boolean = false;
  constructor(id: string) { this.id = id; }
  setMediator(mediator: Mediator): void { this.mediator = mediator; }
  send(event: string, data?: any): void { this.mediator?.notify(this, event, data); }
  receive(event: string, data?: any): void {}
  getId(): string { return this.id; }
  press(amount: number) { this.pressed = true; this.send('brake', { amount }); }
  release() { this.pressed = false; }
  isPressed() { return this.pressed; }
}

// Demo
console.log('=== CAR SYSTEM MEDIATOR DEMO ===\n');

const mediator = new CarRunningMediator();
const ignition = new Ignition('ignition');
const gear = new Gear('gear');
const accelerator = new Accelerator('accelerator');
const brake = new Brake('brake');

mediator.setIgnition(ignition);
mediator.setGear(gear);
mediator.setAccelerator(accelerator);
mediator.setBrake(brake);

console.log('\n--- Scenario 1: Try to start car in Drive ---');
gear.changeGear('D');
ignition.turnOn();

console.log('\n--- Scenario 2: Start car in Park, shift to Drive, accelerate ---');
gear.changeGear('P');
ignition.turnOn();
gear.changeGear('D');
accelerator.press(20);

console.log('\n--- Scenario 3: Try to accelerate with brake pressed ---');
brake.press(10);
accelerator.press(10);
brake.release();

console.log('\n--- Scenario 4: Brake while moving ---');
brake.press(10);
brake.release();

console.log('\n--- Scenario 5: Try to shift to Reverse while moving ---');
gear.changeGear('R');

console.log('\n--- Scenario 6: Turn off car while moving ---');
ignition.turnOff();

console.log('\n--- Final Car State ---');
console.log(mediator.getCarState());

exit(0); 