# Chain of Responsibility Pattern – Real-World Use Cases

## Overview

| # | Title | npm Demo |
|---|-------|----------|
| 1 | HTTP Request Validation Chain | `npm run cor:http` |
| 2 | Logging Level Chain | `npm run cor:logging` |
| 3 | Purchase Approval Chain | `npm run cor:purchase` |
| 4 | Support Ticket Escalation | `npm run cor:support` |
| 5 | Email Spam Filter Chain | `npm run cor:email` |

---
## Use Case 1: HTTP Request Validation Chain

### Problem
Web API needs multiple validation steps: authentication, rate limiting, input validation, and authorization. Each step can either pass the request along or reject it.

### Solution
Chain handlers: `AuthHandler` → `RateLimitHandler` → `ValidationHandler` → `AuthorizationHandler`. Each validates its concern and either forwards or returns error.

> Demo: `npm run cor:http`

---
## Use Case 2: Logging Level Chain

### Problem
Application needs different logging levels (DEBUG, INFO, WARN, ERROR) where each level handles messages of its priority and higher.

### Solution
Chain: `DebugHandler` → `InfoHandler` → `WarnHandler` → `ErrorHandler`. Each handler processes messages at its level and passes others up the chain.

> Demo: `npm run cor:logging`

---
## Use Case 3: Purchase Approval Chain

### Problem
Company has different approval levels for purchases: employees can approve up to $100, managers up to $1000, directors up to $10000, and CEO for anything above.

### Solution
Chain: `EmployeeHandler` → `ManagerHandler` → `DirectorHandler` → `CEOHandler`. Each handler checks if it can approve the amount.

> Demo: `npm run cor:purchase`

---
## Use Case 4: Support Ticket Escalation

### Problem
Customer support tickets need automatic escalation: Level 1 handles basic issues, Level 2 handles technical issues, Level 3 handles complex problems.

### Solution
Chain: `Level1Handler` → `Level2Handler` → `Level3Handler`. Each handler attempts to resolve tickets within its expertise.

> Demo: `npm run cor:support`

---
## Use Case 5: Email Spam Filter Chain

### Problem
Email system needs multiple spam detection methods: keyword filtering, sender reputation, content analysis, and machine learning scoring.

### Solution
Chain: `KeywordFilter` → `ReputationFilter` → `ContentFilter` → `MLFilter`. Each filter can mark email as spam or pass it along.

> Demo: `npm run cor:email`

---

### Best Practices / Anti-Patterns
* ✅ Keep handlers focused on single responsibility
* ✅ Ensure chain has a default/fallback handler
* ✅ Make chain order explicit and configurable
* ❌ Avoid handlers that always forward (infinite loops)
* ❌ Don't make chains too deep (performance impact) 