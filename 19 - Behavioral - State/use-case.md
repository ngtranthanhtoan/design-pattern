# State Pattern Use Cases

## Overview

The State pattern is essential for managing complex object behavior that changes based on internal state. It's particularly valuable in systems where objects need to behave differently depending on their current state, such as vending machines, game characters, order processing systems, and workflow engines. The pattern eliminates complex conditional logic and makes state transitions explicit and manageable.

## Use Case 1: Vending Machine State Management

### Problem
A vending machine needs to handle different behaviors based on its current state (idle, selecting, dispensing, out of stock). Using conditional statements leads to complex, hard-to-maintain code with many if-else branches that make it difficult to add new states or modify existing behavior.

### Solution
Implement the State pattern with separate classes for each vending machine state. The VendingMachine context delegates all operations to the current state object, which handles state-specific behavior and manages transitions to other states.

**Target Interface**: `VendingMachineState` with methods for `insertCoin()`, `selectProduct()`, `dispense()`, and `refund()`

**Key States**: `IdleState`, `HasCoinState`, `DispensingState`, `OutOfStockState`

**Demo**: `npm run state:vending-machine`

## Use Case 2: Game Character State System

### Problem
A game character needs different behaviors for various states like idle, walking, running, jumping, and attacking. The character's movement, animation, and interaction capabilities change dramatically between states, and complex conditional logic makes the character class difficult to maintain and extend.

### Solution
Use the State pattern to encapsulate each character state in its own class. The Character context maintains the current state and delegates all actions to it. States handle their own behavior and can transition to other states based on game events.

**Target Interface**: `CharacterState` with methods for `move()`, `jump()`, `attack()`, `takeDamage()`, and `update()`

**Key States**: `IdleState`, `WalkingState`, `RunningState`, `JumpingState`, `AttackingState`, `StunnedState`

**Demo**: `npm run state:game-character`

## Use Case 3: Order Processing Workflow

### Problem
An e-commerce system needs to manage order states (pending, confirmed, processing, shipped, delivered, cancelled) with different business rules and actions for each state. Complex state-dependent logic scattered throughout the codebase makes it difficult to understand the order lifecycle and add new states.

### Solution
Implement the State pattern to represent each order state as a separate class. The Order context delegates all operations to the current state, which enforces business rules and manages state transitions. This makes the order lifecycle explicit and easy to understand.

**Target Interface**: `OrderState` with methods for `confirm()`, `process()`, `ship()`, `deliver()`, `cancel()`, and `refund()`

**Key States**: `PendingState`, `ConfirmedState`, `ProcessingState`, `ShippedState`, `DeliveredState`, `CancelledState`

**Demo**: `npm run state:order-processing`

## Use Case 4: Traffic Light Control System

### Problem
A traffic light system needs to cycle through states (red, yellow, green) with automatic transitions and different timing rules for each state. The system must also handle emergency modes and pedestrian crossing requests. Complex timing logic mixed with state management creates hard-to-maintain code.

### Solution
Use the State pattern to represent each traffic light state. Each state manages its own timing and transition logic, while the TrafficLight context coordinates the overall system. States can handle external events like emergency signals or pedestrian requests.

**Target Interface**: `TrafficLightState` with methods for `enter()`, `exit()`, `update()`, and `handleEmergency()`

**Key States**: `RedState`, `YellowState`, `GreenState`, `EmergencyState`, `PedestrianState`

**Demo**: `npm run state:traffic-light`

## Use Case 5: Ticket Support System

### Problem
A customer support system needs to manage ticket states (new, assigned, in progress, waiting for customer, resolved, closed) with different permissions, actions, and business rules for each state. Complex state-dependent logic and agent assignment workflows make the system difficult to maintain and extend.

### Solution
Implement the State pattern to encapsulate ticket states. Each state class handles its own permissions, available actions, and transition rules. The SupportTicket context delegates all operations to the current state, making the ticket lifecycle explicit and manageable.

**Target Interface**: `TicketState` with methods for `assign()`, `startWork()`, `requestInfo()`, `provideInfo()`, `resolve()`, `close()`, and `reopen()`

**Key States**: `NewState`, `AssignedState`, `InProgressState`, `WaitingForCustomerState`, `ResolvedState`, `ClosedState`

**Demo**: `npm run state:ticket-support`

## Use Case 6: Document Workflow Management

### Problem
A document management system needs to handle document states (draft, review, approved, published, archived) with different permissions, actions, and validation rules for each state. Complex permission checks and state-dependent validation logic make the system difficult to maintain and extend.

### Solution
Implement the State pattern to encapsulate document states. Each state class handles its own validation rules, permissions, and available actions. The Document context delegates all operations to the current state, making the workflow explicit and easy to modify.

**Target Interface**: `DocumentState` with methods for `edit()`, `submitForReview()`, `approve()`, `publish()`, `archive()`, and `validate()`

**Key States**: `DraftState`, `ReviewState`, `ApprovedState`, `PublishedState`, `ArchivedState`

**Demo**: `npm run state:document-workflow`

## Best Practices / Anti-Patterns

### Best Practices:
- **Clear State Transitions**: Define explicit rules for when and how states can transition
- **State Validation**: Validate state transitions to prevent invalid states
- **Entry/Exit Actions**: Use enter/exit methods for state setup and cleanup
- **State Encapsulation**: Keep state-specific data and behavior together
- **Single Responsibility**: Each state class should handle only one state's behavior
- **Thread Safety**: Ensure state transitions are thread-safe in concurrent systems

### Anti-Patterns:
- **State Explosion**: Creating too many states that make the system complex
- **Tight Coupling**: States knowing too much about other states or the context
- **Circular Dependencies**: States creating circular references
- **State Leakage**: State-specific data leaking into the context
- **Complex Transitions**: Overly complex state transition logic
- **God Context**: Making the context class too large and complex
- **Conditional Logic**: Falling back to if-else statements instead of using state delegation 