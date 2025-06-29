/**
 * Visitor Pattern - Configuration System Use Case
 * 
 * This example demonstrates how the Visitor pattern can be used in configuration
 * systems to separate different operations (validation, export, migration,
 * documentation generation) from configuration object classes.
 */

import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface ConfigVisitor {
  visitString(value: StringValue): void;
  visitNumber(value: NumberValue): void;
  visitBoolean(value: BooleanValue): void;
  visitArray(value: ArrayValue): void;
  visitObject(value: ObjectValue): void;
}

interface ConfigValue {
  accept(visitor: ConfigVisitor): void;
  getKey(): string;
  getValue(): any;
  getType(): string;
}

// ============================================================================
// CONCRETE CONFIGURATION VALUE CLASSES
// ============================================================================

class StringValue implements ConfigValue {
  constructor(
    private key: string,
    private value: string,
    private required: boolean = false,
    private pattern?: string
  ) {}

  getKey(): string {
    return this.key;
  }

  getValue(): any {
    return this.value;
  }

  getType(): string {
    return "string";
  }

  isRequired(): boolean {
    return this.required;
  }

  getPattern(): string | undefined {
    return this.pattern;
  }

  getLength(): number {
    return this.value.length;
  }

  accept(visitor: ConfigVisitor): void {
    visitor.visitString(this);
  }
}

class NumberValue implements ConfigValue {
  constructor(
    private key: string,
    private value: number,
    private required: boolean = false,
    private min?: number,
    private max?: number
  ) {}

  getKey(): string {
    return this.key;
  }

  getValue(): any {
    return this.value;
  }

  getType(): string {
    return "number";
  }

  isRequired(): boolean {
    return this.required;
  }

  getMin(): number | undefined {
    return this.min;
  }

  getMax(): number | undefined {
    return this.max;
  }

  accept(visitor: ConfigVisitor): void {
    visitor.visitNumber(this);
  }
}

class BooleanValue implements ConfigValue {
  constructor(
    private key: string,
    private value: boolean,
    private required: boolean = false
  ) {}

  getKey(): string {
    return this.key;
  }

  getValue(): any {
    return this.value;
  }

  getType(): string {
    return "boolean";
  }

  isRequired(): boolean {
    return this.required;
  }

  accept(visitor: ConfigVisitor): void {
    visitor.visitBoolean(this);
  }
}

class ArrayValue implements ConfigValue {
  constructor(
    private key: string,
    private value: any[],
    private required: boolean = false,
    private minLength?: number,
    private maxLength?: number
  ) {}

  getKey(): string {
    return this.key;
  }

  getValue(): any {
    return this.value;
  }

  getType(): string {
    return "array";
  }

  isRequired(): boolean {
    return this.required;
  }

  getMinLength(): number | undefined {
    return this.minLength;
  }

  getMaxLength(): number | undefined {
    return this.maxLength;
  }

  getLength(): number {
    return this.value.length;
  }

  accept(visitor: ConfigVisitor): void {
    visitor.visitArray(this);
  }
}

class ObjectValue implements ConfigValue {
  constructor(
    private key: string,
    private value: Record<string, any>,
    private required: boolean = false,
    private requiredFields: string[] = []
  ) {}

  getKey(): string {
    return this.key;
  }

  getValue(): any {
    return this.value;
  }

  getType(): string {
    return "object";
  }

  isRequired(): boolean {
    return this.required;
  }

  getRequiredFields(): string[] {
    return [...this.requiredFields];
  }

  getFieldCount(): number {
    return Object.keys(this.value).length;
  }

  accept(visitor: ConfigVisitor): void {
    visitor.visitObject(this);
  }
}

// ============================================================================
// CONCRETE VISITOR CLASSES
// ============================================================================

class Validator implements ConfigVisitor {
  private errors: string[] = [];
  private warnings: string[] = [];

  visitString(value: StringValue): void {
    if (value.isRequired() && value.getValue().length === 0) {
      this.errors.push(`[VALIDATION] Required string '${value.getKey()}' is empty`);
    }

    if (value.getPattern() && !new RegExp(value.getPattern()!).test(value.getValue())) {
      this.errors.push(`[VALIDATION] String '${value.getKey()}' does not match pattern '${value.getPattern()}'`);
    }

    if (value.getLength() > 1000) {
      this.warnings.push(`[VALIDATION] String '${value.getKey()}' is very long (${value.getLength()} characters)`);
    }

    console.log(`[VALIDATION] String '${value.getKey()}': "${value.getValue()}" (${value.getLength()} chars)`);
  }

  visitNumber(value: NumberValue): void {
    if (value.isRequired() && value.getValue() === undefined) {
      this.errors.push(`[VALIDATION] Required number '${value.getKey()}' is missing`);
    }

    if (value.getMin() !== undefined && value.getValue() < value.getMin()!) {
      this.errors.push(`[VALIDATION] Number '${value.getKey()}' (${value.getValue()}) is below minimum ${value.getMin()}`);
    }

    if (value.getMax() !== undefined && value.getValue() > value.getMax()!) {
      this.errors.push(`[VALIDATION] Number '${value.getKey()}' (${value.getValue()}) is above maximum ${value.getMax()}`);
    }

    console.log(`[VALIDATION] Number '${value.getKey()}': ${value.getValue()}`);
  }

  visitBoolean(value: BooleanValue): void {
    if (value.isRequired() && value.getValue() === undefined) {
      this.errors.push(`[VALIDATION] Required boolean '${value.getKey()}' is missing`);
    }

    console.log(`[VALIDATION] Boolean '${value.getKey()}': ${value.getValue()}`);
  }

  visitArray(value: ArrayValue): void {
    if (value.isRequired() && value.getLength() === 0) {
      this.errors.push(`[VALIDATION] Required array '${value.getKey()}' is empty`);
    }

    if (value.getMinLength() !== undefined && value.getLength() < value.getMinLength()!) {
      this.errors.push(`[VALIDATION] Array '${value.getKey()}' has ${value.getLength()} items, minimum is ${value.getMinLength()}`);
    }

    if (value.getMaxLength() !== undefined && value.getLength() > value.getMaxLength()!) {
      this.errors.push(`[VALIDATION] Array '${value.getKey()}' has ${value.getLength()} items, maximum is ${value.getMaxLength()}`);
    }

    console.log(`[VALIDATION] Array '${value.getKey()}': [${value.getValue().join(', ')}] (${value.getLength()} items)`);
  }

  visitObject(value: ObjectValue): void {
    if (value.isRequired() && value.getFieldCount() === 0) {
      this.errors.push(`[VALIDATION] Required object '${value.getKey()}' is empty`);
    }

    value.getRequiredFields().forEach(field => {
      if (!(field in value.getValue())) {
        this.errors.push(`[VALIDATION] Object '${value.getKey()}' is missing required field '${field}'`);
      }
    });

    console.log(`[VALIDATION] Object '${value.getKey()}': {${Object.keys(value.getValue()).join(', ')}} (${value.getFieldCount()} fields)`);
  }

  getErrors(): string[] {
    return this.errors;
  }

  getWarnings(): string[] {
    return this.warnings;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }
}

class Exporter implements ConfigVisitor {
  private output: any = {};

  visitString(value: StringValue): void {
    this.output[value.getKey()] = {
      type: value.getType(),
      value: value.getValue(),
      required: value.isRequired(),
      pattern: value.getPattern(),
      length: value.getLength()
    };
  }

  visitNumber(value: NumberValue): void {
    this.output[value.getKey()] = {
      type: value.getType(),
      value: value.getValue(),
      required: value.isRequired(),
      min: value.getMin(),
      max: value.getMax()
    };
  }

  visitBoolean(value: BooleanValue): void {
    this.output[value.getKey()] = {
      type: value.getType(),
      value: value.getValue(),
      required: value.isRequired()
    };
  }

  visitArray(value: ArrayValue): void {
    this.output[value.getKey()] = {
      type: value.getType(),
      value: value.getValue(),
      required: value.isRequired(),
      minLength: value.getMinLength(),
      maxLength: value.getMaxLength(),
      length: value.getLength()
    };
  }

  visitObject(value: ObjectValue): void {
    this.output[value.getKey()] = {
      type: value.getType(),
      value: value.getValue(),
      required: value.isRequired(),
      requiredFields: value.getRequiredFields(),
      fieldCount: value.getFieldCount()
    };
  }

  getJSON(): string {
    return JSON.stringify(this.output, null, 2);
  }
}

class Migrator implements ConfigVisitor {
  private migrations: string[] = [];

  visitString(value: StringValue): void {
    if (value.getKey() === "email" && value.getValue().includes("@olddomain.com")) {
      const newValue = value.getValue().replace("@olddomain.com", "@newdomain.com");
      this.migrations.push(`[MIGRATION] Updated email from ${value.getValue()} to ${newValue}`);
    }

    if (value.getKey() === "apiKey" && !value.getValue().startsWith("sk_")) {
      const newValue = `sk_${value.getValue()}`;
      this.migrations.push(`[MIGRATION] Added prefix to API key: ${newValue}`);
    }

    console.log(`[MIGRATION] String '${value.getKey()}': "${value.getValue()}"`);
  }

  visitNumber(value: NumberValue): void {
    if (value.getKey() === "port" && value.getValue() === 8080) {
      this.migrations.push(`[MIGRATION] Updated default port from 8080 to 3000`);
    }

    console.log(`[MIGRATION] Number '${value.getKey()}': ${value.getValue()}`);
  }

  visitBoolean(value: BooleanValue): void {
    if (value.getKey() === "legacyMode" && value.getValue() === true) {
      this.migrations.push(`[MIGRATION] Inverted legacyMode from true to false`);
    }

    console.log(`[MIGRATION] Boolean '${value.getKey()}': ${value.getValue()}`);
  }

  visitArray(value: ArrayValue): void {
    if (value.getKey() === "plugins" && value.getLength() === 0) {
      this.migrations.push(`[MIGRATION] Added default plugins to empty plugins array`);
    }

    console.log(`[MIGRATION] Array '${value.getKey()}': [${value.getValue().join(', ')}]`);
  }

  visitObject(value: ObjectValue): void {
    if (value.getKey() === "database" && !("ssl" in value.getValue())) {
      this.migrations.push(`[MIGRATION] Added missing 'ssl' field to database configuration`);
    }

    console.log(`[MIGRATION] Object '${value.getKey()}': {${Object.keys(value.getValue()).join(', ')}}`);
  }

  getMigrations(): string[] {
    return this.migrations;
  }

  getMigrationCount(): number {
    return this.migrations.length;
  }
}

class DocumentationGenerator implements ConfigVisitor {
  private documentation: string[] = [];

  visitString(value: StringValue): void {
    this.documentation.push(`## ${value.getKey()}`);
    this.documentation.push(`- **Type**: ${value.getType()}`);
    this.documentation.push(`- **Required**: ${value.isRequired() ? 'Yes' : 'No'}`);
    this.documentation.push(`- **Value**: "${value.getValue()}"`);
    if (value.getPattern()) {
      this.documentation.push(`- **Pattern**: \`${value.getPattern()}\``);
    }
    this.documentation.push(`- **Length**: ${value.getLength()} characters`);
    this.documentation.push("");
  }

  visitNumber(value: NumberValue): void {
    this.documentation.push(`## ${value.getKey()}`);
    this.documentation.push(`- **Type**: ${value.getType()}`);
    this.documentation.push(`- **Required**: ${value.isRequired() ? 'Yes' : 'No'}`);
    this.documentation.push(`- **Value**: ${value.getValue()}`);
    if (value.getMin() !== undefined) {
      this.documentation.push(`- **Minimum**: ${value.getMin()}`);
    }
    if (value.getMax() !== undefined) {
      this.documentation.push(`- **Maximum**: ${value.getMax()}`);
    }
    this.documentation.push("");
  }

  visitBoolean(value: BooleanValue): void {
    this.documentation.push(`## ${value.getKey()}`);
    this.documentation.push(`- **Type**: ${value.getType()}`);
    this.documentation.push(`- **Required**: ${value.isRequired() ? 'Yes' : 'No'}`);
    this.documentation.push(`- **Value**: ${value.getValue()}`);
    this.documentation.push("");
  }

  visitArray(value: ArrayValue): void {
    this.documentation.push(`## ${value.getKey()}`);
    this.documentation.push(`- **Type**: ${value.getType()}`);
    this.documentation.push(`- **Required**: ${value.isRequired() ? 'Yes' : 'No'}`);
    this.documentation.push(`- **Value**: [${value.getValue().join(', ')}]`);
    this.documentation.push(`- **Length**: ${value.getLength()} items`);
    if (value.getMinLength() !== undefined) {
      this.documentation.push(`- **Minimum Length**: ${value.getMinLength()}`);
    }
    if (value.getMaxLength() !== undefined) {
      this.documentation.push(`- **Maximum Length**: ${value.getMaxLength()}`);
    }
    this.documentation.push("");
  }

  visitObject(value: ObjectValue): void {
    this.documentation.push(`## ${value.getKey()}`);
    this.documentation.push(`- **Type**: ${value.getType()}`);
    this.documentation.push(`- **Required**: ${value.isRequired() ? 'Yes' : 'No'}`);
    this.documentation.push(`- **Value**: {${Object.keys(value.getValue()).join(', ')}}`);
    this.documentation.push(`- **Fields**: ${value.getFieldCount()}`);
    if (value.getRequiredFields().length > 0) {
      this.documentation.push(`- **Required Fields**: [${value.getRequiredFields().join(', ')}]`);
    }
    this.documentation.push("");
  }

  getMarkdown(): string {
    return `# Configuration Documentation\n\n${this.documentation.join('\n')}`;
  }
}

// ============================================================================
// CONFIGURATION STRUCTURE
// ============================================================================

class Configuration {
  private values: ConfigValue[] = [];

  addValue(value: ConfigValue): void {
    this.values.push(value);
  }

  accept(visitor: ConfigVisitor): void {
    this.values.forEach(value => value.accept(visitor));
  }

  getValueCount(): number {
    return this.values.length;
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

function demonstrateConfigurationSystem(): void {
  console.log("⚙️ Configuration System with Visitor Pattern");
  console.log("============================================\n");

  // Create a configuration with various value types
  const config = new Configuration();
  
  // Add string values
  config.addValue(new StringValue("appName", "MyApp", true));
  config.addValue(new StringValue("email", "admin@olddomain.com", true, "^[^@]+@[^@]+\\.[^@]+$"));
  config.addValue(new StringValue("apiKey", "abc123", true));
  
  // Add number values
  config.addValue(new NumberValue("port", 8080, true, 1, 65535));
  config.addValue(new NumberValue("timeout", 500, false, 100, 10000));
  
  // Add boolean values
  config.addValue(new BooleanValue("debug", true, false));
  config.addValue(new BooleanValue("legacyMode", true, false));
  
  // Add array values
  config.addValue(new ArrayValue("plugins", [], false, 0, 10));
  config.addValue(new ArrayValue("allowedOrigins", ["localhost", "127.0.0.1"], true, 1, 50));
  
  // Add object values
  config.addValue(new ObjectValue("database", {
    host: "localhost",
    port: 5432
  }, true, ["host", "port"]));

  console.log(`Configuration created with ${config.getValueCount()} values\n`);

  // Test 1: Validation
  console.log("1️⃣ Validation Operation:");
  console.log("------------------------");
  const validator = new Validator();
  config.accept(validator);
  
  if (validator.isValid()) {
    console.log("✅ Configuration is valid!");
  } else {
    console.log("❌ Validation errors found:");
    validator.getErrors().forEach(error => console.log(`  - ${error}`));
  }
  
  if (validator.getWarnings().length > 0) {
    console.log("⚠️  Validation warnings:");
    validator.getWarnings().forEach(warning => console.log(`  - ${warning}`));
  }
  console.log();

  // Test 2: Export
  console.log("2️⃣ Export Operation:");
  console.log("-------------------");
  const exporter = new Exporter();
  config.accept(exporter);
  
  console.log("JSON Export:");
  console.log(exporter.getJSON());
  console.log();

  // Test 3: Migration
  console.log("3️⃣ Migration Operation:");
  console.log("----------------------");
  const migrator = new Migrator();
  config.accept(migrator);
  
  console.log("Migration log:");
  migrator.getMigrations().forEach(migration => console.log(`  - ${migration}`));
  console.log(`Total migrations: ${migrator.getMigrationCount()}`);
  console.log();

  // Test 4: Documentation Generation
  console.log("4️⃣ Documentation Generation:");
  console.log("----------------------------");
  const docGenerator = new DocumentationGenerator();
  config.accept(docGenerator);
  
  console.log("Generated documentation:");
  console.log(docGenerator.getMarkdown());
  console.log();
}

if (require.main === module) {
  try {
    demonstrateConfigurationSystem();
    console.log("✅ All configuration system operations completed successfully!");
  } catch (error) {
    console.error("❌ Error during configuration system operations:", error);
    exit(1);
  }
}

export {
  ConfigVisitor,
  ConfigValue,
  StringValue,
  NumberValue,
  BooleanValue,
  ArrayValue,
  ObjectValue,
  Validator,
  Exporter,
  Migrator,
  DocumentationGenerator,
  Configuration
}; 