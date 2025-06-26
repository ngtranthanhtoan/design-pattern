import { exit } from 'process';

// 1. Subject interface
interface InventoryService {
  getStock(sku: string): Promise<number>;
  updateStock(sku: string, quantity: number): Promise<void>;
}

// 2. Real subject - imagine this is on another server
class RemoteInventoryService implements InventoryService {
  async getStock(sku: string): Promise<number> {
    console.log('🌐 HTTP GET /api/inventory/stock', sku);
    await new Promise((r) => setTimeout(r, 300)); // simulate network latency
    return Math.floor(Math.random() * 1000);
  }
  
  async updateStock(sku: string, quantity: number): Promise<void> {
    console.log('🌐 HTTP PUT /api/inventory/stock', sku, 'quantity:', quantity);
    await new Promise((r) => setTimeout(r, 200));
    console.log('✅ Stock updated remotely');
  }
}

// 3. Remote Proxy - makes remote calls look local
class InventoryRemoteProxy implements InventoryService {
  private real = new RemoteInventoryService();
  
  async getStock(sku: string): Promise<number> {
    console.log('📞 Calling remote inventory service as if local...');
    try {
      return await this.real.getStock(sku);
    } catch (error) {
      console.error('❌ Remote call failed:', error);
      throw error;
    }
  }
  
  async updateStock(sku: string, quantity: number): Promise<void> {
    console.log('📞 Updating remote inventory as if local...');
    try {
      await this.real.updateStock(sku, quantity);
    } catch (error) {
      console.error('❌ Remote update failed:', error);
      throw error;
    }
  }
}

// 4. Demo
(async () => {
  const inventory: InventoryService = new InventoryRemoteProxy();
  
  console.log('=== REMOTE PROXY DEMO ===');
  const stock = await inventory.getStock('SKU123');
  console.log('Current stock:', stock);
  
  await inventory.updateStock('SKU123', 50);
  console.log('Stock updated successfully');
  
  exit(0);
})(); 