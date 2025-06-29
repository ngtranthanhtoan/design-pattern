# Bridge Pattern – Real-World Use Cases

## Overview

Bridge lets you mix-and-match **abstractions** with **implementations**.  The following demos show how to swap implementation back-ends at runtime.

| # | Title | npm Demo |
|---|-------|----------|
| 1 | Messaging (Email, SMS, Slack) | `npm run bridge:messaging` |
| 2 | Shape Renderer (SVG, Canvas, PDF) | `npm run bridge:shapes` |
| 3 | Cloud Storage (S3, Azure, GCP) | `npm run bridge:storage` |
| 4 | Feature Flag SDK (client vs server) | `npm run bridge:featureflag` |
| 5 | Payment Gateway Bridge | `npm run bridge:payment` |

---

Below we implement the **messaging** scenario in TypeScript. 

## Use Case 1: Messaging Bridge

### Problem
Your platform must deliver notifications via Email, SMS, and Slack while supporting multiple message types (Alert, Report) without duplicating classes for every combination.

### Solution
`AlertMessage` / `ReportMessage` abstractions delegate to **Channel** implementations (`EmailChannel`, `SmsChannel`, `SlackChannel`).  Switching channels is a constructor parameter.

> Demo: `npm run bridge:messaging`

---
## Use Case 2: Shape Renderer Bridge

### Problem
A graphics library needs to draw shapes to different back-ends (SVG in browser, Canvas for previews, PDF for export) using the same high-level shape classes.

### Solution
`Circle`, `Rectangle` abstractions delegate to **Renderer** implementations (`SvgRenderer`, `CanvasRenderer`, `PdfRenderer`).  Renderer chosen at runtime.

> Demo: `npm run bridge:shapes`

---
## Use Case 3: Cloud Storage Bridge

### Problem
An SDK must read/write files across AWS S3, Azure Blob, and GCP Storage while exposing a uniform `CloudFile` API.

### Solution
Concrete files (`TxtFile`, `JsonFile`) use a **StorageProvider** (`S3Provider`, `AzureBlobProvider`, `GcpProvider`) passed in the constructor.  Upload/download is delegated.

> Demo: `npm run bridge:storage`

---
## Use Case 4: Feature Flag Bridge

### Problem
Some deployments evaluate feature flags client-side for offline support, others call a central service for targeting. You need one API.

### Solution
`FeatureFlag` abstraction delegates to an `EvaluationStrategy` (`ClientSideStrategy`, `ServerSideStrategy`). Strategy injected at runtime.

> Demo: `npm run bridge:featureflag`

---
## Use Case 5: Payment Gateway Bridge

### Problem
Business logic must support charge, refund, and subscription flows across Stripe and PayPal without duplicating service classes.

### Solution
`PaymentOperation` abstraction delegates to a `PaymentGateway` implementation (`StripeGateway`, `PayPalGateway`). Gateway chosen via DI or config.

> Demo: `npm run bridge:payment`

---
## Best Practices & Anti-Patterns

* Inject implementation via constructor or DI container—avoid service locators.
* Keep abstraction interface minimal; platform-specific methods belong in implementation.
* Beware of leaky abstractions where abstraction must expose every implementation detail. 