import { exit } from 'process';

console.log('🔄 MEDIATOR PATTERN');
console.log('==================\n');

console.log('The Mediator pattern defines an object that encapsulates how a set of objects');
console.log('interact. It promotes loose coupling by keeping objects from referring to each');
console.log('other explicitly, and lets you vary their interaction independently.\n');

console.log('📁 Available Demos:');
console.log('===================');
console.log('1. Air Traffic Control    - npm run mediator:airtraffic');
console.log('2. Chat Application       - npm run mediator:chat');
console.log('3. Smart Home Automation  - npm run mediator:smarthome');
console.log('4. E-commerce Processing  - npm run mediator:ecommerce');
console.log('5. Game Engine System     - npm run mediator:gameengine\n');

console.log('🔑 Key Concepts:');
console.log('================');
console.log('• Mediator Interface - Defines communication contract');
console.log('• Concrete Mediator - Implements coordination logic');
console.log('• Colleague Interface - Objects that communicate via mediator');
console.log('• Centralized Control - All interactions flow through mediator');
console.log('• Loose Coupling - Objects don\'t know about each other directly\n');

console.log('💡 Common Use Cases:');
console.log('====================');
console.log('• Complex object interactions');
console.log('• Event-driven architectures');
console.log('• Message routing systems');
console.log('• Service coordination');
console.log('• Component communication\n');

console.log('🎯 Mediator Types:');
console.log('==================');
console.log('• Basic Mediator - Simple message routing');
console.log('• Event-Based Mediator - Event-driven communication');
console.log('• State-Aware Mediator - State management and observation');
console.log('• Command-Based Mediator - Action encapsulation and history');
console.log('• Workflow Mediator - Process coordination and state tracking\n');

console.log('📚 Documentation:');
console.log('=================');
console.log('• introduction.md - Pattern theory and structure');
console.log('• use-case.md - Real-world applications');
console.log('• use-case-*.ts - Individual demo implementations\n');

exit(0); 