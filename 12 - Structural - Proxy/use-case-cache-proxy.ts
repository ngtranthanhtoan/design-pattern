import { exit } from 'process';

// 1. Subject interface
interface PricingService {
  getPrice(sku: string): Promise<number>;
}

// 2. Real subject – imagine slow API call
class RealPricingService implements PricingService {
  async getPrice(sku: string): Promise<number> {
    console.log('⌛ Fetching price from remote API for', sku);
    await new Promise((r) => setTimeout(r, 300)); // simulate latency
    return Number((Math.random() * 100).toFixed(2));
  }
}

// 3. Caching Proxy
class CachingProxy implements PricingService {
  private cache = new Map<string, number>();
  constructor(private real: PricingService) {}
  async getPrice(sku: string): Promise<number> {
    if (this.cache.has(sku)) {
      console.log('⚡ Returning cached price for', sku);
      return this.cache.get(sku)!;
    }
    const price = await this.real.getPrice(sku);
    this.cache.set(sku, price);
    return price;
  }
}

// 4. Demo
(async () => {
  const service: PricingService = new CachingProxy(new RealPricingService());
  console.log('Price 1st call:', await service.getPrice('SKU123'));
  console.log('Price 2nd call:', await service.getPrice('SKU123'));
  console.log('Price other SKU:', await service.getPrice('SKU999'));
  exit(0);
})(); 