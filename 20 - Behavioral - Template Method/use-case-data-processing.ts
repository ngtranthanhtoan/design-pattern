/**
 * Template Method Pattern - Data Processing Pipeline Use Case
 * 
 * Demonstrates how to use Template Method to create a standardized ETL (Extract, Transform, Load)
 * pipeline where different data sources can customize specific steps while maintaining
 * the same overall data processing flow.
 */

import { exit } from "process";

// =============================================================================
// INTERFACES AND TYPES
// =============================================================================

interface DataRecord {
  id: string;
  [key: string]: any;
}

interface ProcessingResult {
  success: boolean;
  message: string;
  recordsProcessed: number;
  recordsFailed: number;
  errors?: string[];
  outputPath?: string;
}

interface DataSource {
  name: string;
  type: 'database' | 'api' | 'file' | 'stream';
  connectionString?: string;
  filePath?: string;
  apiEndpoint?: string;
}

interface ProcessingContext {
  source: DataSource;
  batchSize: number;
  outputFormat: 'json' | 'csv' | 'xml' | 'parquet';
  enableValidation: boolean;
  enableLogging: boolean;
}

// =============================================================================
// ABSTRACT CLASS - DATA PIPELINE TEMPLATE
// =============================================================================

abstract class DataPipeline {
  protected context: ProcessingContext;
  protected extractedData: DataRecord[] = [];
  protected transformedData: DataRecord[] = [];

  constructor(context: ProcessingContext) {
    this.context = context;
  }

  /**
   * Template Method: Defines the overall ETL process
   * This method orchestrates the extract-transform-load workflow
   */
  public process(): ProcessingResult {
    console.log(`🔄 Starting data processing for ${this.context.source.name}`);
    console.log(`   Source: ${this.context.source.type}`);
    console.log(`   Output Format: ${this.context.outputFormat}`);
    
    try {
      // Step 1: Initialize and validate source
      this.initialize();
      
      // Step 2: Extract data from source
      const extractResult = this.extract();
      if (!extractResult.success) {
        return extractResult;
      }
      
      // Step 3: Validate extracted data (optional hook)
      if (this.shouldValidateData()) {
        const validationResult = this.validateData();
        if (!validationResult.success) {
          return validationResult;
        }
      }
      
      // Step 4: Transform data
      const transformResult = this.transform();
      if (!transformResult.success) {
        return transformResult;
      }
      
      // Step 5: Load data to destination
      const loadResult = this.load();
      if (!loadResult.success) {
        return loadResult;
      }
      
      // Step 6: Cleanup and finalize
      this.cleanup();
      
      return {
        success: true,
        message: `✅ Data processing completed successfully for ${this.context.source.name}`,
        recordsProcessed: this.transformedData.length,
        recordsFailed: 0,
        outputPath: this.getOutputPath()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Data processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recordsProcessed: 0,
        recordsFailed: this.extractedData.length,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // =============================================================================
  // PRIMITIVE OPERATIONS - Must be implemented by subclasses
  // =============================================================================

  /**
   * Extract data from the source - must be implemented by each data source type
   */
  protected abstract extract(): ProcessingResult;

  /**
   * Transform the extracted data - must be implemented by each data source type
   */
  protected abstract transform(): ProcessingResult;

  /**
   * Load the transformed data to destination - must be implemented by each data source type
   */
  protected abstract load(): ProcessingResult;

  // =============================================================================
  // HOOK METHODS - Optional methods that subclasses can override
  // =============================================================================

  /**
   * Hook method: Should data validation be performed?
   * Default implementation returns the context setting
   */
  protected shouldValidateData(): boolean {
    return this.context.enableValidation;
  }

  /**
   * Hook method: Should transformation be applied?
   * Default implementation returns true
   */
  protected shouldTransform(): boolean {
    return true;
  }

  /**
   * Hook method: Should run before extraction
   * Default implementation does nothing
   */
  protected beforeExtract(): void {
    // Optional hook - subclasses can override
  }

  /**
   * Hook method: Should run after transformation
   * Default implementation does nothing
   */
  protected afterTransform(): void {
    // Optional hook - subclasses can override
  }

  /**
   * Hook method: Should run before loading
   * Default implementation does nothing
   */
  protected beforeLoad(): void {
    // Optional hook - subclasses can override
  }

  // =============================================================================
  // CONCRETE OPERATIONS - Common implementations shared by all subclasses
  // =============================================================================

  /**
   * Initialize the data pipeline
   */
  protected initialize(): void {
    console.log(`🔧 Initializing data pipeline for ${this.context.source.name}`);
    console.log(`   Batch Size: ${this.context.batchSize}`);
    console.log(`   Validation: ${this.context.enableValidation ? 'Enabled' : 'Disabled'}`);
    console.log(`   Logging: ${this.context.enableLogging ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Validate extracted data
   */
  protected validateData(): ProcessingResult {
    console.log(`✅ Validating extracted data for ${this.context.source.name}`);
    
    const errors: string[] = [];
    let validRecords = 0;
    
    for (const record of this.extractedData) {
      if (this.isValidRecord(record)) {
        validRecords++;
      } else {
        errors.push(`Invalid record: ${record.id}`);
      }
    }
    
    if (errors.length === 0) {
      console.log(`   ✅ All ${validRecords} records are valid`);
      return { 
        success: true, 
        message: "Data validation passed", 
        recordsProcessed: validRecords,
        recordsFailed: 0
      };
    } else {
      console.log(`   ❌ ${errors.length} records failed validation`);
      return { 
        success: false, 
        message: "Data validation failed", 
        recordsProcessed: validRecords,
        recordsFailed: errors.length,
        errors
      };
    }
  }

  /**
   * Cleanup resources
   */
  protected cleanup(): void {
    console.log(`🧹 Cleaning up resources for ${this.context.source.name}`);
    this.extractedData = [];
    this.transformedData = [];
  }

  /**
   * Get output path for processed data
   */
  protected getOutputPath(): string {
    return `./output/${this.context.source.name}_${Date.now()}.${this.context.outputFormat}`;
  }

  /**
   * Check if a record is valid
   */
  private isValidRecord(record: DataRecord): boolean {
    return Boolean(record.id && record.id.length > 0);
  }
}

// =============================================================================
// CONCRETE IMPLEMENTATIONS
// =============================================================================

/**
 * Database Data Pipeline
 */
class DatabasePipeline extends DataPipeline {
  protected extract(): ProcessingResult {
    this.beforeExtract(); // Hook method call
    
    console.log(`🗄️  Extracting data from database: ${this.context.source.name}`);
    
    // Simulate database extraction
    const extractSuccess = Math.random() > 0.05; // 95% success rate
    const recordCount = Math.floor(Math.random() * 1000) + 100; // 100-1100 records
    
    if (extractSuccess) {
      // Simulate extracted data
      for (let i = 0; i < recordCount; i++) {
        this.extractedData.push({
          id: `db_${i}`,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          created_at: new Date().toISOString(),
          source: 'database'
        });
      }
      
      console.log(`   ✅ Extracted ${recordCount} records from database`);
      return { 
        success: true, 
        message: "Database extraction completed", 
        recordsProcessed: recordCount,
        recordsFailed: 0
      };
    } else {
      console.log(`   ❌ Database extraction failed`);
      return { 
        success: false, 
        message: "Database extraction failed", 
        recordsProcessed: 0,
        recordsFailed: 0,
        errors: ["Database connection failed"]
      };
    }
  }

  protected transform(): ProcessingResult {
    console.log(`🔄 Transforming database data for ${this.context.source.name}`);
    
    if (!this.shouldTransform()) {
      this.transformedData = [...this.extractedData];
      return { 
        success: true, 
        message: "Skipped transformation", 
        recordsProcessed: this.extractedData.length,
        recordsFailed: 0
      };
    }
    
    // Simulate data transformation
    const transformSuccess = Math.random() > 0.08; // 92% success rate
    
    if (transformSuccess) {
      // Transform data (e.g., normalize, enrich, filter)
      this.transformedData = this.extractedData.map(record => ({
        ...record,
        processed_at: new Date().toISOString(),
        transformed: true,
        source_type: 'database'
      }));
      
      console.log(`   ✅ Transformed ${this.transformedData.length} records`);
      this.afterTransform(); // Hook method call
      return { 
        success: true, 
        message: "Database transformation completed", 
        recordsProcessed: this.transformedData.length,
        recordsFailed: 0
      };
    } else {
      console.log(`   ❌ Database transformation failed`);
      return { 
        success: false, 
        message: "Database transformation failed", 
        recordsProcessed: 0,
        recordsFailed: this.extractedData.length,
        errors: ["Transformation error"]
      };
    }
  }

  protected load(): ProcessingResult {
    this.beforeLoad(); // Hook method call
    
    console.log(`💾 Loading transformed data to destination: ${this.context.source.name}`);
    
    // Simulate data loading
    const loadSuccess = Math.random() > 0.1; // 90% success rate
    
    if (loadSuccess) {
      console.log(`   ✅ Loaded ${this.transformedData.length} records to destination`);
      return { 
        success: true, 
        message: "Database loading completed", 
        recordsProcessed: this.transformedData.length,
        recordsFailed: 0
      };
    } else {
      console.log(`   ❌ Database loading failed`);
      return { 
        success: false, 
        message: "Database loading failed", 
        recordsProcessed: 0,
        recordsFailed: this.transformedData.length,
        errors: ["Loading error"]
      };
    }
  }

  // Override hook methods for database pipeline
  protected override shouldValidateData(): boolean {
    return true; // Always validate database data
  }

  protected override beforeExtract(): void {
    console.log(`   🔗 Establishing database connection`);
  }

  protected override afterTransform(): void {
    console.log(`   📊 Applying database-specific transformations`);
  }

  protected override beforeLoad(): void {
    console.log(`   🗃️  Preparing database schema`);
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

function demonstrateDataPipeline(): void {
  console.log("🔄 Data Processing Pipeline Template Method Pattern Demo");
  console.log("=======================================================");
  console.log();

  // Create different data sources
  const databaseSource: DataSource = {
    name: "user-database",
    type: 'database',
    connectionString: "postgresql://localhost:5432/users"
  };

  // Create processing contexts
  const dbContext: ProcessingContext = {
    source: databaseSource,
    batchSize: 1000,
    outputFormat: 'json',
    enableValidation: true,
    enableLogging: true
  };

  // Create data pipelines
  const dbPipeline = new DatabasePipeline(dbContext);

  // Execute pipelines
  console.log("1. Processing Database Data:");
  const dbResult = dbPipeline.process();
  console.log(`   Result: ${dbResult.message}`);
  console.log(`   Records: ${dbResult.recordsProcessed} processed, ${dbResult.recordsFailed} failed`);
  console.log();
}

// =============================================================================
// DEMONSTRATION
// =============================================================================

function main(): void {
  try {
    demonstrateDataPipeline();
    
    console.log("✅ Template Method Pattern - Data Processing Pipeline demonstration completed");
  } catch (error) {
    console.error("❌ Error during demonstration:", error);
  }
}

// Run the demonstration
main();

exit(0); 