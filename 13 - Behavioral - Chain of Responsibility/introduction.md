# Chain of Responsibility Pattern

## What is the Pattern?
The Chain of Responsibility Pattern passes requests along a chain of handlers until one of them handles it. Each handler either processes the request or passes it to the next handler in the chain.

## Key Participants
| Role | Responsibility |
|------|---------------|
| Handler (Interface) | Defines interface for handling requests and linking to successor |
| ConcreteHandler | Handles requests it can process; forwards others to successor |
| Client | Initiates requests to the chain |

## Key Characteristics
- Each handler has a reference to the next handler in the chain
- Handlers can process requests or pass them along
- Chain can be built dynamically at runtime
- Request flows until handled or reaches end of chain

## How it Works
1. Client sends request to first handler in chain
2. Each handler checks if it can process the request
3. If yes: process and stop chain
4. If no: pass to next handler
5. If no handler can process: request is unhandled

## Structure
```
Client → Handler1 → Handler2 → Handler3
```

## Benefits
✅ Decouples request sender from request handlers  
✅ Allows dynamic chain composition  
✅ Single Responsibility: each handler has one job  
✅ Open/Closed: add new handlers without changing existing code

## Drawbacks
❌ No guarantee request will be handled  
❌ Can be hard to debug chain flow  
❌ Performance overhead from chain traversal

## When to Use / Avoid
Use when:
- Multiple objects can handle a request
- Handler set is not known in advance
- You want to issue a request to one of several objects without specifying the receiver explicitly
Avoid when:
- Request must be handled by a specific object
- Chain becomes too long or complex

## Real-World Examples
- HTTP middleware chains (Express.js)
- Event handling in UI frameworks
- Logging frameworks with different log levels
- Exception handling in try-catch chains
- Authentication/authorization pipelines

## Common Implementation Variations
- **Pure Chain**: each handler decides to process or forward
- **Default Handler**: always processes if no other handler can
- **Chain Building**: factory methods to construct chains
- **Handler Removal**: dynamic chain modification

## Related Patterns
- Command (encapsulates request as object)
- Decorator (adds behavior to individual objects)
- Observer (notifies multiple objects of events) 