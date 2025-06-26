import { exit } from 'process';

interface WeatherService {
  getWeather(city: string): Promise<string>;
}

class RealWeatherService implements WeatherService {
  async getWeather(city: string): Promise<string> {
    console.log('🌦️ Calling real API for', city);
    await new Promise((r) => setTimeout(r, 150));
    return 'Sunny';
  }
}

class RateLimiterProxy implements WeatherService {
  private calls = 0;
  private windowStart = Date.now();
  constructor(private real: WeatherService, private maxPerMinute: number) {}
  private resetWindow() {
    const now = Date.now();
    if (now - this.windowStart >= 60_000) {
      this.calls = 0;
      this.windowStart = now;
    }
  }
  async getWeather(city: string): Promise<string> {
    this.resetWindow();
    if (this.calls >= this.maxPerMinute) {
      throw new Error('Rate limit exceeded');
    }
    this.calls++;
    return this.real.getWeather(city);
  }
}

// Demo simulate 3 calls with limit 2
(async () => {
  const svc: WeatherService = new RateLimiterProxy(new RealWeatherService(), 2);
  try {
    console.log(await svc.getWeather('Hanoi'));
    console.log(await svc.getWeather('Hanoi'));
    console.log(await svc.getWeather('Hanoi'));
  } catch (e) {
    console.error('❌', (e as Error).message);
  }
  exit(0);
})(); 