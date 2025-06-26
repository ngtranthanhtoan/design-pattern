# Flyweight Pattern – Real-World Use Cases

## Overview

| # | Title | npm Demo |
|---|-------|----------|
| 1 | Forest Rendering (Tree Flyweights) | `npm run flyweight:forest` |
| 2 | Map Marker Icons | `npm run flyweight:map` |
| 3 | Particle System | `npm run flyweight:particles` |
| 4 | Text Editor Glyphs | `npm run flyweight:glyphs` |
| 5 | UI Theme Style Cache | `npm run flyweight:styles` |

---
## Use Case 1: Forest Rendering (Tree Flyweights)

### Problem
Games often need to render **tens of thousands** of trees. Storing texture and color for every tree separately explodes memory.

### Solution
`TreeType` flyweights (texture, color) are shared across all `Tree` contexts that hold only coordinates. Factory ensures each unique type is instantiated once.

> Demo: `npm run flyweight:forest`

---
## Use Case 2: Map Marker Icons

### Problem
Maps display thousands of location pins. Icon bitmaps are identical for same category but naïve code reloads them repeatedly.

### Solution
`IconFlyweightFactory` caches `HTMLImageElement` per category, reusing across markers.

> Demo: `npm run flyweight:map`

---
## Use Case 3: Particle System

### Problem
Explosions spawn particles that share sprite and behavior data; allocating each particle's data wastes memory.

### Solution
`ParticleType` flyweight stores sprite + physics config, shared across `Particle` instances that keep position & velocity.

> Demo: `npm run flyweight:particles`

---
## Use Case 4: Text Editor Glyphs

### Problem
A document may contain millions of character objects. Each glyph's font metrics, bitmap can be shared.

### Solution
`GlyphFlyweight` stores char code & font metrics; individual `Character` keeps only x,y position.

> Demo: `npm run flyweight:glyphs`

---
## Use Case 5: UI Theme Style Cache

### Problem
Web components often duplicate identical CSS style objects at runtime, increasing memory.

### Solution
`StyleFlyweight` caches computed style declarations and shares references across components.

> Demo: `npm run flyweight:styles`

---

### Best Practices / Anti-Patterns
* ✅ Keep flyweights **immutable** so sharing is safe.
* ✅ Combine with **object pools** when extrinsic state is expensive to create.
* ❌ Don't apply when objects require identity-based equality. 