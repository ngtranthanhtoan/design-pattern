# Facade Pattern

## What is the Pattern?
The Facade Pattern provides a unified, higher-level interface to a set of interfaces in a subsystem, making the subsystem easier to use.

## Key Participants
- **Facade** – the simplified wrapper that clients interact with.
- **Subsystem Classes** – complex components the facade coordinates.

## Key Characteristics
- Simplifies complex subsystems
- Promotes loose coupling between client and subsystem
- Can layer multiple facades for different client needs

## How it Works
Client → Facade → (multiple) Subsystem classes. Facade translates simple calls into appropriate subsystem method invocations and orchestrates order.

## Structure
```
+---------+
|  Client |
+---------+
     |
     v
+---------+        +---------------+
| Facade  | -----> | Subsystem A   |
+---------+ -----> | Subsystem B   |
                  +---------------+
```

## Benefits
✅ Lowers learning curve for complex APIs  
✅ Decouples client from subsystem evolution  
✅ Encourages better layering/packaging

## Drawbacks
❌ Additional abstraction to maintain  
❌ May become God-object if it grows unchecked

## When to Use / Avoid
Use when you have a **messy or verbose API** that scares consumers. Avoid if subsystem is already simple or you need fine-grained control.

## Real-World Examples
- `@angular/http` vs. XHR  
- AWS SDK `S3Client` façade over REST calls  
- `git` high-level commands vs. low-level plumbing

## Common Implementation Variations
- **Two-way facade** exposing both simple and advanced knobs  
- **Layered facades** (UI Facade → App Facade → Infra Facade)

## Related Patterns
- Adapter (different intent: interface mismatch)  
- Mediator (centralized communication) 