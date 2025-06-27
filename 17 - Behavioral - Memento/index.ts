import { exit } from 'process';

console.log('=== MEMENTO PATTERN ===\n');

console.log('📚 Overview:');
console.log('The Memento pattern provides the ability to restore an object to its previous state.');
console.log('It captures and externalizes an object\'s internal state for later restoration.\n');

console.log('🎯 Key Participants:');
console.log('• Originator: Creates and uses mementos to save/restore state');
console.log('• Memento: Stores the internal state of the Originator');
console.log('• Caretaker: Manages and stores mementos\n');

console.log('💡 Use Cases:');
console.log('1. Text Editor Undo/Redo System');
console.log('2. Graphics Application Drawing History');
console.log('3. Database Transaction Rollback');
console.log('4. Game Save System');
console.log('5. Configuration Management System\n');

console.log('🚀 Available Demos:');
console.log('• npm run memento:text-editor     - Text editor with undo/redo');
console.log('• npm run memento:graphics        - Graphics app drawing history');
console.log('• npm run memento:database        - Database transaction rollback');
console.log('• npm run memento:game            - Game save/load system');
console.log('• npm run memento:configuration   - Configuration management\n');

console.log('✅ Benefits:');
console.log('• Encapsulation preservation');
console.log('• Clean undo/redo functionality');
console.log('• State history management');
console.log('• Memory-efficient state storage\n');

console.log('❌ Drawbacks:');
console.log('• Memory usage with large histories');
console.log('• Performance overhead for state serialization');
console.log('• Increased complexity');
console.log('• State synchronization challenges\n');

console.log('🔗 Related Patterns:');
console.log('• Command: Often used together for undo/redo');
console.log('• State: Can use memento to restore previous states');
console.log('• Prototype: For creating deep copies in mementos');

exit(0); 