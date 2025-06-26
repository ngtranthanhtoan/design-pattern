import { exit } from 'process';

console.log('🔄 ITERATOR PATTERN');
console.log('===================\n');

console.log('The Iterator pattern provides a way to access collection elements sequentially');
console.log('without exposing the underlying representation. It decouples collection from');
console.log('traversal logic and enables uniform iteration across different data structures.\n');

console.log('📁 Available Demos:');
console.log('===================');
console.log('1. Database Result Set     - npm run iterator:database');
console.log('2. File System Traversal   - npm run iterator:filesystem');
console.log('3. Tree Structure Iterator - npm run iterator:tree');
console.log('4. Stream Processing       - npm run iterator:stream');
console.log('5. GUI Component Iterator  - npm run iterator:gui\n');

console.log('🔑 Key Concepts:');
console.log('================');
console.log('• Iterator Interface - Defines hasNext() and next() contract');
console.log('• Concrete Iterators - Implement specific traversal logic');
console.log('• Collection Interface - Provides iterator creation methods');
console.log('• Lazy Evaluation - Elements loaded on-demand');
console.log('• Multiple Iterators - Same collection, different traversal\n');

console.log('💡 Common Use Cases:');
console.log('====================');
console.log('• Database result set processing');
console.log('• File system traversal');
console.log('• Tree structure navigation');
console.log('• Stream data processing');
console.log('• GUI component iteration\n');

console.log('🎯 Iterator Types:');
console.log('==================');
console.log('• Basic Iterator - Forward-only traversal');
console.log('• Bidirectional Iterator - Forward and backward');
console.log('• Filtering Iterator - Conditional element access');
console.log('• Lazy Iterator - On-demand element loading');
console.log('• Composite Iterator - Multiple collection traversal\n');

console.log('📚 Documentation:');
console.log('=================');
console.log('• introduction.md - Pattern theory and structure');
console.log('• use-case.md - Real-world applications');
console.log('• use-case-*.ts - Individual demo implementations\n');

exit(0); 