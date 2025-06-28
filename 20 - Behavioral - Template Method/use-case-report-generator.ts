/**
 * Template Method Pattern - Report Generator Use Case
 * 
 * Demonstrates how to use Template Method to create a standardized report generation
 * process where different report types can customize specific steps while maintaining
 * the same overall report creation flow.
 */

import { exit } from "process";

// =============================================================================
// INTERFACES AND TYPES
// =============================================================================

interface ReportData {
  id: string;
  title: string;
  content: any;
  metadata: {
    created_at: string;
    author: string;
    version: string;
  };
}

interface ReportConfig {
  name: string;
  dataSource: 'database' | 'api' | 'file' | 'manual';
  outputFormat: 'pdf' | 'html' | 'csv' | 'json' | 'xml';
  includeCharts: boolean;
  enableValidation: boolean;
  template: string;
}

interface ReportResult {
  success: boolean;
  message: string;
  reportPath: string;
  dataPoints: number;
  fileSize: number;
  errors?: string[];
}

interface DataPoint {
  id: string;
  value: number;
  label: string;
  category: string;
  timestamp: string;
}

// =============================================================================
// ABSTRACT CLASS - REPORT GENERATOR TEMPLATE
// =============================================================================

abstract class ReportGenerator {
  protected config: ReportConfig;
  protected rawData: any[] = [];
  protected processedData: DataPoint[] = [];
  protected reportData: ReportData | null = null;

  constructor(config: ReportConfig) {
    this.config = config;
  }

  /**
   * Template Method: Defines the overall report generation process
   * This method orchestrates the fetch → process → format → output workflow
   */
  public generateReport(): ReportResult {
    console.log(`📊 Starting report generation for ${this.config.name}`);
    console.log(`   Data Source: ${this.config.dataSource}`);
    console.log(`   Output Format: ${this.config.outputFormat}`);
    console.log(`   Template: ${this.config.template}`);
    
    try {
      // Step 1: Initialize report generator
      this.initialize();
      
      // Step 2: Fetch data from source
      const fetchResult = this.fetchData();
      if (!fetchResult.success) {
        return fetchResult;
      }
      
      // Step 3: Validate data (optional hook)
      if (this.shouldValidateData()) {
        const validationResult = this.validateData();
        if (!validationResult.success) {
          return validationResult;
        }
      }
      
      // Step 4: Process and transform data
      const processResult = this.processData();
      if (!processResult.success) {
        return processResult;
      }
      
      // Step 5: Format report
      const formatResult = this.formatReport();
      if (!formatResult.success) {
        return formatResult;
      }
      
      // Step 6: Generate output
      const outputResult = this.generateOutput();
      if (!outputResult.success) {
        return outputResult;
      }
      
      // Step 7: Finalize and cleanup
      this.finalize();
      
      return {
        success: true,
        message: `✅ Report generated successfully for ${this.config.name}`,
        reportPath: this.getReportPath(),
        dataPoints: this.processedData.length,
        fileSize: this.calculateFileSize()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // =============================================================================
  // PRIMITIVE OPERATIONS - Must be implemented by subclasses
  // =============================================================================

  /**
   * Fetch data from source - must be implemented by each report type
   */
  protected abstract fetchData(): ReportResult;

  /**
   * Process and transform data - must be implemented by each report type
   */
  protected abstract processData(): ReportResult;

  /**
   * Format the report - must be implemented by each report type
   */
  protected abstract formatReport(): ReportResult;

  /**
   * Generate the final output - must be implemented by each report type
   */
  protected abstract generateOutput(): ReportResult;

  // =============================================================================
  // HOOK METHODS - Optional methods that subclasses can override
  // =============================================================================

  /**
   * Hook method: Should data validation be performed?
   * Default implementation returns the config setting
   */
  protected shouldValidateData(): boolean {
    return this.config.enableValidation;
  }

  /**
   * Hook method: Should charts be included?
   * Default implementation returns the config setting
   */
  protected shouldIncludeCharts(): boolean {
    return this.config.includeCharts;
  }

  /**
   * Hook method: Should run before data fetching
   * Default implementation does nothing
   */
  protected beforeFetch(): void {
    // Optional hook - subclasses can override
  }

  /**
   * Hook method: Should run after data processing
   * Default implementation does nothing
   */
  protected afterProcess(): void {
    // Optional hook - subclasses can override
  }

  /**
   * Hook method: Should run before output generation
   * Default implementation does nothing
   */
  protected beforeOutput(): void {
    // Optional hook - subclasses can override
  }

  // =============================================================================
  // CONCRETE OPERATIONS - Common implementations shared by all subclasses
  // =============================================================================

  /**
   * Initialize the report generator
   */
  protected initialize(): void {
    console.log(`🔧 Initializing report generator for ${this.config.name}`);
    console.log(`   Charts: ${this.config.includeCharts ? 'Enabled' : 'Disabled'}`);
    console.log(`   Validation: ${this.config.enableValidation ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Validate fetched data
   */
  protected validateData(): ReportResult {
    console.log(`✅ Validating data for ${this.config.name}`);
    
    const errors: string[] = [];
    let validRecords = 0;
    
    for (const record of this.rawData) {
      if (this.isValidRecord(record)) {
        validRecords++;
      } else {
        errors.push(`Invalid record: ${record.id || 'unknown'}`);
      }
    }
    
    if (errors.length === 0) {
      console.log(`   ✅ All ${validRecords} records are valid`);
      return { 
        success: true, 
        message: "Data validation passed", 
        reportPath: '',
        dataPoints: validRecords,
        fileSize: 0
      };
    } else {
      console.log(`   ❌ ${errors.length} records failed validation`);
      return { 
        success: false, 
        message: "Data validation failed", 
        reportPath: '',
        dataPoints: validRecords,
        fileSize: 0,
        errors
      };
    }
  }

  /**
   * Finalize the report generation
   */
  protected finalize(): void {
    console.log(`🏁 Finalizing report for ${this.config.name}`);
    this.reportData = null;
  }

  /**
   * Get the report output path
   */
  protected getReportPath(): string {
    return `./reports/${this.config.name}_${Date.now()}.${this.config.outputFormat}`;
  }

  /**
   * Calculate the file size
   */
  protected calculateFileSize(): number {
    return Math.floor(Math.random() * 1000000) + 10000; // 10KB - 1MB
  }

  /**
   * Check if a record is valid
   */
  private isValidRecord(record: any): boolean {
    return record && record.id && record.value !== undefined;
  }
}

// =============================================================================
// CONCRETE IMPLEMENTATIONS
// =============================================================================

/**
 * Sales Report Generator
 */
class SalesReportGenerator extends ReportGenerator {
  protected fetchData(): ReportResult {
    this.beforeFetch(); // Hook method call
    
    console.log(`📈 Fetching sales data for ${this.config.name}`);
    
    // Simulate sales data fetching
    const fetchSuccess = Math.random() > 0.08; // 92% success rate
    const recordCount = Math.floor(Math.random() * 1000) + 100; // 100-1100 records
    
    if (fetchSuccess) {
      // Simulate sales data
      for (let i = 0; i < recordCount; i++) {
        this.rawData.push({
          id: `sale_${i}`,
          value: Math.random() * 10000,
          label: `Sale ${i}`,
          category: `Category ${i % 5}`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          product: `Product ${i % 20}`,
          region: `Region ${i % 4}`
        });
      }
      
      console.log(`   ✅ Fetched ${recordCount} sales records`);
      return { 
        success: true, 
        message: "Sales data fetch completed", 
        reportPath: '',
        dataPoints: recordCount,
        fileSize: 0
      };
    } else {
      console.log(`   ❌ Sales data fetch failed`);
      return { 
        success: false, 
        message: "Sales data fetch failed", 
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: ["Database connection failed"]
      };
    }
  }

  protected processData(): ReportResult {
    console.log(`🔄 Processing sales data for ${this.config.name}`);
    
    // Simulate sales data processing
    const processSuccess = Math.random() > 0.06; // 94% success rate
    
    if (processSuccess) {
      // Transform raw data into DataPoint format
      this.processedData = this.rawData.map(record => ({
        id: record.id,
        value: record.value,
        label: record.label,
        category: record.category,
        timestamp: record.timestamp
      }));
      
      // Calculate additional metrics
      const totalSales = this.processedData.reduce((sum, point) => sum + point.value, 0);
      const avgSale = totalSales / this.processedData.length;
      
      console.log(`   ✅ Processed ${this.processedData.length} data points`);
      console.log(`   📊 Total Sales: $${totalSales.toFixed(2)}`);
      console.log(`   📊 Average Sale: $${avgSale.toFixed(2)}`);
      
      this.afterProcess(); // Hook method call
      return { 
        success: true, 
        message: "Sales data processing completed", 
        reportPath: '',
        dataPoints: this.processedData.length,
        fileSize: 0
      };
    } else {
      console.log(`   ❌ Sales data processing failed`);
      return { 
        success: false, 
        message: "Sales data processing failed", 
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: ["Processing error"]
      };
    }
  }

  protected formatReport(): ReportResult {
    console.log(`📋 Formatting sales report for ${this.config.name}`);
    
    // Simulate report formatting
    const formatSuccess = Math.random() > 0.05; // 95% success rate
    
    if (formatSuccess) {
      this.reportData = {
        id: `sales_report_${Date.now()}`,
        title: `Sales Report - ${this.config.name}`,
        content: {
          summary: {
            totalSales: this.processedData.reduce((sum, point) => sum + point.value, 0),
            totalTransactions: this.processedData.length,
            averageSale: this.processedData.reduce((sum, point) => sum + point.value, 0) / this.processedData.length
          },
          dataPoints: this.processedData,
          charts: this.shouldIncludeCharts() ? this.generateCharts() : null
        },
        metadata: {
          created_at: new Date().toISOString(),
          author: "Sales Report Generator",
          version: "1.0"
        }
      };
      
      console.log(`   ✅ Report formatted successfully`);
      return { 
        success: true, 
        message: "Sales report formatting completed", 
        reportPath: '',
        dataPoints: this.processedData.length,
        fileSize: 0
      };
    } else {
      console.log(`   ❌ Sales report formatting failed`);
      return { 
        success: false, 
        message: "Sales report formatting failed", 
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: ["Formatting error"]
      };
    }
  }

  protected generateOutput(): ReportResult {
    this.beforeOutput(); // Hook method call
    
    console.log(`💾 Generating sales report output for ${this.config.name}`);
    
    // Simulate output generation
    const outputSuccess = Math.random() > 0.04; // 96% success rate
    
    if (outputSuccess) {
      console.log(`   ✅ Sales report output generated successfully`);
      console.log(`   📄 Format: ${this.config.outputFormat.toUpperCase()}`);
      console.log(`   📊 Data Points: ${this.processedData.length}`);
      
      return { 
        success: true, 
        message: "Sales report output generation completed", 
        reportPath: this.getReportPath(),
        dataPoints: this.processedData.length,
        fileSize: this.calculateFileSize()
      };
    } else {
      console.log(`   ❌ Sales report output generation failed`);
      return { 
        success: false, 
        message: "Sales report output generation failed", 
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: ["Output generation error"]
      };
    }
  }

  // Override hook methods for sales reports
  protected override shouldValidateData(): boolean {
    return true; // Always validate sales data
  }

  protected override shouldIncludeCharts(): boolean {
    return this.config.includeCharts && this.processedData.length > 10;
  }

  protected override beforeFetch(): void {
    console.log(`   🔗 Connecting to sales database`);
  }

  protected override afterProcess(): void {
    console.log(`   📈 Calculating sales metrics and trends`);
  }

  protected override beforeOutput(): void {
    console.log(`   🎨 Applying sales report styling`);
  }

  private generateCharts(): any {
    return {
      salesTrend: "chart_data_here",
      categoryBreakdown: "chart_data_here",
      regionalAnalysis: "chart_data_here"
    };
  }
}

/**
 * Financial Report Generator
 */
class FinancialReportGenerator extends ReportGenerator {
  protected fetchData(): ReportResult {
    this.beforeFetch(); // Hook method call
    
    console.log(`💰 Fetching financial data for ${this.config.name}`);
    
    // Simulate financial data fetching
    const fetchSuccess = Math.random() > 0.1; // 90% success rate
    const recordCount = Math.floor(Math.random() * 500) + 50; // 50-550 records
    
    if (fetchSuccess) {
      // Simulate financial data
      for (let i = 0; i < recordCount; i++) {
        this.rawData.push({
          id: `financial_${i}`,
          value: Math.random() * 100000,
          label: `Transaction ${i}`,
          category: `Account ${i % 10}`,
          timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          type: i % 2 === 0 ? 'income' : 'expense',
          department: `Dept ${i % 6}`
        });
      }
      
      console.log(`   ✅ Fetched ${recordCount} financial records`);
      return { 
        success: true, 
        message: "Financial data fetch completed", 
        reportPath: '',
        dataPoints: recordCount,
        fileSize: 0
      };
    } else {
      console.log(`   ❌ Financial data fetch failed`);
      return { 
        success: false, 
        message: "Financial data fetch failed", 
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: ["API connection failed"]
      };
    }
  }

  protected processData(): ReportResult {
    console.log(`🔄 Processing financial data for ${this.config.name}`);
    
    // Simulate financial data processing
    const processSuccess = Math.random() > 0.08; // 92% success rate
    
    if (processSuccess) {
      // Transform raw data into DataPoint format
      this.processedData = this.rawData.map(record => ({
        id: record.id,
        value: record.value,
        label: record.label,
        category: record.category,
        timestamp: record.timestamp
      }));
      
      // Calculate financial metrics
      const totalIncome = this.rawData
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.value, 0);
      const totalExpenses = this.rawData
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.value, 0);
      const netProfit = totalIncome - totalExpenses;
      
      console.log(`   ✅ Processed ${this.processedData.length} data points`);
      console.log(`   💰 Total Income: $${totalIncome.toFixed(2)}`);
      console.log(`   💸 Total Expenses: $${totalExpenses.toFixed(2)}`);
      console.log(`   📈 Net Profit: $${netProfit.toFixed(2)}`);
      
      this.afterProcess(); // Hook method call
      return { 
        success: true, 
        message: "Financial data processing completed", 
        reportPath: '',
        dataPoints: this.processedData.length,
        fileSize: 0
      };
    } else {
      console.log(`   ❌ Financial data processing failed`);
      return { 
        success: false, 
        message: "Financial data processing failed", 
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: ["Processing error"]
      };
    }
  }

  protected formatReport(): ReportResult {
    console.log(`📋 Formatting financial report for ${this.config.name}`);
    
    // Simulate report formatting
    const formatSuccess = Math.random() > 0.06; // 94% success rate
    
    if (formatSuccess) {
      this.reportData = {
        id: `financial_report_${Date.now()}`,
        title: `Financial Report - ${this.config.name}`,
        content: {
          summary: {
            totalIncome: this.rawData.filter(r => r.type === 'income').reduce((sum, r) => sum + r.value, 0),
            totalExpenses: this.rawData.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.value, 0),
            netProfit: this.rawData.filter(r => r.type === 'income').reduce((sum, r) => sum + r.value, 0) - 
                      this.rawData.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.value, 0)
          },
          dataPoints: this.processedData,
          charts: this.shouldIncludeCharts() ? this.generateCharts() : null
        },
        metadata: {
          created_at: new Date().toISOString(),
          author: "Financial Report Generator",
          version: "1.0"
        }
      };
      
      console.log(`   ✅ Report formatted successfully`);
      return { 
        success: true, 
        message: "Financial report formatting completed", 
        reportPath: '',
        dataPoints: this.processedData.length,
        fileSize: 0
      };
    } else {
      console.log(`   ❌ Financial report formatting failed`);
      return { 
        success: false, 
        message: "Financial report formatting failed", 
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: ["Formatting error"]
      };
    }
  }

  protected generateOutput(): ReportResult {
    this.beforeOutput(); // Hook method call
    
    console.log(`💾 Generating financial report output for ${this.config.name}`);
    
    // Simulate output generation
    const outputSuccess = Math.random() > 0.05; // 95% success rate
    
    if (outputSuccess) {
      console.log(`   ✅ Financial report output generated successfully`);
      console.log(`   📄 Format: ${this.config.outputFormat.toUpperCase()}`);
      console.log(`   📊 Data Points: ${this.processedData.length}`);
      
      return { 
        success: true, 
        message: "Financial report output generation completed", 
        reportPath: this.getReportPath(),
        dataPoints: this.processedData.length,
        fileSize: this.calculateFileSize()
      };
    } else {
      console.log(`   ❌ Financial report output generation failed`);
      return { 
        success: false, 
        message: "Financial report output generation failed", 
        reportPath: '',
        dataPoints: 0,
        fileSize: 0,
        errors: ["Output generation error"]
      };
    }
  }

  // Override hook methods for financial reports
  protected override shouldValidateData(): boolean {
    return true; // Always validate financial data
  }

  protected override shouldIncludeCharts(): boolean {
    return this.config.includeCharts && this.processedData.length > 5;
  }

  protected override beforeFetch(): void {
    console.log(`   🔐 Authenticating with financial API`);
  }

  protected override afterProcess(): void {
    console.log(`   📊 Calculating financial ratios and metrics`);
  }

  protected override beforeOutput(): void {
    console.log(`   🎨 Applying financial report styling with compliance formatting`);
  }

  private generateCharts(): any {
    return {
      cashFlow: "chart_data_here",
      profitLoss: "chart_data_here",
      balanceSheet: "chart_data_here"
    };
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

function demonstrateReportGenerator(): void {
  console.log("📊 Report Generator Template Method Pattern Demo");
  console.log("===============================================");
  console.log();

  // Create different report configurations
  const salesConfig: ReportConfig = {
    name: "Q4 Sales Report",
    dataSource: 'database',
    outputFormat: 'pdf',
    includeCharts: true,
    enableValidation: true,
    template: 'sales_template'
  };

  const financialConfig: ReportConfig = {
    name: "Annual Financial Report",
    dataSource: 'api',
    outputFormat: 'html',
    includeCharts: true,
    enableValidation: true,
    template: 'financial_template'
  };

  // Create report generators
  const salesGenerator = new SalesReportGenerator(salesConfig);
  const financialGenerator = new FinancialReportGenerator(financialConfig);

  // Generate reports
  console.log("1. Generating Sales Report:");
  const salesResult = salesGenerator.generateReport();
  console.log(`   Result: ${salesResult.message}`);
  console.log(`   Path: ${salesResult.reportPath}`);
  console.log(`   Data Points: ${salesResult.dataPoints}, Size: ${salesResult.fileSize} bytes`);
  console.log();

  console.log("2. Generating Financial Report:");
  const financialResult = financialGenerator.generateReport();
  console.log(`   Result: ${financialResult.message}`);
  console.log(`   Path: ${financialResult.reportPath}`);
  console.log(`   Data Points: ${financialResult.dataPoints}, Size: ${financialResult.fileSize} bytes`);
  console.log();
}

function testReportGenerator(): void {
  console.log("🧪 Testing Report Generator Edge Cases");
  console.log("=====================================");
  console.log();

  // Test with different configurations
  const testConfigs: ReportConfig[] = [
    {
      name: "Test Sales Report",
      dataSource: 'file',
      outputFormat: 'csv',
      includeCharts: false,
      enableValidation: false,
      template: 'test_template'
    },
    {
      name: "Test Financial Report",
      dataSource: 'manual',
      outputFormat: 'json',
      includeCharts: true,
      enableValidation: true,
      template: 'test_template'
    }
  ];

  testConfigs.forEach((config, index) => {
    console.log(`Test ${index + 1}: ${config.name}`);
    
    const generator = config.name.includes('Sales') 
      ? new SalesReportGenerator(config)
      : new FinancialReportGenerator(config);
    
    const result = generator.generateReport();
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    console.log(`   Data Points: ${result.dataPoints}, Size: ${result.fileSize} bytes`);
    if (result.errors) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
    console.log();
  });
}

// =============================================================================
// DEMONSTRATION
// =============================================================================

function main(): void {
  try {
    demonstrateReportGenerator();
    testReportGenerator();
    
    console.log("✅ Template Method Pattern - Report Generator demonstration completed");
  } catch (error) {
    console.error("❌ Error during demonstration:", error);
  }
}

// Run the demonstration
main();

exit(0); 