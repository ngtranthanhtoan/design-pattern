import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface CompressionResult {
  compressedData: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  executionTime: number;
  memoryUsage: number;
  algorithm: string;
}

interface DecompressionResult {
  decompressedData: Buffer;
  executionTime: number;
  memoryUsage: number;
  isSuccessful: boolean;
}

interface CompressionStrategy {
  compress(data: Buffer): CompressionResult;
  decompress(data: Buffer): DecompressionResult;
  getCompressionRatio(): number;
  getSpeed(): 'fast' | 'medium' | 'slow';
  getDescription(): string;
  getSupportedFormats(): string[];
  isLossless(): boolean;
}

// ============================================================================
// CONCRETE STRATEGIES
// ============================================================================

class GzipStrategy implements CompressionStrategy {
  private readonly compressionLevel = 6; // Default compression level

  compress(data: Buffer): CompressionResult {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate GZIP compression
    const compressedData = this.simulateGzipCompression(data);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      compressedData,
      originalSize: data.length,
      compressedSize: compressedData.length,
      compressionRatio: (1 - compressedData.length / data.length) * 100,
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      algorithm: 'GZIP'
    };
  }

  decompress(data: Buffer): DecompressionResult {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate GZIP decompression
    const decompressedData = this.simulateGzipDecompression(data);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      decompressedData,
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      isSuccessful: decompressedData.length > 0
    };
  }

  private simulateGzipCompression(data: Buffer): Buffer {
    // Simulate compression by removing some redundancy
    const compressed = Buffer.alloc(Math.floor(data.length * 0.7));
    for (let i = 0; i < compressed.length; i++) {
      compressed[i] = data[i % data.length];
    }
    return compressed;
  }

  private simulateGzipDecompression(data: Buffer): Buffer {
    // Simulate decompression
    const decompressed = Buffer.alloc(Math.floor(data.length * 1.4));
    for (let i = 0; i < decompressed.length; i++) {
      decompressed[i] = data[i % data.length];
    }
    return decompressed;
  }

  getCompressionRatio(): number {
    return 0.7; // 30% compression
  }

  getSpeed(): 'fast' | 'medium' | 'slow' {
    return 'medium';
  }

  getDescription(): string {
    return "GZIP - DEFLATE-based compression with good balance";
  }

  getSupportedFormats(): string[] {
    return ['.gz', '.tar.gz', '.tgz'];
  }

  isLossless(): boolean {
    return true;
  }
}

class ZipStrategy implements CompressionStrategy {
  private readonly compressionLevel = 5;

  compress(data: Buffer): CompressionResult {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate ZIP compression
    const compressedData = this.simulateZipCompression(data);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      compressedData,
      originalSize: data.length,
      compressedSize: compressedData.length,
      compressionRatio: (1 - compressedData.length / data.length) * 100,
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      algorithm: 'ZIP'
    };
  }

  decompress(data: Buffer): DecompressionResult {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate ZIP decompression
    const decompressedData = this.simulateZipDecompression(data);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      decompressedData,
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      isSuccessful: decompressedData.length > 0
    };
  }

  private simulateZipCompression(data: Buffer): Buffer {
    // Simulate ZIP compression
    const compressed = Buffer.alloc(Math.floor(data.length * 0.75));
    for (let i = 0; i < compressed.length; i++) {
      compressed[i] = data[i % data.length];
    }
    return compressed;
  }

  private simulateZipDecompression(data: Buffer): Buffer {
    // Simulate ZIP decompression
    const decompressed = Buffer.alloc(Math.floor(data.length * 1.33));
    for (let i = 0; i < decompressed.length; i++) {
      decompressed[i] = data[i % data.length];
    }
    return decompressed;
  }

  getCompressionRatio(): number {
    return 0.75; // 25% compression
  }

  getSpeed(): 'fast' | 'medium' | 'slow' {
    return 'fast';
  }

  getDescription(): string {
    return "ZIP - Popular archive format with wide compatibility";
  }

  getSupportedFormats(): string[] {
    return ['.zip', '.jar', '.war'];
  }

  isLossless(): boolean {
    return true;
  }
}

class RarStrategy implements CompressionStrategy {
  private readonly compressionLevel = 8;

  compress(data: Buffer): CompressionResult {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate RAR compression
    const compressedData = this.simulateRarCompression(data);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      compressedData,
      originalSize: data.length,
      compressedSize: compressedData.length,
      compressionRatio: (1 - compressedData.length / data.length) * 100,
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      algorithm: 'RAR'
    };
  }

  decompress(data: Buffer): DecompressionResult {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate RAR decompression
    const decompressedData = this.simulateRarDecompression(data);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      decompressedData,
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      isSuccessful: decompressedData.length > 0
    };
  }

  private simulateRarCompression(data: Buffer): Buffer {
    // Simulate RAR compression (better compression)
    const compressed = Buffer.alloc(Math.floor(data.length * 0.6));
    for (let i = 0; i < compressed.length; i++) {
      compressed[i] = data[i % data.length];
    }
    return compressed;
  }

  private simulateRarDecompression(data: Buffer): Buffer {
    // Simulate RAR decompression
    const decompressed = Buffer.alloc(Math.floor(data.length * 1.67));
    for (let i = 0; i < decompressed.length; i++) {
      decompressed[i] = data[i % data.length];
    }
    return decompressed;
  }

  getCompressionRatio(): number {
    return 0.6; // 40% compression
  }

  getSpeed(): 'fast' | 'medium' | 'slow' {
    return 'slow';
  }

  getDescription(): string {
    return "RAR - High compression ratio with proprietary format";
  }

  getSupportedFormats(): string[] {
    return ['.rar', '.r00', '.r01'];
  }

  isLossless(): boolean {
    return true;
  }
}

class LzmaStrategy implements CompressionStrategy {
  private readonly compressionLevel = 9;

  compress(data: Buffer): CompressionResult {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate LZMA compression
    const compressedData = this.simulateLzmaCompression(data);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      compressedData,
      originalSize: data.length,
      compressedSize: compressedData.length,
      compressionRatio: (1 - compressedData.length / data.length) * 100,
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      algorithm: 'LZMA'
    };
  }

  decompress(data: Buffer): DecompressionResult {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Simulate LZMA decompression
    const decompressedData = this.simulateLzmaDecompression(data);
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      decompressedData,
      executionTime: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      isSuccessful: decompressedData.length > 0
    };
  }

  private simulateLzmaCompression(data: Buffer): Buffer {
    // Simulate LZMA compression (best compression)
    const compressed = Buffer.alloc(Math.floor(data.length * 0.5));
    for (let i = 0; i < compressed.length; i++) {
      compressed[i] = data[i % data.length];
    }
    return compressed;
  }

  private simulateLzmaDecompression(data: Buffer): Buffer {
    // Simulate LZMA decompression
    const decompressed = Buffer.alloc(Math.floor(data.length * 2.0));
    for (let i = 0; i < decompressed.length; i++) {
      decompressed[i] = data[i % data.length];
    }
    return decompressed;
  }

  getCompressionRatio(): number {
    return 0.5; // 50% compression
  }

  getSpeed(): 'fast' | 'medium' | 'slow' {
    return 'slow';
  }

  getDescription(): string {
    return "LZMA - Maximum compression with Lempel-Ziv-Markov chain";
  }

  getSupportedFormats(): string[] {
    return ['.7z', '.xz', '.lzma'];
  }

  isLossless(): boolean {
    return true;
  }
}

// ============================================================================
// CONTEXT CLASS
// ============================================================================

class CompressionContext {
  private strategy: CompressionStrategy;

  constructor(strategy: CompressionStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: CompressionStrategy): void {
    this.strategy = strategy;
  }

  compress(data: Buffer): CompressionResult {
    console.log(`Compressing using: ${this.strategy.getDescription()}`);
    console.log(`Speed: ${this.strategy.getSpeed()}`);
    console.log(`Lossless: ${this.strategy.isLossless() ? "Yes" : "No"}`);
    console.log(`Supported formats: ${this.strategy.getSupportedFormats().join(', ')}`);
    console.log(`Original size: ${(data.length / 1024).toFixed(2)} KB`);
    
    const result = this.strategy.compress(data);
    
    console.log(`Compressed size: ${(result.compressedSize / 1024).toFixed(2)} KB`);
    console.log(`Compression ratio: ${result.compressionRatio.toFixed(1)}%`);
    console.log(`Execution time: ${result.executionTime.toFixed(2)}ms`);
    console.log(`Memory usage: ${(result.memoryUsage / 1024).toFixed(2)} KB`);
    console.log("---");

    return result;
  }

  decompress(data: Buffer): DecompressionResult {
    console.log(`Decompressing using: ${this.strategy.getDescription()}`);
    console.log(`Compressed size: ${(data.length / 1024).toFixed(2)} KB`);
    
    const result = this.strategy.decompress(data);
    
    console.log(`Decompressed size: ${(result.decompressedData.length / 1024).toFixed(2)} KB`);
    console.log(`Execution time: ${result.executionTime.toFixed(2)}ms`);
    console.log(`Memory usage: ${(result.memoryUsage / 1024).toFixed(2)} KB`);
    console.log(`Success: ${result.isSuccessful ? "Yes" : "No"}`);
    console.log("---");

    return result;
  }

  getCurrentStrategy(): CompressionStrategy {
    return this.strategy;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

function demonstrateCompressionStrategies(): void {
  console.log("=== COMPRESSION SYSTEM STRATEGY DEMO ===\n");

  // Generate test data
  const generateTestData = (size: number): Buffer => {
    const data = Buffer.alloc(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }
    return data;
  };

  const testSizes = [1024, 10240, 102400]; // 1KB, 10KB, 100KB
  
  testSizes.forEach(size => {
    console.log(`\n📊 Testing with ${(size / 1024).toFixed(0)}KB data:`);
    const testData = generateTestData(size);
    
    const strategies = [
      new GzipStrategy(),
      new ZipStrategy(),
      new RarStrategy(),
      new LzmaStrategy()
    ];

    const results: Array<{ strategy: string; result: CompressionResult }> = [];

    strategies.forEach(strategy => {
      const context = new CompressionContext(strategy);
      const result = context.compress(testData);
      results.push({ strategy: strategy.getDescription(), result });
    });

    // Compare results
    console.log(`\n🏆 Compression Comparison for ${(size / 1024).toFixed(0)}KB data:`);
    console.log("Algorithm\t\t\tRatio\t\tTime (ms)\tMemory (KB)\tSize (KB)");
    console.log("---------\t\t\t-----\t\t---------\t----------\t--------");
    
    results.forEach(({ strategy, result }) => {
      const shortName = strategy.split(' - ')[0];
      console.log(`${shortName.padEnd(20)}\t${result.compressionRatio.toFixed(1)}%\t\t${result.executionTime.toFixed(2)}\t\t${(result.memoryUsage / 1024).toFixed(2)}\t\t${(result.compressedSize / 1024).toFixed(2)}`);
    });
  });
}

function demonstrateStrategySelection(): void {
  console.log("=== DYNAMIC STRATEGY SELECTION ===\n");

  const context = new CompressionContext(new GzipStrategy());

  const scenarios = [
    {
      name: "Web assets (images, CSS, JS)",
      data: Buffer.alloc(50000), // 50KB
      recommendedStrategy: "GZIP",
      reason: "Good balance of compression and speed for web delivery"
    },
    {
      name: "Archive files (documents, backups)",
      data: Buffer.alloc(100000), // 100KB
      recommendedStrategy: "ZIP",
      reason: "Wide compatibility and fast compression"
    },
    {
      name: "Large backups (databases, media)",
      data: Buffer.alloc(500000), // 500KB
      recommendedStrategy: "RAR",
      reason: "High compression ratio for large files"
    },
    {
      name: "Long-term storage (archives)",
      data: Buffer.alloc(1000000), // 1MB
      recommendedStrategy: "LZMA",
      reason: "Maximum compression for storage efficiency"
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`Scenario ${index + 1}: ${scenario.name}`);
    console.log(`Recommended: ${scenario.recommendedStrategy} - ${scenario.reason}`);
    
    // Select strategy based on scenario
    let selectedStrategy: CompressionStrategy;
    switch (scenario.recommendedStrategy) {
      case "GZIP":
        selectedStrategy = new GzipStrategy();
        break;
      case "ZIP":
        selectedStrategy = new ZipStrategy();
        break;
      case "RAR":
        selectedStrategy = new RarStrategy();
        break;
      case "LZMA":
        selectedStrategy = new LzmaStrategy();
        break;
      default:
        selectedStrategy = new GzipStrategy();
    }

    context.setStrategy(selectedStrategy);
    const result = context.compress(scenario.data);
    
    console.log(`✅ Compressed ${(scenario.data.length / 1024).toFixed(0)}KB to ${(result.compressedSize / 1024).toFixed(2)}KB (${result.compressionRatio.toFixed(1)}% reduction)\n`);
  });
}

function demonstrateCompressionDecompression(): void {
  console.log("=== COMPRESSION/DECOMPRESSION CYCLE ===\n");

  const testData = Buffer.from("This is a test string that will be compressed and then decompressed to verify data integrity. It contains repeated patterns and common words that should compress well.");
  
  const strategies = [
    new GzipStrategy(),
    new ZipStrategy(),
    new RarStrategy(),
    new LzmaStrategy()
  ];

  strategies.forEach((strategy, index) => {
    console.log(`Test ${index + 1}: ${strategy.getDescription()}`);
    
    const context = new CompressionContext(strategy);
    
    // Compress
    const compressionResult = context.compress(testData);
    
    // Decompress
    const decompressionResult = context.decompress(compressionResult.compressedData);
    
    // Verify integrity
    const isIntact = testData.equals(decompressionResult.decompressedData);
    console.log(`Data integrity: ${isIntact ? "✅ PRESERVED" : "❌ CORRUPTED"}`);
    console.log("");
  });
}

// ============================================================================
// TESTING FUNCTIONS
// ============================================================================

function testCompressionStrategies(): void {
  console.log("=== COMPRESSION STRATEGY TESTS ===\n");

  const testCases = [
    {
      name: "Empty data",
      data: Buffer.alloc(0),
      expectedCompressionRatio: 0
    },
    {
      name: "Small data",
      data: Buffer.from("Hello World"),
      expectedCompressionRatio: 10
    },
    {
      name: "Repeated data",
      data: Buffer.from("AAAAA".repeat(100)),
      expectedCompressionRatio: 50
    },
    {
      name: "Random data",
      data: Buffer.alloc(1000),
      expectedCompressionRatio: 20
    }
  ];

  const strategies = [
    new GzipStrategy(),
    new ZipStrategy(),
    new RarStrategy(),
    new LzmaStrategy()
  ];

  testCases.forEach((testCase, testIndex) => {
    console.log(`Test ${testIndex + 1}: ${testCase.name}`);
    
    strategies.forEach((strategy, strategyIndex) => {
      const result = strategy.compress(testCase.data);
      const isReasonable = result.compressionRatio >= testCase.expectedCompressionRatio;
      
      console.log(`  Strategy ${strategyIndex + 1} (${strategy.getDescription().split(' - ')[0]}): ${isReasonable ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`    Compression ratio: ${result.compressionRatio.toFixed(1)}%`);
    });
    console.log("");
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main(): void {
  try {
    demonstrateCompressionStrategies();
    demonstrateStrategySelection();
    demonstrateCompressionDecompression();
    testCompressionStrategies();
    
    console.log("=== COMPRESSION SYSTEM STRATEGY PATTERN COMPLETED ===");
  } catch (error) {
    console.error("Error in compression demo:", error);
  }
}

// Run the demonstration
main();

exit(0); 