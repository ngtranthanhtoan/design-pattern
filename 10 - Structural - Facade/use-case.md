# Facade Pattern – Real-World Use Cases

## Overview

| # | Title | npm Demo |
|---|-------|----------|
| 1 | Home Theater Facade | `npm run facade:home` |
| 2 | Payment Processing Facade | `npm run facade:payment` |
| 3 | Notification Service Facade | `npm run facade:notify` |
| 4 | Cloud Deployment Facade | `npm run facade:cloud` |
| 5 | API Client Facade | `npm run facade:api` |

---
## Use Case 1: Home Theater Facade

### Problem
Configuring a home theater involves dozens of steps (turn on amplifier, set input, dim lights, lower screen). Clients don't want to issue each command manually.

### Solution
`HomeTheaterFacade` wraps subsystem classes (`Amplifier`, `Projector`, `Lights`, `Screen`, `StreamingPlayer`). It exposes `watchMovie()` and `endMovie()` to orchestrate operations.

> Demo: `npm run facade:home`

---
## Use Case 2: Payment Processing Facade

### Problem
An e-commerce platform integrates multiple payment gateways (Stripe, PayPal, Square). Different APIs complicate checkout flow.

### Solution
`PaymentFacade` offers unified `charge(card, amount)` & `refund(txId)` wrapping specific gateway SDKs.

> Demo: `npm run facade:payment`

---
## Use Case 3: Notification Service Facade

### Problem
Sending notifications via Email, SMS, and Push involves different SDKs/providers.

### Solution
`NotificationFacade` exposes `send(userId, message, channels)` and delegates to provider-specific services.

> Demo: `npm run facade:notify`

---
## Use Case 4: Cloud Deployment Facade

### Problem
Provisioning infrastructure requires many low-level API calls across compute, storage, networking services.

### Solution
`CloudDeploymentFacade` simplifies operations like `deployWebApp(config)` by coordinating Terraform/AWS CDK commands behind the scenes.

> Demo: `npm run facade:cloud`

---
## Use Case 5: API Client Facade

### Problem
Front-end apps need to interact with REST endpoints but handling fetch, headers, errors, retries is repetitive.

### Solution
`ApiClientFacade` offers methods (`getUsers()`, `createOrder()`) hiding HTTP complexities.

> Demo: `npm run facade:api`

---

### Best Practices / Anti-Patterns
* ✅ Keep facade surface **task-oriented** (watchMovie) not just pass-through wrappers.
* ✅ Let subsystem classes remain accessible for advanced users.
* ❌ Don't cram unrelated responsibilities into one facade.
* ❌ Avoid making facade mandatory for all usage; flexibility matters. 