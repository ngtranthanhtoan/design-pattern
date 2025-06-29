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

### FP Equivalent
**Functional Approach:**
- Use a module or closure to encapsulate state, or simply use pure functions (stateless).
- If state is needed, use a closure to create a single instance.

**Example:**
```typescript
// Pure function (stateless, no singleton needed)
export function log(message: string) {
  console.log(message);
}

// With state (closure)
export const createLogger = () => {
  let logs: string[] = [];
  return {
    log: (msg: string) => { logs.push(msg); console.log(msg); },
    getLogs: () => [...logs]
  };
};
const logger = createLogger(); // Only one instance if you want
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

### FP Equivalent
**Functional Approach:**
- Use object spread, structured cloning, or pure functions to create copies.
- Use immutable data structures.

**Example:**
```typescript
// OO: Prototype -> clone() -> new instance
// FP:
const createUser = (name: string, email: string) => ({
  name,
  email,
  createdAt: new Date()
});

const cloneUser = (user: any) => ({ ...user });
const deepCloneUser = (user: any) => JSON.parse(JSON.stringify(user));

// Usage
const originalUser = createUser('John', 'john@example.com');
const clonedUser = cloneUser(originalUser);
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

**Typical OO Implementation:**
- Handler interface
- Concrete handlers
- Chain of handlers

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

**Typical OO Implementation:**
- Command interface
- Concrete commands
- Invoker and receiver

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

**Typical OO Implementation:**
- Iterator interface
- Concrete iterators
- Collection interface

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

**Typical OO Implementation:**
- Mediator interface
- Concrete mediator
- Colleague classes

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

**Typical OO Implementation:**
- Originator class
- Memento class
- Caretaker class

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
    setContent: (content: string) => {
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

**Typical OO Implementation:**
- Subject interface
- Observer interface
- Concrete subjects and observers

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

**Typical OO Implementation:**
- Context class
- State interface
- Concrete state classes

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

**Typical OO Implementation:**
- Abstract class with template method
- Hook methods for customization
- Concrete subclasses

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

**Typical OO Implementation:**
- Visitor interface
- Element interface
- Concrete visitors and elements

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

**Typical OO Implementation:**
- Strategy interface
- Concrete strategy classes
- Context class that uses strategies

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
  return [...quickSort(left), pivot, ...quickSort(right)];
};

const mergeSort: SortStrategy = arr => {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
};

const bubbleSort: SortStrategy = arr => {
  const result = [...arr];
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length - i - 1; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
};

// Context function
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