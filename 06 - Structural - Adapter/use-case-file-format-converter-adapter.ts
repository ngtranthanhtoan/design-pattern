// ============================================================================
// FILE FORMAT CONVERTER ADAPTER - Unified DataSerializer Interface
// ============================================================================

import { exit } from 'process';

// Simple third-party libs placeholders
function jsonToCsv(json: any[]): string {
  if (json.length === 0) return '';
  const keys = Object.keys(json[0]);
  const lines = json.map(obj => keys.map(k => obj[k]).join(','));
  return [keys.join(','), ...lines].join('\n');
}

function csvToJson(csv: string): any[] {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const keys = headerLine.split(',');
  return rows.map(row => {
    const values = row.split(',');
    return keys.reduce((acc, key, idx) => {
      acc[key] = values[idx];
      return acc;
    }, {} as any);
  });
}

function jsonToXml(obj: any): string {
  return `<root>${Object.entries(obj).map(([k,v]) => `<${k}>${v}</${k}>`).join('')}</root>`;
}

function xmlToJson(xml: string): any {
  const matches = Array.from(xml.matchAll(/<([^>]+)>([^<]*)<\/\1>/g));
  const result: any = {};
  for (const [, key, value] of matches) {
    result[key] = value;
  }
  return result;
}

// -----------------------------------------------------------------------------
// 1. Target Interface
// -----------------------------------------------------------------------------

interface DataSerializer {
  serialize(data: any): string;
  deserialize(content: string): any;
  getFileExtension(): string;
}

// -----------------------------------------------------------------------------
// 2. Adaptee Stubs for each format
// -----------------------------------------------------------------------------

class JsonLibrary {
  stringify(obj: any): string { return JSON.stringify(obj, null, 2); }
  parse(text: string): any { return JSON.parse(text); }
}

class XmlLibrary {
  toXml(obj: any): string { return jsonToXml(obj); }
  fromXml(xml: string): any { return xmlToJson(xml); }
}

class CsvLibrary {
  toCsv(arr: any[]): string { return jsonToCsv(arr); }
  fromCsv(csv: string): any[] { return csvToJson(csv); }
}

// -----------------------------------------------------------------------------
// 3. Adapters
// -----------------------------------------------------------------------------

class JsonAdapter implements DataSerializer {
  private lib = new JsonLibrary();
  serialize(data: any): string { return this.lib.stringify(data); }
  deserialize(content: string): any { return this.lib.parse(content); }
  getFileExtension(): string { return 'json'; }
}

class XmlAdapter implements DataSerializer {
  private lib = new XmlLibrary();
  serialize(data: any): string { return this.lib.toXml(data); }
  deserialize(content: string): any { return this.lib.fromXml(content); }
  getFileExtension(): string { return 'xml'; }
}

class CsvAdapter implements DataSerializer {
  private lib = new CsvLibrary();
  serialize(data: any): string {
    if (!Array.isArray(data)) throw new Error('CSV serializer expects array data');
    return this.lib.toCsv(data);
  }
  deserialize(content: string): any { return this.lib.fromCsv(content); }
  getFileExtension(): string { return 'csv'; }
}

// -----------------------------------------------------------------------------
// 4. Registry
// -----------------------------------------------------------------------------

class SerializerRegistry {
  private static map = new Map<string, DataSerializer>([
    ['json', new JsonAdapter()],
    ['xml', new XmlAdapter()],
    ['csv', new CsvAdapter()]
  ]);
  static get(type: string): DataSerializer {
    const serializer = this.map.get(type.toLowerCase());
    if (!serializer) throw new Error(`Serializer ${type} not found`);
    return serializer;
  }
  static list(): string[] { return Array.from(this.map.keys()); }
}

// -----------------------------------------------------------------------------
// 5. Demo
// -----------------------------------------------------------------------------

function getSampleData(): any {
  return { id: 1, name: 'Alice', email: 'alice@example.com' };
}

function getSampleArray(): any[] {
  return [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
}

function demonstrateSerializers(): void {
  console.log('=== FILE FORMAT CONVERTER ADAPTER DEMO ===');
  for (const type of SerializerRegistry.list()) {
    const serializer = SerializerRegistry.get(type);
    console.log(`\n--- ${type.toUpperCase()} ---`);
    const data = type === 'csv' ? getSampleArray() : getSampleData();
    const serialized = serializer.serialize(data);
    console.log('Serialized:', serialized.replace(/\n/g, ' '));
    const deserialized = serializer.deserialize(serialized);
    console.log('Deserialized:', deserialized);
  }
}

demonstrateSerializers();
exit(0);

export { DataSerializer, SerializerRegistry, JsonAdapter, XmlAdapter, CsvAdapter }; 