# Flyweight Pattern

## What is the Pattern?
The Flyweight Pattern is a structural optimization technique that reduces memory footprint by sharing immutable, **intrinsic** state between many fine-grained objects while keeping their **extrinsic** state outside the shared instances.

## Key Participants
| Role | Responsibility |
|------|----------------|
| Flyweight (TreeType) | Stores **intrinsic** state that can be shared (texture, color, shape) |
| ConcreteFlyweight | Actual shared object implementing Flyweight interface |
| FlyweightFactory | Creates/Reuses flyweights; maintains cache |
| Context (Tree) | Holds extrinsic state (x, y) and references a Flyweight |
| Client (Forest) | Uses flyweights via factory, supplies extrinsic data |

## Key Characteristics
- Shares immutable internal state across many objects
- Extrinsic state supplied at usage time
- Great for 
  * large collections of similar objects (10k+)
  * memory-constrained environments (mobile, IoT, browsers)
- Requires **identity independence** (shared instances must be treated as value objects)

## How it Works
1. Client asks `FlyweightFactory` for a flyweight of a given configuration.
2. Factory returns an existing instance if available; otherwise creates and caches a new one.
3. Client combines the flyweight with extrinsic data to perform operations (e.g., `draw(x,y)`).

## Structure
```
classDiagram
Client --> FlyweightFactory
FlyweightFactory --> Flyweight
Flyweight <|-- ConcreteFlyweight
Context --> Flyweight : has a reference
```

## Benefits
✅ Dramatically cuts down memory usage for large object graphs  
✅ Can improve cache-hit rate & CPU performance (less GC)  
✅ Encourages separation of mutable vs. immutable state

## Drawbacks
❌ Adds indirection; code becomes less intuitive  
❌ Not useful when objects carry mostly unique state  
❌ Need to manage extrinsic state carefully (thread-safety, validation)

## When to Use / Avoid
Use when:
- Application instantiates **millions** of similar objects
- Most state can be made immutable & shared
- Memory or creation time is a bottleneck
Avoid when:
- Objects are few or mostly unique
- System complexity matters more than memory footprint

## Real-World Examples
- Browser devtools: DOM CSS rule objects share style declarations  
- Google Maps markers reuse icon bitmaps  
- IDE syntax highlighting glyphs  
- Game engines: Trees, particles, bullets

## Common Implementation Variations
- **Key‐based factory** (dictionary) vs. **registry service**  
- **Thread-safe factory** in concurrent apps  
- **Flyweight pools** for object recycling

## Related Patterns
- Prototype (cloning; focuses on creation, not sharing)  
- Singleton (single shared instance but not keyed)  
- Object Pool (reuse mutable objects rather than share immutable) 