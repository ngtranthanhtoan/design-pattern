import { exit } from 'process';

// Observer interface
interface Observer {
  update(weatherData: WeatherData): void;
}

// Subject interface
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(weatherData: WeatherData): void;
}

// Weather data interface
interface WeatherData {
  id: string;
  timestamp: Date;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number; // Celsius
    humidity: number; // Percentage
    pressure: number; // hPa
    windSpeed: number; // km/h
    windDirection: number; // degrees
    visibility: number; // km
    uvIndex: number;
    feelsLike: number; // Celsius
  };
  forecast?: {
    hourly: Array<{
      time: Date;
      temperature: number;
      humidity: number;
      description: string;
      icon: string;
    }>;
    daily: Array<{
      date: Date;
      high: number;
      low: number;
      description: string;
      precipitation: number;
    }>;
  };
  alerts?: Array<{
    type: 'storm' | 'flood' | 'heat' | 'cold' | 'air_quality';
    severity: 'low' | 'medium' | 'high' | 'extreme';
    message: string;
    expires: Date;
  }>;
}

// Weather Station (Subject)
class WeatherStation implements Subject {
  private observers: Set<Observer> = new Set();
  private weatherData: WeatherData;
  private updateCounter: number = 0;
  private location: WeatherData['location'];

  constructor(location: WeatherData['location']) {
    this.location = location;
    this.weatherData = this.createInitialWeatherData();
  }

  attach(observer: Observer): void {
    this.observers.add(observer);
    console.log(`🌤️ ${observer.constructor.name} subscribed to weather station in ${this.location.city}`);
  }

  detach(observer: Observer): void {
    this.observers.delete(observer);
    console.log(`🌤️ ${observer.constructor.name} unsubscribed from weather station in ${this.location.city}`);
  }

  notify(weatherData: WeatherData): void {
    console.log(`🔔 Weather station notifying ${this.observers.size} observers about weather update`);
    this.observers.forEach(observer => {
      try {
        observer.update(weatherData);
      } catch (error) {
        console.error(`❌ Error notifying ${observer.constructor.name}:`, error);
      }
    });
  }

  private createInitialWeatherData(): WeatherData {
    return {
      id: `weather-${++this.updateCounter}`,
      timestamp: new Date(),
      location: this.location,
      current: {
        temperature: 20,
        humidity: 65,
        pressure: 1013.25,
        windSpeed: 10,
        windDirection: 180,
        visibility: 10,
        uvIndex: 5,
        feelsLike: 22
      }
    };
  }

  updateWeather(updates: Partial<WeatherData['current']>): void {
    this.weatherData = {
      ...this.weatherData,
      id: `weather-${++this.updateCounter}`,
      timestamp: new Date(),
      current: {
        ...this.weatherData.current,
        ...updates
      }
    };

    console.log(`🌡️ Weather updated in ${this.location.city}: ${updates.temperature ? `${updates.temperature}°C` : ''} ${updates.humidity ? `${updates.humidity}% humidity` : ''}`);
    
    this.notify(this.weatherData);
  }

  updateForecast(forecast: WeatherData['forecast']): void {
    this.weatherData = {
      ...this.weatherData,
      id: `weather-${++this.updateCounter}`,
      timestamp: new Date(),
      forecast
    };

    console.log(`📅 Forecast updated for ${this.location.city}`);
    this.notify(this.weatherData);
  }

  addAlert(alert: NonNullable<WeatherData['alerts']>[0]): void {
    if (!this.weatherData.alerts) {
      this.weatherData.alerts = [];
    }

    this.weatherData.alerts.push(alert);
    this.weatherData = {
      ...this.weatherData,
      id: `weather-${++this.updateCounter}`,
      timestamp: new Date()
    };

    console.log(`⚠️ Weather alert added for ${this.location.city}: ${alert.message}`);
    this.notify(this.weatherData);
  }

  getCurrentWeather(): WeatherData {
    return { ...this.weatherData };
  }

  getLocation(): WeatherData['location'] {
    return { ...this.location };
  }
}

// Weather Display (Observer)
class WeatherDisplay implements Observer {
  private name: string;
  private location: string;
  private displayFormat: 'metric' | 'imperial';
  private showDetails: boolean;

  constructor(name: string, location: string, options: {
    format?: 'metric' | 'imperial';
    showDetails?: boolean;
  } = {}) {
    this.name = name;
    this.location = location;
    this.displayFormat = options.format || 'metric';
    this.showDetails = options.showDetails ?? true;
  }

  update(weatherData: WeatherData): void {
    if (weatherData.location.city !== this.location) {
      return; // Only show weather for this display's location
    }

    console.log(`\n📺 ${this.name} Weather Display:`);
    console.log(`📍 ${weatherData.location.city}, ${weatherData.location.country}`);
    console.log(`🕐 ${weatherData.timestamp.toLocaleString()}`);
    
    const temp = this.displayFormat === 'imperial' 
      ? `${(weatherData.current.temperature * 9/5 + 32).toFixed(1)}°F`
      : `${weatherData.current.temperature.toFixed(1)}°C`;
    
    const feelsLike = this.displayFormat === 'imperial'
      ? `${(weatherData.current.feelsLike * 9/5 + 32).toFixed(1)}°F`
      : `${weatherData.current.feelsLike.toFixed(1)}°C`;

    console.log(`🌡️ Temperature: ${temp} (Feels like: ${feelsLike})`);
    console.log(`💧 Humidity: ${weatherData.current.humidity}%`);
    console.log(`🌪️ Wind: ${weatherData.current.windSpeed} km/h at ${weatherData.current.windDirection}°`);
    console.log(`👁️ Visibility: ${weatherData.current.visibility} km`);
    console.log(`☀️ UV Index: ${weatherData.current.uvIndex}`);

    if (this.showDetails) {
      console.log(`📊 Pressure: ${weatherData.current.pressure} hPa`);
    }

    // Show alerts if any
    if (weatherData.alerts && weatherData.alerts.length > 0) {
      console.log(`⚠️ Alerts:`);
      weatherData.alerts.forEach(alert => {
        console.log(`   - ${alert.severity.toUpperCase()}: ${alert.message}`);
      });
    }
  }

  getName(): string {
    return this.name;
  }
}

// Mobile App (Observer)
class MobileApp implements Observer {
  private name: string;
  private userId: string;
  private subscribedLocations: Set<string> = new Set();
  private notificationPreferences: {
    temperature: boolean;
    rain: boolean;
    storms: boolean;
    alerts: boolean;
  };
  private notifications: Array<{ message: string; timestamp: Date; type: string }> = [];

  constructor(name: string, userId: string, locations: string[], preferences: {
    temperature?: boolean;
    rain?: boolean;
    storms?: boolean;
    alerts?: boolean;
  } = {}) {
    this.name = name;
    this.userId = userId;
    locations.forEach(location => this.subscribedLocations.add(location));
    this.notificationPreferences = {
      temperature: preferences.temperature ?? true,
      rain: preferences.rain ?? true,
      storms: preferences.storms ?? true,
      alerts: preferences.alerts ?? true
    };
  }

  update(weatherData: WeatherData): void {
    if (!this.subscribedLocations.has(weatherData.location.city)) {
      return;
    }

    console.log(`📱 ${this.name} received weather update for ${weatherData.location.city}`);

    // Check for significant changes and send notifications
    this.checkForNotifications(weatherData);
  }

  private checkForNotifications(weatherData: WeatherData): void {
    const temp = weatherData.current.temperature;
    const humidity = weatherData.current.humidity;

    // Temperature alerts
    if (this.notificationPreferences.temperature) {
      if (temp > 30) {
        this.sendNotification(`High temperature alert: ${temp}°C in ${weatherData.location.city}`, 'temperature');
      } else if (temp < 0) {
        this.sendNotification(`Low temperature alert: ${temp}°C in ${weatherData.location.city}`, 'temperature');
      }
    }

    // Rain alerts
    if (this.notificationPreferences.rain && humidity > 80) {
      this.sendNotification(`High humidity: ${humidity}% - rain likely in ${weatherData.location.city}`, 'rain');
    }

    // Storm alerts
    if (this.notificationPreferences.storms && weatherData.current.windSpeed > 50) {
      this.sendNotification(`High winds: ${weatherData.current.windSpeed} km/h in ${weatherData.location.city}`, 'storms');
    }

    // Weather alerts
    if (this.notificationPreferences.alerts && weatherData.alerts) {
      weatherData.alerts.forEach(alert => {
        this.sendNotification(`Weather Alert: ${alert.message}`, 'alert');
      });
    }
  }

  private sendNotification(message: string, type: string): void {
    const notification = {
      message,
      timestamp: new Date(),
      type
    };

    this.notifications.push(notification);
    console.log(`🔔 ${this.name} Notification: ${message}`);
  }

  addLocation(location: string): void {
    this.subscribedLocations.add(location);
    console.log(`📍 ${this.name} added location: ${location}`);
  }

  removeLocation(location: string): void {
    this.subscribedLocations.delete(location);
    console.log(`📍 ${this.name} removed location: ${location}`);
  }

  getNotifications(): Array<{ message: string; timestamp: Date; type: string }> {
    return [...this.notifications];
  }

  getName(): string {
    return this.name;
  }
}

// Agriculture System (Observer)
class AgricultureSystem implements Observer {
  private name: string;
  private farmLocation: string;
  private crops: Array<{
    name: string;
    optimalTemp: { min: number; max: number };
    optimalHumidity: { min: number; max: number };
    waterNeeds: number; // mm per day
  }> = [];
  private irrigationSystem: {
    isActive: boolean;
    lastWatered: Date;
    waterLevel: number;
  };

  constructor(name: string, farmLocation: string) {
    this.name = name;
    this.farmLocation = farmLocation;
    this.irrigationSystem = {
      isActive: false,
      lastWatered: new Date(),
      waterLevel: 100
    };
  }

  update(weatherData: WeatherData): void {
    if (weatherData.location.city !== this.farmLocation) {
      return;
    }

    console.log(`🌾 ${this.name} received weather update for ${weatherData.location.city}`);
    
    this.analyzeCropConditions(weatherData);
    this.manageIrrigation(weatherData);
    this.checkForFrost(weatherData);
  }

  private analyzeCropConditions(weatherData: WeatherData): void {
    const temp = weatherData.current.temperature;
    const humidity = weatherData.current.humidity;

    this.crops.forEach(crop => {
      const tempOk = temp >= crop.optimalTemp.min && temp <= crop.optimalTemp.max;
      const humidityOk = humidity >= crop.optimalHumidity.min && humidity <= crop.optimalHumidity.max;

      if (!tempOk) {
        console.log(`🌱 ${crop.name}: Temperature ${temp}°C is outside optimal range (${crop.optimalTemp.min}-${crop.optimalTemp.max}°C)`);
      }

      if (!humidityOk) {
        console.log(`🌱 ${crop.name}: Humidity ${humidity}% is outside optimal range (${crop.optimalHumidity.min}-${crop.optimalHumidity.max}%)`);
      }

      if (tempOk && humidityOk) {
        console.log(`✅ ${crop.name}: Conditions optimal`);
      }
    });
  }

  private manageIrrigation(weatherData: WeatherData): void {
    const humidity = weatherData.current.humidity;
    const hoursSinceWatered = (new Date().getTime() - this.irrigationSystem.lastWatered.getTime()) / (1000 * 60 * 60);

    // Check if irrigation is needed
    if (humidity < 60 && hoursSinceWatered > 12 && this.irrigationSystem.waterLevel > 20) {
      this.activateIrrigation();
    } else if (humidity > 80) {
      this.deactivateIrrigation();
    }
  }

  private checkForFrost(weatherData: WeatherData): void {
    if (weatherData.current.temperature < 2) {
      console.log(`❄️ ${this.name} FROST WARNING: Temperature ${weatherData.current.temperature}°C - activating frost protection`);
      this.activateFrostProtection();
    }
  }

  private activateIrrigation(): void {
    this.irrigationSystem.isActive = true;
    this.irrigationSystem.lastWatered = new Date();
    this.irrigationSystem.waterLevel -= 10;
    console.log(`💧 ${this.name} Irrigation activated. Water level: ${this.irrigationSystem.waterLevel}%`);
  }

  private deactivateIrrigation(): void {
    this.irrigationSystem.isActive = false;
    console.log(`💧 ${this.name} Irrigation deactivated due to high humidity`);
  }

  private activateFrostProtection(): void {
    console.log(`🔥 ${this.name} Frost protection system activated`);
  }

  addCrop(crop: { name: string; optimalTemp: { min: number; max: number }; optimalHumidity: { min: number; max: number }; waterNeeds: number }): void {
    this.crops.push(crop);
    console.log(`🌱 ${this.name} added crop: ${crop.name}`);
  }

  getCrops(): Array<{ name: string; optimalTemp: { min: number; max: number }; optimalHumidity: { min: number; max: number }; waterNeeds: number }> {
    return [...this.crops];
  }

  getName(): string {
    return this.name;
  }
}

// Emergency Services (Observer)
class EmergencyServices implements Observer {
  private name: string;
  private serviceArea: string;
  private emergencyThresholds: {
    windSpeed: number;
    temperature: { min: number; max: number };
    visibility: number;
  };
  private activeAlerts: Array<{ type: string; severity: string; timestamp: Date }> = [];

  constructor(name: string, serviceArea: string) {
    this.name = name;
    this.serviceArea = serviceArea;
    this.emergencyThresholds = {
      windSpeed: 80, // km/h
      temperature: { min: -10, max: 40 },
      visibility: 1 // km
    };
  }

  update(weatherData: WeatherData): void {
    if (weatherData.location.city !== this.serviceArea) {
      return;
    }

    console.log(`🚨 ${this.name} monitoring weather in ${weatherData.location.city}`);
    
    this.checkEmergencyConditions(weatherData);
    this.processWeatherAlerts(weatherData);
  }

  private checkEmergencyConditions(weatherData: WeatherData): void {
    const temp = weatherData.current.temperature;
    const windSpeed = weatherData.current.windSpeed;
    const visibility = weatherData.current.visibility;

    // Check for dangerous conditions
    if (windSpeed > this.emergencyThresholds.windSpeed) {
      this.declareEmergency('High winds', 'extreme', `Wind speed ${windSpeed} km/h exceeds safety threshold`);
    }

    if (temp < this.emergencyThresholds.temperature.min) {
      this.declareEmergency('Extreme cold', 'high', `Temperature ${temp}°C below safety threshold`);
    }

    if (temp > this.emergencyThresholds.temperature.max) {
      this.declareEmergency('Extreme heat', 'high', `Temperature ${temp}°C above safety threshold`);
    }

    if (visibility < this.emergencyThresholds.visibility) {
      this.declareEmergency('Low visibility', 'medium', `Visibility ${visibility} km below safety threshold`);
    }
  }

  private processWeatherAlerts(weatherData: WeatherData): void {
    if (weatherData.alerts) {
      weatherData.alerts.forEach(alert => {
        if (alert.severity === 'high' || alert.severity === 'extreme') {
          this.declareEmergency(alert.type, alert.severity, alert.message);
        }
      });
    }
  }

  private declareEmergency(type: string, severity: string, message: string): void {
    const emergency = {
      type,
      severity,
      timestamp: new Date()
    };

    this.activeAlerts.push(emergency);
    console.log(`🚨 ${this.name} EMERGENCY DECLARED: ${type.toUpperCase()} - ${message}`);
    
    // Simulate emergency response
    this.activateEmergencyResponse(type, severity);
  }

  private activateEmergencyResponse(type: string, severity: string): void {
    switch (type) {
      case 'storm':
        console.log(`🌪️ ${this.name} Activating storm response teams`);
        break;
      case 'flood':
        console.log(`🌊 ${this.name} Activating flood response teams`);
        break;
      case 'heat':
        console.log(`🔥 ${this.name} Activating heat emergency response`);
        break;
      case 'cold':
        console.log(`❄️ ${this.name} Activating cold emergency response`);
        break;
      default:
        console.log(`🚨 ${this.name} Activating general emergency response`);
    }
  }

  getActiveAlerts(): Array<{ type: string; severity: string; timestamp: Date }> {
    return [...this.activeAlerts];
  }

  getName(): string {
    return this.name;
  }
}

// Weather Network
class WeatherNetwork {
  private stations: Map<string, WeatherStation> = new Map();
  private observers: Observer[] = [];

  constructor() {
    console.log('🌐 Weather network initialized');
  }

  addStation(location: WeatherData['location']): WeatherStation {
    const station = new WeatherStation(location);
    this.stations.set(location.city, station);
    
    // Attach all observers to the new station
    this.observers.forEach(observer => {
      station.attach(observer);
    });
    
    console.log(`🌤️ Added weather station: ${location.city}`);
    return station;
  }

  addObserver(observer: Observer): void {
    this.observers.push(observer);
    
    // Attach to all existing stations
    this.stations.forEach(station => {
      station.attach(observer);
    });
    
    console.log(`👁️ Added observer: ${observer.constructor.name}`);
  }

  getStation(city: string): WeatherStation | undefined {
    return this.stations.get(city);
  }

  getAllStations(): WeatherStation[] {
    return Array.from(this.stations.values());
  }
}

// Demo
console.log('=== WEATHER STATION DEMO ===\n');

// Create weather network
const weatherNetwork = new WeatherNetwork();

// Create weather stations
const newYorkStation = weatherNetwork.addStation({
  city: 'New York',
  country: 'USA',
  latitude: 40.7128,
  longitude: -74.0060
});

const londonStation = weatherNetwork.addStation({
  city: 'London',
  country: 'UK',
  latitude: 51.5074,
  longitude: -0.1278
});

const tokyoStation = weatherNetwork.addStation({
  city: 'Tokyo',
  country: 'Japan',
  latitude: 35.6762,
  longitude: 139.6503
});

// Create observers
const newYorkDisplay = new WeatherDisplay('NYC Display', 'New York', {
  format: 'imperial',
  showDetails: true
});

const londonDisplay = new WeatherDisplay('London Display', 'London', {
  format: 'metric',
  showDetails: false
});

const mobileApp = new MobileApp('WeatherApp', 'user123', ['New York', 'London'], {
  temperature: true,
  rain: true,
  storms: true,
  alerts: true
});

const farmSystem = new AgricultureSystem('Green Acres Farm', 'Tokyo');

const emergencyServices = new EmergencyServices('NYC Emergency Services', 'New York');

// Add observers to network
weatherNetwork.addObserver(newYorkDisplay);
weatherNetwork.addObserver(londonDisplay);
weatherNetwork.addObserver(mobileApp);
weatherNetwork.addObserver(farmSystem);
weatherNetwork.addObserver(emergencyServices);

// Add crops to farm
farmSystem.addCrop({
  name: 'Wheat',
  optimalTemp: { min: 15, max: 25 },
  optimalHumidity: { min: 60, max: 80 },
  waterNeeds: 5
});

farmSystem.addCrop({
  name: 'Corn',
  optimalTemp: { min: 20, max: 30 },
  optimalHumidity: { min: 70, max: 90 },
  waterNeeds: 8
});

console.log('\n=== SIMULATING WEATHER UPDATES ===');

// Simulate weather updates for New York
newYorkStation.updateWeather({ temperature: 25, humidity: 70, windSpeed: 15 });
newYorkStation.updateWeather({ temperature: 28, humidity: 75, windSpeed: 20 });
newYorkStation.updateWeather({ temperature: 32, humidity: 85, windSpeed: 25 });

// Simulate weather updates for London
londonStation.updateWeather({ temperature: 18, humidity: 80, windSpeed: 30 });
londonStation.updateWeather({ temperature: 15, humidity: 90, windSpeed: 40 });
londonStation.updateWeather({ temperature: 12, humidity: 95, windSpeed: 50 });

// Simulate weather updates for Tokyo
tokyoStation.updateWeather({ temperature: 22, humidity: 65, windSpeed: 10 });
tokyoStation.updateWeather({ temperature: 20, humidity: 70, windSpeed: 15 });

// Simulate extreme weather conditions
console.log('\n=== SIMULATING EXTREME WEATHER ===');

// Extreme heat in New York
newYorkStation.updateWeather({ temperature: 38, humidity: 90, windSpeed: 5 });
newYorkStation.addAlert({
  type: 'heat',
  severity: 'high',
  message: 'Extreme heat warning - temperatures above 35°C',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
});

// Storm in London
londonStation.updateWeather({ temperature: 8, humidity: 95, windSpeed: 90, visibility: 0.5 });
londonStation.addAlert({
  type: 'storm',
  severity: 'extreme',
  message: 'Severe storm warning - high winds and heavy rain',
  expires: new Date(Date.now() + 6 * 60 * 60 * 1000)
});

// Frost in Tokyo
tokyoStation.updateWeather({ temperature: -2, humidity: 60, windSpeed: 5 });

console.log('\n=== DEMONSTRATING OBSERVER FEATURES ===');

// Show mobile app notifications
console.log('\n📱 Mobile App Notifications:');
const notifications = mobileApp.getNotifications();
notifications.forEach(notification => {
  console.log(`- ${notification.timestamp.toLocaleTimeString()}: ${notification.message}`);
});

// Show emergency services alerts
console.log('\n🚨 Emergency Services Alerts:');
const emergencyAlerts = emergencyServices.getActiveAlerts();
emergencyAlerts.forEach(alert => {
  console.log(`- ${alert.timestamp.toLocaleTimeString()}: ${alert.type} (${alert.severity})`);
});

// Show farm system status
console.log('\n🌾 Farm System Status:');
const crops = farmSystem.getCrops();
crops.forEach(crop => {
  console.log(`- ${crop.name}: Optimal temp ${crop.optimalTemp.min}-${crop.optimalTemp.max}°C, humidity ${crop.optimalHumidity.min}-${crop.optimalHumidity.max}%`);
});

console.log('\n✅ Weather station demo completed successfully');

exit(0); 