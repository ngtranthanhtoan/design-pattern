# OO to Functional Programming Design Pattern Mapping

This document provides a detailed mapping of classic object-oriented (OO) design patterns to their functional programming (FP) equivalents. Each section explains the OO intent, typical OO implementation, and the FP approach, with TypeScript examples.

---

## 1. Singleton Pattern

### OO Approach
**Intent:** Ensure a class has only one instance and provide a global point of access to it.

**Typical OO Implementation:**
- Private constructor
- Static method to get the instance
- Used for configuration, logging, etc.

**Drawbacks:**
- Global state, hard to test, not thread-safe by default.

### OO Example
```typescript
// OOP Singleton implementation in TypeScript
class AppConfig {
  private static instance: AppConfig;
  private constructor(private readonly env: string = 'production') {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  getEnv() {
    return this.env;
  }
}

// Usage
const configA = AppConfig.getInstance();
const configB = AppConfig.getInstance();
console.log(configA === configB); // true
```
> **Why this is OO:** The class encapsulates state and controls instantiation via a private constructor and a static accessor, ensuring a single global instance.

### FP Equivalent
**Functional Approach:**
- Use a module or closure to encapsulate state, or simply use pure functions (stateless).
- If state is needed, use a closure to create a single instance.

**Example:**
```typescript
// Functional Singleton using closure (App configuration)
export const createConfig = (() => {
  let instance: { env: string } | null = null;

  return () => {
    if (!instance) {
      instance = { env: 'production' }; // could load from env variables, etc.
    }
    return instance;
  };
})();

// Usage
const cfgA = createConfig();
const cfgB = createConfig();
console.log(cfgA === cfgB); // true
console.log(cfgA.env);      // 'production'
```
**FP Best Practice:**
Prefer stateless pure functions. If you need state, use closures, not global singletons.

---

## 2. Factory Method Pattern

### OO Approach
**Intent:** Define an interface for creating an object, but let subclasses decide which class to instantiate.

**Typical OO Implementation:**
- Abstract class with a factory method
- Subclasses override the method to create specific objects

### OO Example
```typescript
// OOP Factory Method implementation in TypeScript
abstract class DocumentParser {
  abstract parse(content: string): unknown;
}

class JSONParser extends DocumentParser {
  parse(content: string) {
    return JSON.parse(content);
  }
}

class CSVParser extends DocumentParser {
  parse(content: string) {
    // A real implementation would split lines, etc.
    return content.split(',').map(item => item.trim());
  }
}

abstract class ParserFactory {
  abstract createParser(): DocumentParser;
}

class JSONParserFactory extends ParserFactory {
  createParser() {
    return new JSONParser();
  }
}

class CSVParserFactory extends ParserFactory {
  createParser() {
    return new CSVParser();
  }
}

// Usage
function clientCode(factory: ParserFactory, raw: string) {
  const parser = factory.createParser();
  console.log(parser.parse(raw));
}

clientCode(new JSONParserFactory(), '{"foo": 42}');
clientCode(new CSVParserFactory(), 'foo, 42');
```
> **Why this is OO:** The factory subclasses decide which concrete parser to instantiate, allowing the client to remain independent of concrete classes.

### FP Equivalent
**Functional Approach:**
- Use factory functions (functions that return objects or other functions).
- Use higher-order functions to inject dependencies.

**Example:**
```typescript
// OO: abstract class Parser { abstract parse(input: string): Data; }
// FP:
type Parser = (input: string) => any;

const jsonParser: Parser = input => JSON.parse(input);
const csvParser: Parser = input => {/* ...parse CSV... */};

function getParser(type: 'json' | 'csv'): Parser {
  return type === 'json' ? jsonParser : csvParser;
}
```
**FP Best Practice:**
Use functions to create and compose objects, not classes.

---

## 3. Abstract Factory Pattern

### OO Approach
**Intent:** Create families of related objects without specifying their concrete classes.

**Typical OO Implementation:**
- Abstract factory interface
- Concrete factories for different families
- Abstract product interfaces

### OO Example
```typescript
// OOP Abstract Factory implementation in TypeScript
// Product interfaces
interface Button { render(): string; }
interface Input { render(): string; }
interface Modal { render(): string; }

// Concrete products – Material UI
class MaterialButton implements Button { render() { return 'Material Button'; } }
class MaterialInput implements Input { render() { return 'Material Input'; } }
class MaterialModal implements Modal { render() { return 'Material Modal'; } }

// Concrete products – Bootstrap UI
class BootstrapButton implements Button { render() { return 'Bootstrap Button'; } }
class BootstrapInput implements Input { render() { return 'Bootstrap Input'; } }
class BootstrapModal implements Modal { render() { return 'Bootstrap Modal'; } }

// Abstract factory
interface UIFactory { createButton(): Button; createInput(): Input; createModal(): Modal; }

// Concrete factories
class MaterialUIFactory implements UIFactory {
  createButton() { return new MaterialButton(); }
  createInput() { return new MaterialInput(); }
  createModal() { return new MaterialModal(); }
}

class BootstrapUIFactory implements UIFactory {
  createButton() { return new BootstrapButton(); }
  createInput() { return new BootstrapInput(); }
  createModal() { return new BootstrapModal(); }
}

// Client code
function renderDialog(factory: UIFactory) {
  console.log(factory.createButton().render());
  console.log(factory.createInput().render());
  console.log(factory.createModal().render());
}

renderDialog(new MaterialUIFactory());
renderDialog(new BootstrapUIFactory());
```
> **Why this is OO:** Concrete factory classes encapsulate the creation of related objects, letting the client stay agnostic of concrete product classes.

### FP Equivalent
**Functional Approach:**
- Use factory functions that return sets of related functions.
- Use higher-order functions to create families of related behaviors.

**Example:**
```typescript
// OO: AbstractFactory -> ConcreteFactory -> Products
// FP:
type UIFactory = {
  createButton: () => Button;
  createInput: () => Input;
  createModal: () => Modal;
};

const createMaterialUIFactory = (): UIFactory => ({
  createButton: () => ({ type: 'material', style: 'flat' }),
  createInput: () => ({ type: 'material', floating: true }),
  createModal: () => ({ type: 'material', backdrop: true })
});

const createBootstrapUIFactory = (): UIFactory => ({
  createButton: () => ({ type: 'bootstrap', style: 'btn-primary' }),
  createInput: () => ({ type: 'bootstrap', formControl: true }),
  createModal: () => ({ type: 'bootstrap', fade: true })
});
```
**FP Best Practice:**
Use factory functions to create families of related behaviors.

---

## 4. Builder Pattern

### OO Approach
**Intent:** Construct complex objects step by step, allowing different representations.

**Typical OO Implementation:**
- Builder interface with fluent methods
- Director class to orchestrate building
- Complex object construction

### OO Example
```typescript
// OOP Builder implementation in TypeScript (Fluent API)
class SQLQuery {
  constructor(
    public readonly selectClause: string,
    public readonly fromClause: string,
    public readonly whereClause: string,
  ) {}

  toString() {
    return `${this.selectClause} ${this.fromClause} ${this.whereClause}`.trim();
  }
}

class SQLQueryBuilder {
  private selectClause = '';
  private fromClause = '';
  private whereClause = '';

  select(fields: string[]): this {
    this.selectClause = `SELECT ${fields.join(', ')}`;
    return this;
  }

  from(table: string): this {
    this.fromClause = `FROM ${table}`;
    return this;
  }

  where(condition: string): this {
    this.whereClause = `WHERE ${condition}`;
    return this;
  }

  build(): SQLQuery {
    return new SQLQuery(this.selectClause, this.fromClause, this.whereClause);
  }
}

// Usage
const query = new SQLQueryBuilder()
  .select(['id', 'name'])
  .from('users')
  .where('active = 1')
  .build();

console.log(query.toString()); // SELECT id, name FROM users WHERE active = 1
```
> **Why this is OO:** The SQLQueryBuilder mutates its internal state through fluent setters before finally producing an immutable `SQLQuery` object.

### FP Equivalent
**Functional Approach:**
- Use function composition and fluent interfaces.
- Use partial application and currying for step-by-step construction.

**Example:**
```typescript
// OO: Builder -> Director -> Product
// FP:
type QueryBuilder = {
  select: (fields: string[]) => QueryBuilder;
  from: (table: string) => QueryBuilder;
  where: (condition: string) => QueryBuilder;
  build: () => string;
};

const createQueryBuilder = (): QueryBuilder => {
  let query = { select: '', from: '', where: '' };
  
  return {
    select: (fields) => ({ ...query, select: `SELECT ${fields.join(', ')}` }),
    from: (table) => ({ ...query, from: `FROM ${table}` }),
    where: (condition) => ({ ...query, where: `WHERE ${condition}` }),
    build: () => `${query.select} ${query.from} ${query.where}`.trim()
  };
};
```
**FP Best Practice:**
Use function composition and immutable data for building complex objects.

---

## 5. Prototype Pattern

### OO Approach
**Intent:** Create new objects by cloning an existing object, known as the prototype.

**Typical OO Implementation:**
- Prototype interface with clone method
- Concrete prototypes
- Registry of prototypes

### OO Example
```typescript
// OOP Prototype implementation in TypeScript
interface Prototype<T> {
  clone(): T;
}

class UserProfile implements Prototype<UserProfile> {
  constructor(
    public name: string,
    public email: string,
    public preferences: Record<string, unknown> = {},
  ) {}

  clone(): UserProfile {
    return new UserProfile(this.name, this.email, { ...this.preferences });
  }
}

// Usage
const originalProfile = new UserProfile('Alice', 'alice@example.com', { theme: 'dark' });
const clonedProfile = originalProfile.clone();

console.log(originalProfile === clonedProfile); // false
console.log(clonedProfile.preferences); // { theme: 'dark' }
```
> **Why this is OO:** The `clone` method allows the client to create duplicates without knowing the concrete class of the object, following the classic Prototype contract.

### FP Equivalent
**Functional Approach:**
- Use object spread, structured cloning, or pure functions to create copies.
- Use immutable data structures.

**Example:**
```typescript
// FP:
const createProfile = (name: string, email: string, preferences: Record<string, unknown> = {}) => ({
  name,
  email,
  preferences,
});

const cloneProfile = <T>(profile: T): T => ({ ...profile });

// Usage
const originalProfileFP = createProfile('Alice', 'alice@example.com', { theme: 'dark' });
const clonedProfileFP = cloneProfile(originalProfileFP);
```
**FP Best Practice:**
Use immutable data and pure functions for cloning.

---

## 6. Adapter Pattern

### OO Approach
**Intent:** Allow incompatible interfaces to work together.

**Typical OO Implementation:**
- Adapter class that implements target interface
- Wraps adaptee object
- Translates calls

### OO Example
```typescript
// Target interface expected by new codebase
interface NewAPI { process(data: { value: string }): { result: string }; }

// Legacy service with a different signature (Adaptee)
class OldService {
  processLegacy(data: string): string {
    return `processed: ${data}`;
  }
}

// Adapter makes OldService conform to NewAPI
class OldServiceAdapter implements NewAPI {
  constructor(private readonly adaptee: OldService) {}

  process(data: { value: string }): { result: string } {
    return { result: this.adaptee.processLegacy(data.value) };
  }
}

// Usage
const adapter = new OldServiceAdapter(new OldService());
console.log(adapter.process({ value: 'test' })); // { result: 'processed: test' }
```
> **Why this is OO:** `OldServiceAdapter` implements the target interface and delegates work to the incompatible `OldService`, translating the call on the fly.

### FP Equivalent
**Functional Approach:**
- Use wrapper functions or higher-order functions to adapt interfaces.
- Use function composition to transform data.

**Example:**
```typescript
// OO: Adapter implements Target, wraps Adaptee
// FP:
type OldAPI = (data: string) => string;
type NewAPI = (data: { value: string }) => { result: string };

const oldFunction: OldAPI = (data) => `processed: ${data}`;

// Adapter function
const adaptOldToNew = (oldFn: OldAPI): NewAPI => 
  (data) => ({ result: oldFn(data.value) });

// Usage
const newFunction = adaptOldToNew(oldFunction);
const result = newFunction({ value: 'test' });
```
**FP Best Practice:**
Use higher-order functions to adapt interfaces.

---

## 7. Bridge Pattern

### OO Approach
**Intent:** Decouple abstraction from implementation, allowing both to vary independently.

**Typical OO Implementation:**
- Abstraction class
- Implementation interface
- Bridge between them

### OO Example
```typescript
// Implementation hierarchy
interface Renderer { render(shape: string): string; }

class VectorRenderer implements Renderer {
  render(shape: string) { return `Drawing ${shape} as vector`; }
}

class RasterRenderer implements Renderer {
  render(shape: string) { return `Drawing ${shape} as raster`; }
}

// Abstraction hierarchy
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): string;
}

class Circle extends Shape {
  draw() { return this.renderer.render('circle'); }
}

class Square extends Shape {
  draw() { return this.renderer.render('square'); }
}

// Usage
console.log(new Circle(new VectorRenderer()).draw()); // Drawing circle as vector
console.log(new Square(new RasterRenderer()).draw()); // Drawing square as raster
```
> **Why this is OO:** Abstraction (`Shape`) delegates rendering to a separate implementation hierarchy (`Renderer`), so both dimensions vary independently.

### FP Equivalent
**Functional Approach:**
- Pass implementation as function parameter.
- Use dependency injection with functions.

**Example:**
```typescript
// OO: Abstraction -> Implementation
// FP:
type Renderer = (shape: string) => string;
type Shape = (renderer: Renderer) => string;

const vectorRenderer: Renderer = (shape) => `Drawing ${shape} as vector`;
const rasterRenderer: Renderer = (shape) => `Drawing ${shape} as raster`;

const circle: Shape = (renderer) => renderer('circle');
const square: Shape = (renderer) => renderer('square');

// Usage
circle(vectorRenderer); // "Drawing circle as vector"
square(rasterRenderer); // "Drawing square as raster"
```
**FP Best Practice:**
Pass implementations as function parameters.

---

## 8. Composite Pattern

### OO Approach
**Intent:** Compose objects into tree structures and treat individual objects and compositions uniformly.

**Typical OO Implementation:**
- Component interface
- Leaf and Composite classes
- Recursive structure

### OO Example
```typescript
// Component
interface FileSystemComponent {
  getSize(): number;
  list(): string[];
}

// Leaf
class File implements FileSystemComponent {
  constructor(private name: string, private size: number) {}
  getSize() { return this.size; }
  list() { return [this.name]; }
}

// Composite
class Directory implements FileSystemComponent {
  private children: FileSystemComponent[] = [];
  constructor(private name: string) {}

  add(child: FileSystemComponent) { this.children.push(child); }

  getSize() { return this.children.reduce((s, c) => s + c.getSize(), 0); }
  list() { return this.children.flatMap(c => c.list()); }
}

// Usage
const root = new Directory('root');
root.add(new File('a.txt', 100));
const images = new Directory('images');
images.add(new File('logo.png', 200));
root.add(images);

console.log(root.getSize()); // 300
console.log(root.list());    // ['a.txt', 'logo.png']
```
> **Why this is OO:** `Directory` treats individual `File` objects and other `Directory` objects uniformly through the `FileSystemComponent` interface.

### FP Equivalent
**Functional Approach:**
- Use recursive data structures and algebraic data types.
- Use fold/map/reduce operations on trees.

**Example:**
```typescript
// OO: Component -> Leaf/Composite
// FP:
type FileSystemNode = 
  | { type: 'file'; name: string; size: number }
  | { type: 'directory'; name: string; children: FileSystemNode[] };

const calculateSize = (node: FileSystemNode): number => {
  switch (node.type) {
    case 'file': return node.size;
    case 'directory': return node.children.reduce((sum, child) => sum + calculateSize(child), 0);
  }
};

const listFiles = (node: FileSystemNode): string[] => {
  switch (node.type) {
    case 'file': return [node.name];
    case 'directory': return node.children.flatMap(listFiles);
  }
};
```
**FP Best Practice:**
Use algebraic data types and pattern matching for tree structures.

---

## 9. Decorator Pattern

### OO Approach
**Intent:** Attach additional responsibilities to an object dynamically.

**Typical OO Implementation:**
- Component interface
- Concrete component
- Decorator classes that wrap components

### OO Example
```typescript
// Component
interface Coffee { cost(): number; description(): string; }

// Concrete component
class SimpleCoffee implements Coffee {
  cost() { return 5; }
  description() { return 'Simple coffee'; }
}

// Decorator base
abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}
  abstract cost(): number;
  abstract description(): string;
}

class MilkDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 1; }
  description() { return this.coffee.description() + ' + milk'; }
}

class SugarDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 0.5; }
  description() { return this.coffee.description() + ' + sugar'; }
}

// Usage
let coffee: Coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
console.log(coffee.description()); // Simple coffee + milk + sugar
console.log(coffee.cost());        // 6.5
```
> **Why this is OO:** Decorators wrap the original component to extend behaviour while conforming to the same interface.

### FP Equivalent
**Functional Approach:**
- Use function composition and higher-order functions.
- Use middleware patterns.

**Example:**
```typescript
// OO: Component -> Decorator -> Decorator
// FP:
type Coffee = () => string;
type CoffeeDecorator = (coffee: Coffee) => Coffee;

const simpleCoffee: Coffee = () => 'Simple coffee';

const addMilk: CoffeeDecorator = (coffee) => 
  () => coffee() + ' + milk';

const addSugar: CoffeeDecorator = (coffee) => 
  () => coffee() + ' + sugar';

// Usage
const coffeeWithMilkAndSugar = addSugar(addMilk(simpleCoffee));
coffeeWithMilkAndSugar(); // "Simple coffee + milk + sugar"
```
**FP Best Practice:**
Use function composition for adding behavior.

---

## 10. Facade Pattern

### OO Approach
**Intent:** Provide a unified interface to a set of interfaces in a subsystem.

**Typical OO Implementation:**
- Facade class that simplifies complex subsystem
- Hides complexity behind simple interface

### OO Example
```typescript
class Validator { static validate(email: string) { return email.includes('@'); } }
class Mailer { static send(email: string, msg: string) { return `Sent to ${email}`; } }
class LoggerSvc { static log(email: string) { console.log(`Logged: ${email}`); } }

class EmailServiceFacade {
  send(email: string, message: string) {
    if (!Validator.validate(email)) throw new Error('Invalid email');
    const result = Mailer.send(email, message);
    LoggerSvc.log(email);
    return result;
  }
}

// Usage
new EmailServiceFacade().send('user@example.com', 'Hello!');
```
> **Why this is OO:** The facade class offers a single high-level `send` method while hiding three subsystem classes.

### FP Equivalent
**Functional Approach:**
- Use functions that orchestrate multiple lower-level functions.
- Use module exports to create simplified interfaces.

**Example:**
```typescript
// OO: Facade -> Subsystem classes
// FP:
const validateEmail = (email: string) => email.includes('@');
const sendEmail = (email: string, message: string) => `Sent to ${email}`;
const logEmail = (email: string) => `Logged: ${email}`;

// Facade function
const emailService = (email: string, message: string) => {
  if (!validateEmail(email)) {
    throw new Error('Invalid email');
  }
  
  const result = sendEmail(email, message);
  logEmail(email);
  return result;
};

// Usage
emailService('user@example.com', 'Hello!');
```
**FP Best Practice:**
Use functions to orchestrate complex operations.

---

## 11. Flyweight Pattern

### OO Approach
**Intent:** Use sharing to support large numbers of fine-grained objects efficiently.

**Typical OO Implementation:**
- Flyweight interface
- Concrete flyweight with shared state
- Flyweight factory

### OO Example
```typescript
interface Character { draw(): void; }

class CharacterGlyph implements Character {
  constructor(private char: string, private font: string, private size: number) {}
  draw() { console.log(`${this.char}-${this.font}-${this.size}`); }
}

class GlyphFactory {
  private static cache = new Map<string, CharacterGlyph>();
  static get(char: string): CharacterGlyph {
    if (!this.cache.has(char)) {
      this.cache.set(char, new CharacterGlyph(char, 'Arial', 12));
    }
    return this.cache.get(char)!;
  }
}

// Usage
const g1 = GlyphFactory.get('A');
const g2 = GlyphFactory.get('A');
console.log(g1 === g2); // true
g1.draw();
```
> **Why this is OO:** The factory ensures shared small objects (`CharacterGlyph`) are reused, minimising memory footprint.

### FP Equivalent
**Functional Approach:**
- Use memoization and shared immutable data.
- Use closures to cache expensive computations.

**Example:**
```typescript
// OO: Flyweight -> Factory -> Shared instances
// FP:
const createCharacter = (() => {
  const cache = new Map<string, any>();
  
  return (char: string) => {
    if (!cache.has(char)) {
      cache.set(char, { char, font: 'Arial', size: 12 });
    }
    return cache.get(char);
  };
})();

// Usage
const charA = createCharacter('A');
const charB = createCharacter('B');
const charA2 = createCharacter('A'); // Same instance as charA
```
**FP Best Practice:**
Use memoization and immutable shared data.

---

## 12. Proxy Pattern

### OO Approach
**Intent:** Provide a surrogate or placeholder for another object to control access to it.

**Typical OO Implementation:**
- Subject interface
- Real subject
- Proxy that controls access

### OO Example
```typescript
// Subject interface
interface DataService { fetch(): number; }

// Real subject performing an expensive operation
class RealDataService implements DataService {
  fetch(): number {
    console.log('Performing expensive operation...');
    return Math.random();
  }
}

// Proxy that adds lazy-initialised caching
class CachedDataServiceProxy implements DataService {
  private cache: number | null = null;
  constructor(private readonly real: DataService) {}

  fetch(): number {
    if (this.cache === null) {
      this.cache = this.real.fetch();
    }
    return this.cache;
  }
}

// Usage
const service: DataService = new CachedDataServiceProxy(new RealDataService());
console.log(service.fetch()); // performs real fetch
console.log(service.fetch()); // returns cached result
```
> **Why this is OO:** The proxy implements the same `DataService` interface as the real subject and transparently adds caching while preserving the client contract.

### FP Equivalent
**Functional Approach:**
- Use wrapper functions or monads (IO, Task).
- Use higher-order functions for access control.

**Example:**
```typescript
// OO: Subject -> Proxy -> RealSubject
// FP:
type ExpensiveOperation = () => number;

const expensiveOperation: ExpensiveOperation = () => {
  console.log('Performing expensive operation...');
  return Math.random();
};

const createCachedProxy = (operation: ExpensiveOperation) => {
  let cache: number | null = null;
  
  return () => {
    if (cache === null) {
      cache = operation();
    }
    return cache;
  };
};

// Usage
const cachedOperation = createCachedProxy(expensiveOperation);
cachedOperation(); // Performs operation
cachedOperation(); // Returns cached result
```
**FP Best Practice:**
Use wrapper functions and monads for controlled access.

---

## 13. Chain of Responsibility Pattern

### OO Approach
**Intent:** Pass requests along a chain of handlers until one handles it.

### OO Example
```typescript
// Handler interface
interface Handler {
  setNext(handler: Handler): Handler;
  handle(request: any): any | null;
}

// Base handler with default pass-along logic
abstract class AbstractHandler implements Handler {
  private next: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.next = handler;
    return handler;
  }

  handle(request: any): any | null {
    return this.next ? this.next.handle(request) : null;
  }
}

// Concrete handlers
class EmailValidationHandler extends AbstractHandler {
  handle(request: any): any | null {
    if (!request.email?.includes('@')) {
      console.log('Email invalid');
      return null;
    }
    return super.handle(request) || request;
  }
}

class AgeValidationHandler extends AbstractHandler {
  handle(request: any): any | null {
    if (request.age < 18) {
      console.log('Under age');
      return null;
    }
    return super.handle(request) || request;
  }
}

class ProcessingHandler extends AbstractHandler {
  handle(request: any): any | null {
    return { ...request, processed: true };
  }
}

// Build chain
const emailHandler = new EmailValidationHandler();
emailHandler.setNext(new AgeValidationHandler()).setNext(new ProcessingHandler());

// Usage
console.log(emailHandler.handle({ email: 'bob@example.com', age: 22 }));
console.log(emailHandler.handle({ email: 'invalid', age: 22 })); // null
```
> **Why this is OO:** Each handler encapsulates a single responsibility and the chain passes the request until one handler processes it, following the classic pattern structure.

### FP Equivalent
**Functional Approach:**
- Use function chaining, pipelines, or monads (Either, Task).
- Use composition of validation/processing functions.

**Example:**
```typescript
// OO: Handler -> Handler -> Handler
// FP:
type Handler = (request: any) => any | null;

const validateEmail: Handler = (request) => 
  request.email?.includes('@') ? request : null;

const validateAge: Handler = (request) => 
  request.age >= 18 ? request : null;

const processRequest: Handler = (request) => 
  ({ ...request, processed: true });

// Chain handlers
const processUserRequest = (request: any) => {
  const result = validateEmail(request);
  if (!result) return null;
  
  const ageResult = validateAge(result);
  if (!ageResult) return null;
  
  return processRequest(ageResult);
};
```
**FP Best Practice:**
Use function composition and monads for request processing.

---

## 14. Command Pattern

### OO Approach
**Intent:** Encapsulate a request as an object, allowing parameterization and queuing.

### OO Example
```typescript
// Invoker and receiver
class Light {
  on() { console.log('Light is ON'); }
  off() { console.log('Light is OFF'); }
}

// Command interface
interface Command {
  execute(): void;
}

// Concrete commands
class LightOnCommand implements Command {
  constructor(private readonly light: Light) {}
  execute() { this.light.on(); }
}

class LightOffCommand implements Command {
  constructor(private readonly light: Light) {}
  execute() { this.light.off(); }
}

// Invoker holding a queue (macro-commands)
class RemoteControl {
  private queue: Command[] = [];
  addCommand(cmd: Command) { this.queue.push(cmd); }
  run() {
    while (this.queue.length) {
      this.queue.shift()!.execute();
    }
  }
}

// Usage
const light = new Light();
const remote = new RemoteControl();
remote.addCommand(new LightOnCommand(light));
remote.addCommand(new LightOffCommand(light));
remote.run();
```
> **Why this is OO:** Requests are encapsulated as objects, queued by the invoker, and executed on the receiver, enabling flexible macro-recording just like the FP queue example.

### FP Equivalent
**Functional Approach:**
- Use function objects, closures, or function queues.
- Use higher-order functions for command composition.

**Example:**
```typescript
// OO: Command -> Invoker -> Receiver
// FP:
type Command = () => void;
type CommandQueue = Command[];

const createCommandQueue = () => {
  const queue: CommandQueue = [];
  
  return {
    add: (command: Command) => queue.push(command),
    execute: () => {
      while (queue.length > 0) {
        const command = queue.shift();
        command?.();
      }
    }
  };
};

// Usage
const queue = createCommandQueue();
queue.add(() => console.log('Command 1'));
queue.add(() => console.log('Command 2'));
queue.execute();
```
**FP Best Practice:**
Use function objects and queues for command processing.

---

## 15. Iterator Pattern

### OO Approach
**Intent:** Provide a way to access elements of a collection without exposing its underlying representation.

### OO Example
```typescript
// Collection interface
interface IterableCollection {
  [Symbol.iterator](): Iterator<any>;
}

// Iterable collection implementing the built-in iterator protocol
class Range implements IterableCollection {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;
    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          return { value: current++, done: false };
        }
        return { value: undefined as any, done: true };
      }
    };
  }
}

// Usage (identical output to generator version)
for (const n of new Range(1, 5)) {
  console.log(n);
}
```
> **Why this is OO:** The `Range` class exposes an iterator so clients can traverse without knowing the internal representation, matching the FP generator example.

### FP Equivalent
**Functional Approach:**
- Use built-in iterators, generators, or lazy lists.
- Use functional array methods (map, filter, reduce).

**Example:**
```typescript
// OO: Iterator -> Collection
// FP:
const createRangeIterator = function* (start: number, end: number) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
};

// Usage
const iterator = createRangeIterator(1, 5);
for (const value of iterator) {
  console.log(value);
}

// Or use functional approach
const numbers = [1, 2, 3, 4, 5];
numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .forEach(n => console.log(n));
```
**FP Best Practice:**
Use generators and functional array methods.

---

## 16. Mediator Pattern

### OO Approach
**Intent:** Define an object that encapsulates how a set of objects interact.

### OO Example
```typescript
// Colleague classes
class User {
  constructor(private name: string, private chat: ChatRoom) {
    chat.addUser(this);
  }
  send(message: string) {
    console.log(`${this.name} sends: ${message}`);
    this.chat.send(message, this);
  }
  receive(message: string) {
    console.log(`${this.name} receives: ${message}`);
  }
}

// Usage
const room = new ChatRoom();
const alice = new User('Alice', room);
const bob = new User('Bob', room);
alice.send('Hello Bob');
```
> **Why this is OO:** The mediator (`ChatRoom`) centralises interaction logic, decoupling user objects just as the FP event-bus does functionally.

### FP Equivalent
**Functional Approach:**
- Use event bus as function or pub-sub with closures.
- Use function composition for coordination.

**Example:**
```typescript
// OO: Mediator -> Colleagues
// FP:
type EventHandler = (data: any) => void;
type EventBus = Map<string, EventHandler[]>;

const createEventBus = () => {
  const handlers: EventBus = new Map();
  
  return {
    subscribe: (event: string, handler: EventHandler) => {
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event)!.push(handler);
    },
    publish: (event: string, data: any) => {
      const eventHandlers = handlers.get(event) || [];
      eventHandlers.forEach(handler => handler(data));
    }
  };
};

// Usage
const bus = createEventBus();
bus.subscribe('userCreated', (user) => console.log('User created:', user));
bus.publish('userCreated', { name: 'John' });
```
**FP Best Practice:**
Use event buses and function composition for coordination.

---

## 17. Memento Pattern

### OO Approach
**Intent:** Capture and externalize an object's internal state without violating encapsulation.

### OO Example
```typescript
// Caretaker class
class History {
  private stack: EditorMemento[] = [];
  push(m: EditorMemento) { this.stack.push(m); }
  pop(): EditorMemento | undefined { return this.stack.pop(); }
}

// Usage
const editor = new Editor();
const history = new History();

editor.setContent('Version 1');
history.push(editor.createMemento());

editor.setContent('Version 2');
editor.show(); // Version 2

const v1 = history.pop();
if (v1) editor.restore(v1);
editor.show(); // Version 1
```
> **Why this is OO:** State snapshots are captured in `EditorMemento` objects managed by a caretaker, mirroring the immutable-state FP example.

### FP Equivalent
**Functional Approach:**
- Use immutable data snapshots and state history as lists.
- Use pure functions for state transitions.

**Example:**
```typescript
// OO: Originator -> Memento -> Caretaker
// FP:
type EditorState = {
  content: string;
  cursor: number;
};

type EditorHistory = EditorState[];

const createEditor = () => {
  let currentState: EditorState = { content: '', cursor: 0 };
  let history: EditorHistory = [];
  
  return {
    setContent: (text: string) => {
      history.push({ ...currentState });
      currentState = { ...currentState, content };
    },
    undo: () => {
      if (history.length > 0) {
        currentState = history.pop()!;
      }
    },
    getState: () => ({ ...currentState })
  };
};
```
**FP Best Practice:**
Use immutable data and pure functions for state management.

---

## 18. Observer Pattern

### OO Approach
**Intent:** Define a one-to-many dependency between objects so that when one object changes state, all dependents are notified.

### OO Example
```typescript
// Concrete subjects and observers
class NewsAgency implements Subject {
  private observers: Observer[] = [];
  attach(obs: Observer) { this.observers.push(obs); }
  detach(obs: Observer) { this.observers = this.observers.filter(o => o !== obs); }
  notify(news: string) { this.observers.forEach(o => o.update(news)); }
}

// Concrete observers
class EmailSubscriber implements Observer {
  constructor(private email: string) {}
  update(news: string) { console.log(`Email to ${this.email}: ${news}`); }
}

class SMSSubscriber implements Observer {
  constructor(private phone: string) {}
  update(news: string) { console.log(`SMS to ${this.phone}: ${news}`); }
}

// Usage
const agency = new NewsAgency();
const aliceEmail = new EmailSubscriber('alice@example.com');
const bobSMS = new SMSSubscriber('123456');
agency.attach(aliceEmail);
agency.attach(bobSMS);
agency.notify('Breaking News!');
```
> **Why this is OO:** Concrete observers register with a subject and receive updates, replicating the functional pub-sub sample.

### FP Equivalent
**Functional Approach:**
- Use pub-sub, event streams, or callback registration.
- Use reactive programming patterns.

**Example:**
```typescript
// OO: Subject -> Observer
// FP:
type Observer<T> = (data: T) => void;
type Subject<T> = {
  subscribe: (observer: Observer<T>) => void;
  unsubscribe: (observer: Observer<T>) => void;
  notify: (data: T) => void;
};

const createSubject = <T>(): Subject<T> => {
  const observers: Observer<T>[] = [];
  
  return {
    subscribe: (observer) => observers.push(observer),
    unsubscribe: (observer) => {
      const index = observers.indexOf(observer);
      if (index > -1) observers.splice(index, 1);
    },
    notify: (data) => observers.forEach(observer => observer(data))
  };
};

// Usage
const subject = createSubject<string>();
subject.subscribe((data) => console.log('Observer 1:', data));
subject.subscribe((data) => console.log('Observer 2:', data));
subject.notify('Hello World!');
```
**FP Best Practice:**
Use pub-sub patterns and reactive programming.

---

## 19. State Pattern

### OO Approach
**Intent:** Allow an object to alter its behavior when its internal state changes.

### OO Example
```typescript
// Concrete state classes
class IdleState implements VendingState {
  constructor(private ctx: VendingMachine) {}
  insertCoin() { console.log('Insert money first'); }
  selectProduct() { console.log('Insert money first'); }
  dispense() { console.log('Insert money first'); }
}

class HasMoneyState implements VendingState {
  constructor(private ctx: VendingMachine) {}
  insertCoin() { console.log('Already have money'); }
  selectProduct() {
    console.log('Product selected');
    this.ctx.setState(new DispensingState(this.ctx));
  }
  dispense() { console.log('Select product first'); }
}

class DispensingState implements VendingState {
  constructor(private ctx: VendingMachine) {}
  insertCoin() { console.log('Wait'); }
  selectProduct() { console.log('Already dispensing'); }
  dispense() {
    console.log('Dispensing product');
    this.ctx.setAmount(0);
    this.ctx.setState(new IdleState(this.ctx));
  }
}

// Usage
const vm = new VendingMachine();
vm.insertCoin(2);
vm.selectProduct();
vm.dispense();
```
> **Why this is OO:** Behaviour changes at runtime by switching out state objects, just like the tagged-union reducer in the FP version.

### FP Equivalent
**Functional Approach:**
- Use algebraic data types, pattern matching, or state monad.
- Use tagged unions for state representation.

**Example:**
```typescript
// OO: Context -> State
// FP:
type VendingMachineState = 
  | { type: 'idle' }
  | { type: 'hasMoney'; amount: number }
  | { type: 'dispensing' };

type VendingMachineAction = 
  | { type: 'insertCoin'; amount: number }
  | { type: 'selectProduct' }
  | { type: 'dispense' };

const vendingMachineReducer = (
  state: VendingMachineState, 
  action: VendingMachineAction
): VendingMachineState => {
  switch (state.type) {
    case 'idle':
      if (action.type === 'insertCoin') {
        return { type: 'hasMoney', amount: action.amount };
      }
      return state;
      
    case 'hasMoney':
      if (action.type === 'selectProduct') {
        return { type: 'dispensing' };
      }
      return state;
      
    case 'dispensing':
      if (action.type === 'dispense') {
        return { type: 'idle' };
      }
      return state;
  }
};
```
**FP Best Practice:**
Use algebraic data types and pure functions for state management.

---

## 20. Template Method Pattern

### OO Approach
**Intent:** Define the skeleton of an algorithm in a method, deferring some steps to subclasses.

### OO Example
```typescript
// Concrete subclasses
abstract class DataProcessor {
  // Template method (algorithm skeleton)
  process(data: any) {
    if (!this.validate(data)) throw new Error('Invalid data');
    const transformed = this.transform(data);
    this.save(transformed);
    return transformed;
  }

  protected abstract validate(data: any): boolean;
  protected abstract transform(data: any): any;
  protected abstract save(data: any): void;
}

class CsvProcessor extends DataProcessor {
  protected validate(data: any): boolean { return Array.isArray(data); }
  protected transform(data: any): any { return data.join(','); }
  protected save(data: any): void { console.log('Saving CSV:', data); }
}

// Usage
new CsvProcessor().process(['a', 'b', 'c']);
```
> **Why this is OO:** The abstract superclass defines the invariant algorithm while subclasses supply specific steps, matching the FP higher-order-function variant.

### FP Equivalent
**Functional Approach:**
- Use higher-order functions with customizable steps.
- Use function composition with configurable parts.

**Example:**
```typescript
// OO: AbstractClass -> templateMethod() -> hook methods
// FP:
type DataProcessor = {
  validate: (data: any) => boolean;
  transform: (data: any) => any;
  save: (data: any) => void;
};

const createDataProcessor = (processor: DataProcessor) => {
  return (data: any) => {
    if (!processor.validate(data)) {
      throw new Error('Invalid data');
    }
    
    const transformed = processor.transform(data);
    processor.save(transformed);
    return transformed;
  };
};

// Usage
const csvProcessor = createDataProcessor({
  validate: (data) => Array.isArray(data),
  transform: (data) => data.join(','),
  save: (data) => console.log('Saving CSV:', data)
});
```
**FP Best Practice:**
Use higher-order functions for customizable algorithms.

---

## 21. Visitor Pattern

### OO Approach
**Intent:** Represent an operation to be performed on elements of an object structure.

### OO Example
```typescript
// Concrete visitors and elements
class NumberExpr implements Expression {
  constructor(public value: number) {}
  accept<T>(visitor: Visitor<T>): T { return visitor.visitNumber(this); }
}

class AddExpr implements Expression {
  constructor(public left: Expression, public right: Expression) {}
  accept<T>(visitor: Visitor<T>): T { return visitor.visitAdd(this); }
}

class MultiplyExpr implements Expression {
  constructor(public left: Expression, public right: Expression) {}
  accept<T>(visitor: Visitor<T>): T { return visitor.visitMultiply(this); }
}

// Visitor interface
interface Visitor<T> {
  visitNumber(num: NumberExpr): T;
  visitAdd(expr: AddExpr): T;
  visitMultiply(expr: MultiplyExpr): T;
}

// Concrete visitors
class Evaluator implements Visitor<number> {
  visitNumber(n: NumberExpr) { return n.value; }
  visitAdd(e: AddExpr) { return e.left.accept(this) + e.right.accept(this); }
  visitMultiply(e: MultiplyExpr) { return e.left.accept(this) * e.right.accept(this); }
}

class PrettyPrinter implements Visitor<string> {
  visitNumber(n: NumberExpr) { return n.value.toString(); }
  visitAdd(e: AddExpr) { return `(${e.left.accept(this)} + ${e.right.accept(this)})`; }
  visitMultiply(e: MultiplyExpr) { return `(${e.left.accept(this)} * ${e.right.accept(this)})`; }
}

// Usage
const expr: Expression = new AddExpr(
  new NumberExpr(5),
  new MultiplyExpr(new NumberExpr(2), new NumberExpr(3))
);

console.log(expr.accept(new Evaluator()));      // 11
console.log(expr.accept(new PrettyPrinter()));  // "(5 + (2 * 3))"
```
> **Why this is OO:** New operations are added via visitors without changing the element classes, equivalent to pattern-matching functions in the FP example.

### FP Equivalent
**Functional Approach:**
- Use pattern matching, fold, map, reduce operations.
- Use algebraic data types and visitor functions.

**Example:**
```typescript
// OO: Visitor -> Element
// FP:
type Expression = 
  | { type: 'number'; value: number }
  | { type: 'add'; left: Expression; right: Expression }
  | { type: 'multiply'; left: Expression; right: Expression };

const evaluate = (expr: Expression): number => {
  switch (expr.type) {
    case 'number': return expr.value;
    case 'add': return evaluate(expr.left) + evaluate(expr.right);
    case 'multiply': return evaluate(expr.left) * evaluate(expr.right);
  }
};

const prettyPrint = (expr: Expression): string => {
  switch (expr.type) {
    case 'number': return expr.value.toString();
    case 'add': return `(${prettyPrint(expr.left)} + ${prettyPrint(expr.right)})`;
    case 'multiply': return `(${prettyPrint(expr.left)} * ${prettyPrint(expr.right)})`;
  }
};

// Usage
const expression: Expression = {
  type: 'add',
  left: { type: 'number', value: 5 },
  right: { type: 'multiply', left: { type: 'number', value: 2 }, right: { type: 'number', value: 3 } }
};

console.log(evaluate(expression)); // 11
console.log(prettyPrint(expression)); // "(5 + (2 * 3))"
```
**FP Best Practice:**
Use pattern matching and algebraic data types for operations on data structures.

---

## 22. Strategy Pattern

### OO Approach
**Intent:** Define a family of algorithms, encapsulate each one, and make them interchangeable.

### OO Example
```typescript
// Context class that uses strategies
class NumberSorter {
  constructor(private strategy: SortStrategy) {}
  setStrategy(s: SortStrategy) { this.strategy = s; }
  sort(arr: number[]) { return this.strategy.sort(arr); }
}

// Usage
const sorter = new NumberSorter(new QuickSortStrategy());
console.log(sorter.sort([3, 1, 4, 1, 5, 9, 2, 6]));
```
> **Why this is OO:** The algorithm family is encapsulated behind a common interface and swapped at runtime—exactly what higher-order functions do in the FP sample.

### FP Equivalent
**Functional Approach:**
- Pass functions as parameters (higher-order functions).
- Use function composition to combine algorithms.
- Use algebraic data types for strategy selection.

**Example:**
```typescript
// OO: Strategy interface -> Concrete strategies -> Context
// FP:
type SortStrategy = (arr: number[]) => number[];

const quickSort: SortStrategy = arr => {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x <= pivot);
  const right = arr.slice(1).filter(x => x > pivot);
  return [...this.sort(left), pivot, ...this.sort(right)];
};

const mergeSort: SortStrategy = arr => {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
};

const bubbleSort: SortStrategy = arr => {
  const res = [...arr];
  for (let i = 0; i < res.length; i++) {
    for (let j = 0; j < res.length - i - 1; j++) {
      if (res[j] > res[j + 1]) {
        [res[j], res[j + 1]] = [res[j + 1], res[j]];
      }
    }
  }
  return res;
};

// Helper for merge sort
function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  while (left.length && right.length) {
    result.push(left[0] <= right[0] ? left.shift()! : right.shift()!);
  }
  return [...result, ...left, ...right];
}

// Context
const sortArray = (arr: number[], strategy: SortStrategy) => strategy(arr);

// Usage
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
sortArray(numbers, quickSort);  // Quick sort
sortArray(numbers, mergeSort);  // Merge sort
sortArray(numbers, bubbleSort); // Bubble sort
```
**FP Best Practice:**
Use higher-order functions to inject behavior and make algorithms composable.

---

## Summary

This mapping demonstrates how functional programming naturally solves many of the same problems as object-oriented design patterns, often with simpler, more composable solutions. The key insights are:

1. **Functions over Classes**: Use functions and higher-order functions instead of classes and inheritance
2. **Composition over Inheritance**: Use function composition to build complex behaviors
3. **Immutable Data**: Use immutable data structures and pure functions
4. **Algebraic Data Types**: Use tagged unions and pattern matching for complex data structures
5. **Monads**: Use monads for handling side effects, errors, and complex computations

The functional approach often leads to more testable, composable, and maintainable code by emphasizing pure functions and immutable data over mutable state and complex object hierarchies. 