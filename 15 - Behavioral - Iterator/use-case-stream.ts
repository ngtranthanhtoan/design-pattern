import { exit } from 'process';

// Iterator interface
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
  current(): T;
  reset(): void;
  close(): void;
}

// Stream data interface
interface StreamData {
  id: number;
  timestamp: Date;
  value: number;
  type: 'temperature' | 'humidity' | 'pressure' | 'voltage';
  sensorId: string;
  isValid: boolean;
}

// Stream source interface
interface StreamSource {
  hasNext(): boolean;
  next(): StreamData;
  close(): void;
}

// Simulated stream source
class SensorStreamSource implements StreamSource {
  private currentIndex: number = 0;
  private maxRecords: number;
  private isClosed: boolean = false;
  
  constructor(maxRecords: number = 1000) {
    this.maxRecords = maxRecords;
  }
  
  hasNext(): boolean {
    return !this.isClosed && this.currentIndex < this.maxRecords;
  }
  
  next(): StreamData {
    if (this.isClosed || this.currentIndex >= this.maxRecords) {
      throw new Error('No more data available');
    }
    
    const types: StreamData['type'][] = ['temperature', 'humidity', 'pressure', 'voltage'];
    const sensorIds = ['sensor-001', 'sensor-002', 'sensor-003', 'sensor-004'];
    
    const data: StreamData = {
      id: this.currentIndex + 1,
      timestamp: new Date(Date.now() + this.currentIndex * 1000), // Simulate time progression
      value: Math.random() * 100,
      type: types[this.currentIndex % types.length],
      sensorId: sensorIds[this.currentIndex % sensorIds.length],
      isValid: Math.random() > 0.1 // 90% valid data
    };
    
    this.currentIndex++;
    return data;
  }
  
  close(): void {
    this.isClosed = true;
  }
}

// Base stream iterator
class StreamIterator implements Iterator<StreamData> {
  protected source: StreamSource;
  protected currentData: StreamData | null = null;
  protected isClosed: boolean = false;
  
  constructor(source: StreamSource) {
    this.source = source;
  }
  
  hasNext(): boolean {
    if (this.isClosed) {
      return false;
    }
    
    if (this.currentData === null && this.source.hasNext()) {
      this.currentData = this.source.next();
    }
    
    return this.currentData !== null;
  }
  
  next(): StreamData {
    if (this.isClosed || this.currentData === null) {
      throw new Error('No more data available');
    }
    
    const result = this.currentData;
    this.currentData = null;
    return result;
  }
  
  current(): StreamData {
    if (this.currentData === null) {
      throw new Error('No current data available');
    }
    return this.currentData;
  }
  
  reset(): void {
    // For stream iterators, reset typically means creating a new source
    throw new Error('Stream iterators cannot be reset - create a new iterator');
  }
  
  close(): void {
    this.isClosed = true;
    this.source.close();
  }
}

// Filtering stream iterator
class FilteringStreamIterator extends StreamIterator {
  private predicate: (data: StreamData) => boolean;
  
  constructor(source: StreamSource, predicate: (data: StreamData) => boolean) {
    super(source);
    this.predicate = predicate;
  }
  
  override hasNext(): boolean {
    if (this.isClosed) {
      return false;
    }
    
    // Look ahead for next matching item
    while (this.source.hasNext()) {
      const data = this.source.next();
      if (this.predicate(data)) {
        this.currentData = data;
        return true;
      }
    }
    
    return false;
  }
}

// Transforming stream iterator
class TransformingStreamIterator<T> implements Iterator<T> {
  private iterator: Iterator<StreamData>;
  private transform: (data: StreamData) => T;
  private currentTransformed: T | null = null;
  private isClosed: boolean = false;
  
  constructor(iterator: Iterator<StreamData>, transform: (data: StreamData) => T) {
    this.iterator = iterator;
    this.transform = transform;
  }
  
  hasNext(): boolean {
    if (this.isClosed) {
      return false;
    }
    
    if (this.currentTransformed === null && this.iterator.hasNext()) {
      const data = this.iterator.next();
      this.currentTransformed = this.transform(data);
    }
    
    return this.currentTransformed !== null;
  }
  
  next(): T {
    if (this.isClosed || this.currentTransformed === null) {
      throw new Error('No more data available');
    }
    
    const result = this.currentTransformed;
    this.currentTransformed = null;
    return result;
  }
  
  current(): T {
    if (this.currentTransformed === null) {
      throw new Error('No current data available');
    }
    return this.currentTransformed;
  }
  
  reset(): void {
    throw new Error('Stream iterators cannot be reset');
  }
  
  close(): void {
    this.isClosed = true;
    this.iterator.close();
  }
}

// Aggregating stream iterator
class AggregatingStreamIterator implements Iterator<{ type: string; count: number; avgValue: number }> {
  private iterator: Iterator<StreamData>;
  private aggregationMap: Map<string, { count: number; sum: number }> = new Map();
  private aggregatedItems: { type: string; count: number; avgValue: number }[] = [];
  private currentIndex: number = 0;
  private isClosed: boolean = false;
  
  constructor(iterator: Iterator<StreamData>) {
    this.iterator = iterator;
    this.aggregate();
  }
  
  hasNext(): boolean {
    return !this.isClosed && this.currentIndex < this.aggregatedItems.length;
  }
  
  next(): { type: string; count: number; avgValue: number } {
    if (this.isClosed || this.currentIndex >= this.aggregatedItems.length) {
      throw new Error('No more aggregated data available');
    }
    
    return this.aggregatedItems[this.currentIndex++];
  }
  
  current(): { type: string; count: number; avgValue: number } {
    if (this.currentIndex >= this.aggregatedItems.length) {
      throw new Error('No current aggregated data available');
    }
    return this.aggregatedItems[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  close(): void {
    this.isClosed = true;
    this.iterator.close();
  }
  
  private aggregate(): void {
    while (this.iterator.hasNext()) {
      const data = this.iterator.next();
      const key = data.type;
      
      if (!this.aggregationMap.has(key)) {
        this.aggregationMap.set(key, { count: 0, sum: 0 });
      }
      
      const current = this.aggregationMap.get(key)!;
      current.count++;
      current.sum += data.value;
    }
    
    // Convert to array format
    for (const [type, { count, sum }] of this.aggregationMap.entries()) {
      this.aggregatedItems.push({
        type,
        count,
        avgValue: Math.round((sum / count) * 100) / 100
      });
    }
  }
}

// Stream processing pipeline
class StreamProcessingPipeline {
  private source: StreamSource;
  
  constructor(source: StreamSource) {
    this.source = source;
  }
  
  createFilteringIterator(predicate: (data: StreamData) => boolean): FilteringStreamIterator {
    return new FilteringStreamIterator(this.source, predicate);
  }
  
  createTransformingIterator<T>(transform: (data: StreamData) => T): TransformingStreamIterator<T> {
    const baseIterator = new StreamIterator(this.source);
    return new TransformingStreamIterator(baseIterator, transform);
  }
  
  createAggregatingIterator(): AggregatingStreamIterator {
    const baseIterator = new StreamIterator(this.source);
    return new AggregatingStreamIterator(baseIterator);
  }
}

// Demo
console.log('=== STREAM PROCESSING ITERATOR DEMO ===\n');

// Create stream source
const streamSource = new SensorStreamSource(50);
const pipeline = new StreamProcessingPipeline(streamSource);

// Basic stream iteration
console.log('--- Basic Stream Iteration ---');
const basicIterator = new StreamIterator(streamSource);
let count = 0;
while (basicIterator.hasNext() && count < 5) {
  const data = basicIterator.next();
  console.log(`  📊 ${data.type.toUpperCase()}: ${data.value.toFixed(2)} from ${data.sensorId}`);
  count++;
}

// Filtering stream (only valid temperature data)
console.log('\n--- Filtering Stream (Valid Temperature Data) ---');
const tempSource = new SensorStreamSource(50);
const tempFilter = (data: StreamData) => data.type === 'temperature' && data.isValid;
const filteringIterator = pipeline.createFilteringIterator(tempFilter);

count = 0;
while (filteringIterator.hasNext() && count < 5) {
  const data = filteringIterator.next();
  console.log(`  🌡️  Temperature: ${data.value.toFixed(2)}°C from ${data.sensorId}`);
  count++;
}

// Transforming stream (convert to alerts)
console.log('\n--- Transforming Stream (Alert Generation) ---');
const alertSource = new SensorStreamSource(50);
const alertTransform = (data: StreamData) => ({
  alertId: `ALERT-${data.id}`,
  severity: data.value > 80 ? 'HIGH' : data.value > 50 ? 'MEDIUM' : 'LOW',
  message: `${data.type.toUpperCase()} reading ${data.value.toFixed(2)} from ${data.sensorId}`,
  timestamp: data.timestamp
});

const alertIterator = pipeline.createTransformingIterator(alertTransform);

count = 0;
while (alertIterator.hasNext() && count < 5) {
  const alert = alertIterator.next();
  console.log(`  🚨 ${alert.severity}: ${alert.message}`);
  count++;
}

// Aggregating stream
console.log('\n--- Aggregating Stream (Statistics) ---');
const aggSource = new SensorStreamSource(50);
const aggPipeline = new StreamProcessingPipeline(aggSource);
const aggregatingIterator = aggPipeline.createAggregatingIterator();

while (aggregatingIterator.hasNext()) {
  const stats = aggregatingIterator.next();
  console.log(`  📈 ${stats.type}: ${stats.count} readings, avg: ${stats.avgValue}`);
}

// Complex pipeline: Filter -> Transform -> Aggregate
console.log('\n--- Complex Pipeline (Filter -> Transform -> Aggregate) ---');
const complexSource = new SensorStreamSource(50);

// Step 1: Filter valid pressure data
const pressureFilter = (data: StreamData) => data.type === 'pressure' && data.isValid;
const pressureIterator = new FilteringStreamIterator(complexSource, pressureFilter);

// Step 2: Transform to pressure alerts
const pressureTransform = (data: StreamData) => ({
  sensorId: data.sensorId,
  pressure: data.value,
  status: data.value > 90 ? 'CRITICAL' : data.value > 70 ? 'WARNING' : 'NORMAL'
});

const pressureAlertIterator = new TransformingStreamIterator(pressureIterator, pressureTransform);

count = 0;
while (pressureAlertIterator.hasNext() && count < 5) {
  const alert = pressureAlertIterator.next();
  console.log(`  📊 ${alert.sensorId}: ${alert.pressure.toFixed(2)} - ${alert.status}`);
  count++;
}

// Close all iterators
console.log('\n--- Closing Iterators ---');
basicIterator.close();
filteringIterator.close();
alertIterator.close();
aggregatingIterator.close();
pressureAlertIterator.close();

console.log('\n✅ Stream processing completed successfully');

exit(0); 