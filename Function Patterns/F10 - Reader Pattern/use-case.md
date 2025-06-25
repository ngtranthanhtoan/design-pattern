# Reader Pattern - Use Cases

## Overview

This document explores practical applications of the Reader pattern in real-world scenarios. Each use case demonstrates how the Reader pattern can solve dependency injection and environment-passing problems in a functional, type-safe way.

---

## Use Case 1: Application Configuration Management

### Problem
You need to access application configuration (e.g., database URLs, API keys, feature flags) throughout your codebase, but want to avoid global variables and make testing easy.

### Solution
Use the Reader pattern to inject configuration into functions, making dependencies explicit and testable.

### Example
```typescript
interface AppConfig {
  databaseUrl: string;
  apiKey: string;
  featureFlag: boolean;
}

const getDatabaseUrl = new Reader<AppConfig, string>(config => config.databaseUrl);
const getApiKey = new Reader<AppConfig, string>(config => config.apiKey);

// Compose readers
default const getConnectionString = getDatabaseUrl.map(url => `postgres://${url}`);
```

### Benefits
- No global state
- Easy to test with different configs
- Explicit dependencies

---

## Use Case 2: Dependency Injection for Services

### Problem
You want to inject services (e.g., logger, mailer, database) into business logic without using a DI framework or singletons.

### Solution
Model the environment as a record of services and use the Reader to inject them.

### Example
```typescript
interface Env {
  logger: Logger;
  mailer: Mailer;
}

const sendWelcomeEmail = new Reader<Env, void>(env => {
  env.logger.info('Sending welcome email');
  env.mailer.send('user@example.com', 'Welcome!');
});
```

### Benefits
- No singletons
- Easy to mock services in tests
- Pure functions

---

## Use Case 3: API Request Pipelines

### Problem
You need to make API requests that depend on shared configuration (e.g., base URL, auth token) and want to avoid passing config everywhere.

### Solution
Use the Reader to thread API config through the request pipeline.

### Example
```typescript
interface ApiEnv {
  baseUrl: string;
  token: string;
}

const getUser = (id: string) => new Reader<ApiEnv, Promise<User>>(env =>
  fetch(`${env.baseUrl}/users/${id}`, {
    headers: { Authorization: `Bearer ${env.token}` }
  }).then(res => res.json())
);
```

### Benefits
- No manual config passing
- Easy to swap environments (dev, prod, test)
- Composable API logic

---

## Use Case 4: Testing with Mock Environments

### Problem
You want to test business logic that depends on environment/config/services, but need to swap in mocks or stubs for tests.

### Solution
Use the Reader to inject mock environments for tests.

### Example
```typescript
const mockEnv: Env = {
  logger: { info: msg => console.log('[MOCK LOG]', msg) },
  mailer: { send: (to, msg) => console.log(`[MOCK EMAIL] to ${to}: ${msg}`) }
};

sendWelcomeEmail.run(mockEnv); // Uses mock logger and mailer
```

### Benefits
- No global test setup
- Isolated, pure tests
- Easy to swap real/mocked dependencies

---

## Use Case 5: Composing Business Logic with Shared Context

### Problem
You have multiple business logic functions that all depend on the same context (e.g., user session, request info, config), and want to compose them cleanly.

### Solution
Use the Reader to compose context-dependent functions.

### Example
```typescript
interface RequestContext {
  user: { id: string; role: string };
  config: AppConfig;
}

const getUserRole = new Reader<RequestContext, string>(ctx => ctx.user.role);
const isAdmin = getUserRole.map(role => role === 'admin');

const canAccessFeature = isAdmin.flatMap(admin =>
  new Reader<RequestContext, boolean>(ctx => admin || ctx.config.featureFlag)
);
```

### Benefits
- Clean composition
- No manual context passing
- Type-safe business logic

---

## Industry Use & Modern Alternatives
- **Functional libraries**: fp-ts (Reader), Ramda, Sanctuary
- **Backend frameworks**: Used for config, DI, and context in Node.js, Scala, Haskell
- **Alternatives**: Context objects, DI frameworks, React Context API

## Best Practices
- Keep environments small and focused
- Use Reader for pure, context-dependent logic
- Compose Readers for complex flows
- Avoid using Reader for side effects

## Anti-Patterns
- Using Reader for simple, non-contextual logic
- Overly large or deeply nested environments
- Mixing side effects with Reader logic

## Conclusion
The Reader pattern is a powerful tool for dependency injection and context management in functional programming. It enables pure, testable, and composable code, especially in complex applications with shared configuration or services. 