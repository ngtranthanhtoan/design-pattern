# Decorator Pattern – Real-World Use Cases

## Overview

| # | Title | npm Demo |
|---|-------|----------|
| 1 | Express-like HTTP Middleware | `npm run decorator:http` |
| 2 | Logger Decorators (timestamp/level) | `npm run decorator:logger` |
| 3 | Encryption Stream Decorator | `npm run decorator:encrypt` |
| 4 | UI Component Decorators | `npm run decorator:ui` |
| 5 | Repository Validation Decorator | `npm run decorator:repo` |

---
## Use Case 1: Express-like HTTP Middleware

### Problem
Need to add cross-cutting concerns (logging, auth) to HTTP handlers without altering handler code.

### Solution
`RequestHandler` component wrapped by `LoggingDecorator`, `AuthDecorator`. Decorators call `next()`.

> Demo: `npm run decorator:http` 

## Use Case 2: Logger Decorators (Timestamp / Level Filter)

### Problem
Applications often need additional context (timestamps) or dynamic filtering for logs without changing every logger call site.

### Solution
Wrap a core `ConsoleLogger` with:
* `TimestampDecorator` – npm ISO timestamp.
* `LevelFilterDecorator` – suppresses messages below a configured severity.

> Demo: `npm run decorator:logger`

---

## Use Case 3: Encryption Stream Decorator

### Problem
Files containing sensitive information must be encrypted before persisting to disk, but existing code expects a plain writable `Stream`.

### Solution
Introduce `EncryptionStreamDecorator` implementing the same `Stream` interface. It encrypts data on-the-fly (AES-256-CTR) before delegating to underlying `FileStream`. Client code continues to write unencrypted data.

> Demo: `npm run decorator:encrypt`

---

## Use Case 4: UI Component Decorators (Border / Shadow)

### Problem
Need to compose flexible UI embellishments (borders, shadows, scrollbars) without exploding subclass hierarchies like `BorderedScrollTextView`.

### Solution
Decorate a base `TextView` with `BorderDecorator`, `ShadowDecorator`, etc. Each adds its own visual responsibility while honoring the `VisualComponent` interface.

> Demo: `npm run decorator:ui`

---

## Use Case 5: Repository Validation Decorator

### Problem
Domain models must be validated before persistence. Embedding validation inside repository violates SRP and hinders reuse.

### Solution
A `ValidationRepositoryDecorator` accepts a validation function and wraps any concrete `Repository`. It intercepts `save` calls to enforce domain rules then forwards to the underlying repository.

> Demo: `npm run decorator:repo`

---

### Best Practices / Anti-Patterns
* ✅ Keep decorators **behaviorally transparent** (don't break interface contracts).
* ✅ Favor **single responsibility** per decorator to enhance composability.
* ❌ Avoid deep, mandatory decorator stacks that complicate debugging.
* ❌ Don't leak decorator specifics (e.g., require clients to call `getInner()`). 