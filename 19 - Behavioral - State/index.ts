#!/usr/bin/env ts-node

import { exit } from "process";

/**
 * State Pattern - Behavioral Pattern
 * 
 * Allows an object to alter its behavior when its internal state changes.
 * The object will appear to change its class.
 */

console.log("🎯 State Pattern - Individual Use Cases Available:");
console.log("• DocumentWorkflow - Document approval workflow states");
console.log("• GameCharacter - Character state management in games");
console.log("• OrderProcessing - E-commerce order processing states");
console.log("• TicketSupport - Support ticket lifecycle states");
console.log("• TrafficLight - Traffic light state transitions");
console.log("• VendingMachine - Vending machine operation states");
console.log();

console.log("📋 Run individual examples:");
console.log("npm run state:document-workflow - Document Workflow State");
console.log("npm run state:game-character    - Game Character State");
console.log("npm run state:order-processing  - Order Processing State");
console.log("npm run state:ticket-support    - Ticket Support State");
console.log("npm run state:traffic-light     - Traffic Light State");
console.log("npm run state:vending-machine   - Vending Machine State");
console.log();

console.log("🔍 Pattern Overview:");
console.log("The State pattern allows an object to change its behavior when its internal state changes.");
console.log("This pattern is useful when an object's behavior depends on its state and the object");
console.log("must change its behavior at runtime depending on that state.");
console.log();

console.log("📚 Key Benefits:");
console.log("✅ Eliminates large conditional statements");
console.log("✅ Encapsulates state-specific behavior");
console.log("✅ Makes state transitions explicit");
console.log("✅ Follows Single Responsibility Principle");
console.log("✅ Makes adding new states easier");
console.log();

console.log("🎯 Common Use Cases:");
console.log("• Workflow management systems");
console.log("• Game state management");
console.log("• Order processing systems");
console.log("• Support ticket systems");
console.log("• Traffic control systems");
console.log("• Vending machines and ATMs");
console.log();

exit(0); 