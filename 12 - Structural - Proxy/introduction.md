# Proxy Pattern

## What is the Pattern?
The Proxy Pattern provides a **surrogate or placeholder** for another object to control access to it—whether to add security, lazy-loading, caching, or remote invocation.

## Key Participants
| Role | Responsibility |
|------|---------------|
| Subject (Interface) | Common interface for RealSubject & Proxy |
| RealSubject | The actual object that does the work |
| Proxy | Controls access, adds extra behaviour, keeps reference to RealSubject |
| Client | Uses subject through the common interface |

## Key Characteristics
- Proxy implements *same* interface as RealSubject.
- Can perform actions **before / after** delegating to real object.
- Variants: *Virtual*, *Protection*, *Remote*, *Smart*, *Caching*, *Firewall*, *Logging*.

## How it Works
1. Client calls `subject.request()`.
2. Proxy decides: create real object, check permissions, fetch cache, or forward over network.
3. RealSubject executes operation.
4. Proxy may handle response (e.g., cache it) before returning to Client.

## Structure
```
Client → Proxy → RealSubject
```

## Benefits
✅ Add cross-cutting concerns without changing RealSubject.  
✅ Lazy instantiation can save memory / startup time.  
✅ Can control and monitor access centrally (security, rate limiting).

## Drawbacks
❌ Extra layer = more indirection / latency.  
❌ Wrong proxy type can hide performance problems.  
❌ Maintenance overhead if many subject interfaces.

## When to Use / Avoid
Use when you need
- Lazy or on-demand creation of heavy objects.
- Access control, logging, or caching transparently.
- Accessing remote objects as if local (RPC).
Avoid when the extra hop adds unacceptable latency.

## Real-World Examples
- Java Hibernate lazy-loading proxies.
- Nginx acting as reverse proxy & cache.
- AWS SDK clients (remote proxy over HTTP).
- Browser `ServiceWorker` caching network requests.

## Common Implementation Variations
- **Virtual Proxy** – delay creation of expensive objects (images in UI).
- **Protection Proxy** – role-based access control on services.
- **Caching Proxy** – store results of expensive calls.
- **Smart Reference** – extra housekeeping (ref counting).

## Related Patterns
- Decorator (adds behaviour but keeps identity of underlying object).
- Adapter (changes interface) vs Proxy (keeps interface). 