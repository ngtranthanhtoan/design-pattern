# Composite Pattern – Real-World Use Cases

## Overview

The Composite pattern excels when you must operate uniformly on single objects and hierarchies.  Below are five production-grade scenarios.

| # | Title | npm Demo |
|---|-------|----------|
| 1 | File System Size & Render | `npm run composite:filesystem` |
| 2 | UI Widget Tree | `npm run composite:widgets` |
| 3 | Company Org Chart | `npm run composite:org` |
| 4 | Graphic Group Transform | `npm run composite:graphics` |
| 5 | Menu & Sub-menu Structure | `npm run composite:menu` |

---
## Use Case 1: File System Composite

### Problem
Need to calculate directory size and print a tree view where folders contain nested folders/files.

### Solution
`Folder` (Composite) holds `FileSystemEntity` children; `File` (Leaf) implements size directly.  Client calls `render()` or `getSize()` on any node.

> Demo: `npm run composite:filesystem`

---
## Use Case 2: UI Widget Tree

### Problem
GUI needs containers that can hold other widgets so layout/size calculations treat buttons, labels, and panels the same.

### Solution
`Panel` (Composite) implements `Widget` and stores `Widget` children. `Button`, `Label` are leaves. Client renders or calculates size recursively.

> Demo: `npm run composite:widgets`

---
## Use Case 3: Company Org Chart

### Problem
HR dashboard must roll up headcount and payroll across nested departments.

### Solution
`Department` (Composite) holds `OrgComponent` members—either other departments or `Employee` leaves. Aggregations recurse through the tree.

> Demo: `npm run composite:org`

---
## Use Case 4: Graphic Group Transform

### Problem
Graphic editor must move/scale grouped shapes as a single entity.

### Solution
`Group` composite stores `Graphic` children (`Shape` leaves). Transform methods propagate recursively.

> Demo: `npm run composite:graphics`

---
## Use Case 5: Menu Composite

### Problem
Application menu requires uniform enable/disable and render for nested menus and items.

### Solution
`Menu` composite holds `MenuComponent` children; `MenuItem` is leaf. Enabling a Menu cascades to its children.

> Demo: `npm run composite:menu`

---
## Best Practices & Anti-Patterns

* Prefer **safe composite** so leaves don't expose meaningless `add/remove`.
* Cache expensive aggregate values if tree rarely changes.
* Beware of unrestricted recursion depth in user-generated trees. 