import { exit } from 'process';

// Observer interface
interface Observer {
  update(stock: Stock, price: number, change: number): void;
}

// Subject interface
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

// Stock data interface
interface StockData {
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

// Stock (Subject)
class Stock implements Subject {
  private observers: Set<Observer> = new Set();
  private data: StockData;

  constructor(symbol: string, name: string, initialPrice: number) {
    this.data = {
      symbol,
      name,
      price: initialPrice,
      previousPrice: initialPrice,
      change: 0,
      changePercent: 0,
      volume: 0,
      marketCap: 0,
      lastUpdated: new Date()
    };
  }

  attach(observer: Observer): void {
    this.observers.add(observer);
    console.log(`📈 ${observer.constructor.name} subscribed to ${this.data.symbol}`);
  }

  detach(observer: Observer): void {
    this.observers.delete(observer);
    console.log(`📉 ${observer.constructor.name} unsubscribed from ${this.data.symbol}`);
  }

  notify(): void {
    console.log(`🔔 Notifying ${this.observers.size} observers about ${this.data.symbol} price change`);
    this.observers.forEach(observer => {
      try {
        observer.update(this, this.data.price, this.data.change);
      } catch (error) {
        console.error(`❌ Error notifying ${observer.constructor.name}:`, error);
      }
    });
  }

  updatePrice(newPrice: number, volume: number = 0): void {
    this.data.previousPrice = this.data.price;
    this.data.price = newPrice;
    this.data.change = this.data.price - this.data.previousPrice;
    this.data.changePercent = (this.data.change / this.data.previousPrice) * 100;
    this.data.volume += volume;
    this.data.lastUpdated = new Date();

    console.log(`💰 ${this.data.symbol} price updated: $${this.data.previousPrice} → $${this.data.price} (${this.data.change >= 0 ? '+' : ''}${this.data.change.toFixed(2)})`);
    
    this.notify();
  }

  getData(): StockData {
    return { ...this.data };
  }

  getSymbol(): string {
    return this.data.symbol;
  }
}

// Trader (Observer)
class Trader implements Observer {
  private name: string;
  private portfolio: Map<string, { shares: number; avgPrice: number }> = new Map();
  private watchlist: Set<string> = new Set();
  private tradingStrategy: 'conservative' | 'aggressive' | 'momentum';

  constructor(name: string, strategy: 'conservative' | 'aggressive' | 'momentum' = 'conservative') {
    this.name = name;
    this.tradingStrategy = strategy;
  }

  update(stock: Stock, price: number, change: number): void {
    const symbol = stock.getSymbol();
    
    if (this.watchlist.has(symbol)) {
      console.log(`👤 ${this.name} received update for ${symbol}: $${price} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
      
      // Apply trading strategy
      this.applyTradingStrategy(stock, price, change);
    }
  }

  private applyTradingStrategy(stock: Stock, price: number, change: number): void {
    const symbol = stock.getSymbol();
    const currentPosition = this.portfolio.get(symbol);
    const changePercent = (change / (price - change)) * 100;

    switch (this.tradingStrategy) {
      case 'conservative':
        if (changePercent < -5 && !currentPosition) {
          this.buyStock(symbol, 10, price);
        } else if (changePercent > 10 && currentPosition) {
          this.sellStock(symbol, 5, price);
        }
        break;
      
      case 'aggressive':
        if (changePercent > 2 && !currentPosition) {
          this.buyStock(symbol, 20, price);
        } else if (changePercent < -2 && currentPosition) {
          this.sellStock(symbol, 10, price);
        }
        break;
      
      case 'momentum':
        if (changePercent > 5) {
          this.buyStock(symbol, 15, price);
        } else if (changePercent < -3) {
          this.sellStock(symbol, 8, price);
        }
        break;
    }
  }

  addToWatchlist(symbol: string): void {
    this.watchlist.add(symbol);
    console.log(`👀 ${this.name} added ${symbol} to watchlist`);
  }

  removeFromWatchlist(symbol: string): void {
    this.watchlist.delete(symbol);
    console.log(`🙈 ${this.name} removed ${symbol} from watchlist`);
  }

  private buyStock(symbol: string, shares: number, price: number): void {
    const currentPosition = this.portfolio.get(symbol);
    const totalCost = shares * price;
    
    if (currentPosition) {
      const newShares = currentPosition.shares + shares;
      const newAvgPrice = ((currentPosition.shares * currentPosition.avgPrice) + totalCost) / newShares;
      this.portfolio.set(symbol, { shares: newShares, avgPrice: newAvgPrice });
    } else {
      this.portfolio.set(symbol, { shares, avgPrice: price });
    }
    
    console.log(`🛒 ${this.name} bought ${shares} shares of ${symbol} at $${price}`);
  }

  private sellStock(symbol: string, shares: number, price: number): void {
    const currentPosition = this.portfolio.get(symbol);
    if (!currentPosition || currentPosition.shares < shares) {
      return;
    }

    const remainingShares = currentPosition.shares - shares;
    if (remainingShares === 0) {
      this.portfolio.delete(symbol);
    } else {
      this.portfolio.set(symbol, { shares: remainingShares, avgPrice: currentPosition.avgPrice });
    }
    
    console.log(`💰 ${this.name} sold ${shares} shares of ${symbol} at $${price}`);
  }

  getPortfolio(): Map<string, { shares: number; avgPrice: number }> {
    return new Map(this.portfolio);
  }

  getName(): string {
    return this.name;
  }
}

// Portfolio Manager (Observer)
class PortfolioManager implements Observer {
  private name: string;
  private managedPortfolios: Map<string, Map<string, number>> = new Map();
  private riskThresholds: Map<string, { min: number; max: number }> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  update(stock: Stock, price: number, change: number): void {
    const symbol = stock.getSymbol();
    const changePercent = (change / (price - change)) * 100;
    
    console.log(`📊 ${this.name} analyzing ${symbol} performance: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`);
    
    // Check risk thresholds
    this.checkRiskThresholds(symbol, price, changePercent);
    
    // Update portfolio allocations
    this.updatePortfolioAllocations(symbol, price, changePercent);
  }

  private checkRiskThresholds(symbol: string, price: number, changePercent: number): void {
    const threshold = this.riskThresholds.get(symbol);
    if (threshold) {
      if (changePercent < threshold.min) {
        console.log(`⚠️  ${this.name} ALERT: ${symbol} below minimum threshold (${threshold.min}%)`);
      } else if (changePercent > threshold.max) {
        console.log(`🚀 ${this.name} ALERT: ${symbol} above maximum threshold (${threshold.max}%)`);
      }
    }
  }

  private updatePortfolioAllocations(symbol: string, price: number, changePercent: number): void {
    this.managedPortfolios.forEach((portfolio, clientName) => {
      const currentAllocation = portfolio.get(symbol) || 0;
      
      if (changePercent > 5 && currentAllocation < 0.3) {
        // Increase allocation for strong performers
        const newAllocation = Math.min(currentAllocation + 0.05, 0.3);
        portfolio.set(symbol, newAllocation);
        console.log(`📈 ${this.name} increased ${symbol} allocation for ${clientName} to ${(newAllocation * 100).toFixed(1)}%`);
      } else if (changePercent < -5 && currentAllocation > 0.1) {
        // Decrease allocation for weak performers
        const newAllocation = Math.max(currentAllocation - 0.05, 0.1);
        portfolio.set(symbol, newAllocation);
        console.log(`📉 ${this.name} decreased ${symbol} allocation for ${clientName} to ${(newAllocation * 100).toFixed(1)}%`);
      }
    });
  }

  addClient(clientName: string, initialAllocations: Map<string, number>): void {
    this.managedPortfolios.set(clientName, new Map(initialAllocations));
    console.log(`👥 ${this.name} added client: ${clientName}`);
  }

  setRiskThreshold(symbol: string, min: number, max: number): void {
    this.riskThresholds.set(symbol, { min, max });
    console.log(`🎯 ${this.name} set risk thresholds for ${symbol}: ${min}% to ${max}%`);
  }

  getName(): string {
    return this.name;
  }
}

// Alert System (Observer)
class AlertSystem implements Observer {
  private alerts: Map<string, { price: number; type: 'above' | 'below' }[]> = new Map();
  private notificationHistory: Array<{ symbol: string; message: string; timestamp: Date }> = [];

  update(stock: Stock, price: number, change: number): void {
    const symbol = stock.getSymbol();
    const alerts = this.alerts.get(symbol) || [];
    
    alerts.forEach(alert => {
      if (alert.type === 'above' && price >= alert.price) {
        this.sendAlert(symbol, `Price reached $${price} (target: $${alert.price})`);
      } else if (alert.type === 'below' && price <= alert.price) {
        this.sendAlert(symbol, `Price dropped to $${price} (target: $${alert.price})`);
      }
    });
  }

  addPriceAlert(symbol: string, price: number, type: 'above' | 'below'): void {
    if (!this.alerts.has(symbol)) {
      this.alerts.set(symbol, []);
    }
    this.alerts.get(symbol)!.push({ price, type });
    console.log(`🔔 Alert added for ${symbol}: ${type} $${price}`);
  }

  private sendAlert(symbol: string, message: string): void {
    const alert = { symbol, message, timestamp: new Date() };
    this.notificationHistory.push(alert);
    
    console.log(`🚨 ALERT: ${symbol} - ${message}`);
    
    // In a real system, this would send emails, push notifications, etc.
    this.sendEmail(symbol, message);
    this.sendPushNotification(symbol, message);
  }

  private sendEmail(symbol: string, message: string): void {
    console.log(`📧 Email sent: ${symbol} alert - ${message}`);
  }

  private sendPushNotification(symbol: string, message: string): void {
    console.log(`📱 Push notification sent: ${symbol} alert - ${message}`);
  }

  getNotificationHistory(): Array<{ symbol: string; message: string; timestamp: Date }> {
    return [...this.notificationHistory];
  }
}

// Market Data Simulator
class MarketDataSimulator {
  private stocks: Map<string, Stock> = new Map();
  private interval: NodeJS.Timeout | null = null;

  addStock(stock: Stock): void {
    this.stocks.set(stock.getSymbol(), stock);
  }

  startSimulation(): void {
    console.log('🚀 Starting market data simulation...\n');
    
    this.interval = setInterval(() => {
      this.stocks.forEach(stock => {
        const currentPrice = stock.getData().price;
        const volatility = 0.02; // 2% volatility
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        const newPrice = Math.max(currentPrice + change, 0.01); // Minimum price $0.01
        
        stock.updatePrice(newPrice, Math.floor(Math.random() * 1000));
      });
    }, 2000); // Update every 2 seconds
  }

  stopSimulation(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️  Market simulation stopped');
    }
  }
}

// Demo
console.log('=== STOCK MARKET SYSTEM DEMO ===\n');

// Create stocks
const apple = new Stock('AAPL', 'Apple Inc.', 150.00);
const google = new Stock('GOOGL', 'Alphabet Inc.', 2800.00);
const microsoft = new Stock('MSFT', 'Microsoft Corporation', 300.00);
const tesla = new Stock('TSLA', 'Tesla Inc.', 800.00);

// Create observers
const trader1 = new Trader('Alice Johnson', 'conservative');
const trader2 = new Trader('Bob Smith', 'aggressive');
const trader3 = new Trader('Carol Davis', 'momentum');

const portfolioManager = new PortfolioManager('David Wilson');
const alertSystem = new AlertSystem();

// Set up subscriptions
console.log('=== SETTING UP SUBSCRIPTIONS ===');

trader1.addToWatchlist('AAPL');
trader1.addToWatchlist('GOOGL');
apple.attach(trader1);
google.attach(trader1);

trader2.addToWatchlist('TSLA');
trader2.addToWatchlist('MSFT');
tesla.attach(trader2);
microsoft.attach(trader2);

trader3.addToWatchlist('AAPL');
trader3.addToWatchlist('TSLA');
apple.attach(trader3);
tesla.attach(trader3);

// Portfolio manager subscribes to all stocks
apple.attach(portfolioManager);
google.attach(portfolioManager);
microsoft.attach(portfolioManager);
tesla.attach(portfolioManager);

// Alert system subscribes to all stocks
apple.attach(alertSystem);
google.attach(alertSystem);
microsoft.attach(alertSystem);
tesla.attach(alertSystem);

// Set up portfolio manager clients
portfolioManager.addClient('Retirement Fund', new Map([
  ['AAPL', 0.25],
  ['GOOGL', 0.20],
  ['MSFT', 0.30],
  ['TSLA', 0.25]
]));

portfolioManager.addClient('Growth Fund', new Map([
  ['AAPL', 0.15],
  ['GOOGL', 0.25],
  ['MSFT', 0.20],
  ['TSLA', 0.40]
]));

// Set risk thresholds
portfolioManager.setRiskThreshold('TSLA', -10, 15);
portfolioManager.setRiskThreshold('AAPL', -5, 8);

// Set up price alerts
alertSystem.addPriceAlert('AAPL', 160, 'above');
alertSystem.addPriceAlert('AAPL', 140, 'below');
alertSystem.addPriceAlert('TSLA', 900, 'above');
alertSystem.addPriceAlert('TSLA', 700, 'below');

console.log('\n=== STARTING MARKET SIMULATION ===');

// Create and start market simulator
const simulator = new MarketDataSimulator();
simulator.addStock(apple);
simulator.addStock(google);
simulator.addStock(microsoft);
simulator.addStock(tesla);

simulator.startSimulation();

// Run simulation for 30 seconds
setTimeout(() => {
  simulator.stopSimulation();
  
  console.log('\n=== SIMULATION RESULTS ===');
  
  console.log('\n📊 Trader Portfolios:');
  console.log(`${trader1.getName()}:`, trader1.getPortfolio());
  console.log(`${trader2.getName()}:`, trader2.getPortfolio());
  console.log(`${trader3.getName()}:`, trader3.getPortfolio());
  
  console.log('\n📈 Final Stock Prices:');
  console.log('AAPL:', apple.getData().price);
  console.log('GOOGL:', google.getData().price);
  console.log('MSFT:', microsoft.getData().price);
  console.log('TSLA:', tesla.getData().price);
  
  console.log('\n🚨 Alert History:');
  alertSystem.getNotificationHistory().forEach(alert => {
    console.log(`${alert.timestamp.toLocaleTimeString()}: ${alert.symbol} - ${alert.message}`);
  });
  
  console.log('\n✅ Stock market system demo completed successfully');
  
  exit(0);
}, 30000); 