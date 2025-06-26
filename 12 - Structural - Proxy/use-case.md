# Proxy Pattern – Real-World Use Cases

## Overview

| # | Title | npm Demo |
|---|-------|----------|
| 1 | API Response Cache Proxy | `npm run proxy:cache` |
| 2 | Role-Based Access Security Proxy | `npm run proxy:security` |
| 3 | Remote Service (gRPC) Proxy | `npm run proxy:remote` |
| 4 | Virtual Image Loader Proxy | `npm run proxy:lazy` |
| 5 | Rate-Limiting Proxy | `npm run proxy:rate` |

---
## Use Case 1: API Response Cache Proxy

### Problem
A front-end app calls a slow pricing API ~500 times per minute. Repeated identical requests waste latency and server budget.

### Solution
`CachingProxy` implements the same `getPrice(sku)` interface. It keeps an in-memory `Map` keyed by SKU; hit = return cached data, miss = delegate to `RealPricingService` then cache result.

> Demo: `npm run proxy:cache`

---
## Use Case 2: Role-Based Access Security Proxy

### Problem
Admin endpoints in a microservice must be callable only by users with `ROLE_ADMIN`, but code reuse requires sharing the same service interface.

### Solution
`SecurityProxy` wraps the service and checks a `UserContext` before delegating; throws `ForbiddenError` on violation.

> Demo: `npm run proxy:security`

---
## Use Case 3: Remote Service Proxy

### Problem
Client app should talk to an inventory service deployed on another server *as if it were local*.

### Solution
`InventoryRemoteProxy` translates local method calls to HTTP/JSON or gRPC stubs and returns deserialised objects.

> Demo: `npm run proxy:remote`

---
## Use Case 4: Virtual Image Loader Proxy

### Problem
High-resolution product images slow down initial page load.

### Solution
`ImageProxy` shows a low-res placeholder and only loads the real image when `display()` is first called.

> Demo: `npm run proxy:lazy`

---
## Use Case 5: Rate-Limiting Proxy

### Problem
A public weather API allows only 60 requests/minute per API key; exceed and it shuts off.

### Solution
`RateLimiterProxy` counts calls and queues/rejects when the limit is hit, while keeping the same service interface.

> Demo: `npm run proxy:rate`

---

### Best Practices / Anti-Patterns
* ✅ Make proxy behaviour transparent for legitimate calls.
* ✅ Keep proxies thin; avoid business logic leaks.
* ❌ Don't turn proxies into God-objects combining unrelated concerns. 