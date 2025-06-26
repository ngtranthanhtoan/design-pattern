import { exit } from 'process';

console.log('🎮 COMMAND PATTERN');
console.log('==================\n');

console.log('The Command pattern encapsulates a request as an object, allowing you to:');
console.log('• Parameterize clients with different requests');
console.log('• Queue operations and support undoable operations');
console.log('• Decouple the requester from the receiver\n');

console.log('📁 Available Demos:');
console.log('===================');
console.log('1. Text Editor Operations    - npm run command:text-editor');
console.log('2. Smart Home Automation     - npm run command:smart-home');
console.log('3. Restaurant Order System   - npm run command:restaurant');
console.log('4. Game Input Handling       - npm run command:game-input');
console.log('5. Database Transaction      - npm run command:database\n');

console.log('🔑 Key Concepts:');
console.log('================');
console.log('• Command Interface - Defines execute() contract');
console.log('• Concrete Commands - Implement specific operations');
console.log('• Invoker - Triggers command execution');
console.log('• Receiver - Performs the actual work');
console.log('• Client - Creates and configures commands\n');

console.log('💡 Common Use Cases:');
console.log('====================');
console.log('• GUI button actions and menu items');
console.log('• Undo/redo functionality');
console.log('• Macro recording and playback');
console.log('• Remote procedure calls');
console.log('• Transaction processing\n');

console.log('📚 Documentation:');
console.log('=================');
console.log('• introduction.md - Pattern theory and structure');
console.log('• use-case.md - Real-world applications');
console.log('• use-case-*.ts - Individual demo implementations\n');

exit(0); 