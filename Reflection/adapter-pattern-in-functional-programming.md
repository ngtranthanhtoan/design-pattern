# Adapter Pattern in Functional Programming

> "When the shape doesn't fit, transform the data – not the objects."

Traditional (OO) Adapter introduces a new **class** that implements the _Target_ interface and delegates to an incompatible **Adaptee** instance.  In the functional world we favour **pure functions** and **algebraic data types (ADTs)** over mutable objects, so the way we _adapt_ things changes dramatically.

This article explores what the Adapter pattern looks like in a purely-functional TypeScript code-base, how it differs from the OO version, and where you already use it every day without realising.

---
## 1. Recap – OO Adapter in 20 seconds

```mermaid
flowchart LR
    Client -- expects --> Target
    Target -. implemented by .-> Adapter
    Adapter --> Adaptee
```
* **Target** – interface the client knows.
* **Adaptee** – the existing, incompatible API.
* **Adapter** – concrete class implementing `Target` but forwarding to `Adaptee` (transforming calls/results on the way).

---
## 2. Functional Perspective – Everything Is a Function

1. **No mutable objects** → we can't (and don't want to) wrap stateful objects.
2. **Opaque data** → ADTs (`Option`, `Either`, tuples, records).
3. **Composable transformations** → we favour small, pure functions that convert _data_ or _types_ rather than wrapping behaviour inside a new class.

Therefore the "adapter" becomes **a pure, higher-order function** (HOF) that:

* _takes_ a function / observable / promise / ADT in the _adaptee_ shape
* _returns_ another function / observable / promise / ADT in the _target_ shape

```ts
// Generic adapter signature
function adapt<A, B>(adaptee: A, transform: (a: A) => B): B {
  return transform(adaptee);
}
```

> If classes hide behaviour, functions _reveal_ it – making adaptation just another transformation in your pipeline.

---
## 3. Real-World Functional Adapters

### 3.1 Node `util.promisify`

```ts
import { promisify } from "util";
import { writeFile } from "fs";

// writeFile(cb)  ->  writeFileAsync returning Promise
const writeFileAsync = promisify(writeFile);
await writeFileAsync("output.txt", "Hello");
```
Here `promisify` is a **function adapter** converting a _callback-style_ API (adaptee) into the _Promise_ interface (target) the rest of your code expects.

---
### 3.2 EventEmitter → Promise (`once` helper)

Node ships with `events.once` which adapts the **event-emitter** callback style into a **Promise** that resolves the first time the event fires.

```ts
import { EventEmitter, once } from "events";

const ee = new EventEmitter();

async function waitForReady() {
  // Target interface we want:  Promise<void>
  await once(ee, "ready");   // adaptee: EventEmitter
}

// Somewhere else
setTimeout(() => ee.emit("ready"), 500);
await waitForReady();
console.log("Service is ready!");
```

`once(emitter, event)` is a built-in functional adapter used widely when bridging legacy event APIs with modern async/await workflows.

---
### 3.3 Natural Transformations Between Functors

A _natural transformation_ converts values inside one functor (e.g. `Option`) to another functor (`Either`) **without inspecting the value** – only the structure.

```ts
import { Option, Either, none, some, left, right } from "fp-ts";

const optionToEither = <E, A>(error: E) =>
  (opt: Option<A>): Either<E, A> =>
    opt._tag === "None" ? left(error) : right(opt.value);
```
This is the canonical algebraic form of the Adapter pattern.

---
### 3.4 Currying & Partial Application

Turning an _N-ary_ function into a series of unary functions is also an adaptation:

```ts
function add(a: number, b: number): number { return a + b; }

const curriedAdd = (a: number) => (b: number) => add(a, b);
curriedAdd(3)(4); // 7
```
Now callers can use pipe-friendly point-free style.

---
### 3.5 Express `async`-Route Adapter

Production Node apps often use Express.  If you write `async`/`await` route handlers they **must** forward errors to `next()` or they get swallowed.  A tiny adapter solves that:

```ts
import { Request, Response, NextFunction } from "express";

// adaptee (what we want): async (req, res) => await …
// target   (what Express expects): (req, res, next) => void
export const asyncRoute = <R>(
  fn: (req: Request, res: Response) => Promise<R>
) => (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

// usage
app.get("/users/:id", asyncRoute(async (req, res) => {
  const user = await db.user.find(req.params.id);
  res.json(user);
}));
```

This adapter is deployed millions of times across real-world Express code-bases.

---
### 3.6 Data Transfer Object (DTO) ↔ Domain Model Mapper

Most enterprise apps separate **transport DTOs** from **domain models**.  A pure adapter keeps that mapping in one place:

```ts
// REST payload coming from FE or 3rd-party API
interface UserDTO { id: string; first_name: string; last_name: string; }

// Rich domain model used internally
interface User  { id: string; fullName: string; }

const dtoToDomain = (dto: UserDTO): User => ({
  id: dto.id,
  fullName: `${dto.first_name} ${dto.last_name}`
});

const domainToDto = (u: User): UserDTO => ({
  id: u.id,
  first_name: u.fullName.split(" ")[0],
  last_name: u.fullName.split(" ")[1]
});
```

These two pure functions serve exactly the same purpose as an OO Adapter class but remain trivially testable and composable.

---
## 4. Implementing an Adapter Function – Case Study

Suppose our analytics SDK still exposes a **callback** API:

```ts
// legacy-analytics.ts
export function track(event: string, data: unknown, cb: (err?: Error) => void): void {
  /* … */ cb();
}
```
We want a modern Promise-based API:

```ts
export interface Analytics {
  track(event: string, data: unknown): Promise<void>;
}
```
### 4.1 Adapter Implementation
```ts
import * as legacy from "./legacy-analytics";

export const analytics: Analytics = {
  track: (event, data) => new Promise((resolve, reject) =>
    legacy.track(event, data, err => err ? reject(err) : resolve())
  )
};
```
A single pure function (inside an object literal) replaces the OO adapter class.

### 4.2 Usage
```ts
await analytics.track("page_view", { url: "/docs" });
```

---
## 5. Best Practices

| OO Adapter | Functional Equivalent |
|------------|----------------------|
| Encapsulate mutable state inside class | Remain stateless & pure where possible |
| Implement `Target` interface | Export a function with the desired signature |
| Translate data inside methods | Transform arguments *before* calling adaptee; transform results *after* |
| Registry of adapters | Ordinary object/record mapping keys to functions |

Guidelines:
1. **Purity first** – adapter functions should not introduce side-effects of their own.
2. **Idempotence** – applying the adapter twice should not double-wrap your values.
3. **Type safety** – leverage TypeScript generics so the compiler enforces correct adaptation.
4. **Composition over configuration** – treat adapters like Lego bricks in your functional pipeline (`pipe`, `compose`).

---
## 6. Anti-Patterns & Pitfalls

* **Stateful wrappers** – relying on hidden mutable refs defeats the functional model.
* **Adapter-hell** – too many tiny conversions; favour converging to a _single canonical representation_.
* **Leaky abstractions** – don't expose adaptee error codes directly; map them.

---
## 7. Conclusion

In functional programming an *Adapter* is rarely a _thing_ – it is a _pure transformation_.  By treating interfaces as types and behaviours as functions we adapt by **composing** rather than **wrapping**.  The design remains simple, testable and mathematically predictable.

Next time you call `util.promisify`, wrap an Express route, or convert an `EventEmitter` to a Promise, remember: you are applying the Adapter pattern – the functional way.

---
### Further Reading
* _Functional Programming in JavaScript_ – Luis Atencio
* _Category Theory for Programmers_ – Bartosz Milewski (chapters on natural transformations)
* Node.js `util.promisify` documentation
* Node.js `events.once` documentation
* `fp-ts` conversions between `Option`, `Either`, `Task` etc. 