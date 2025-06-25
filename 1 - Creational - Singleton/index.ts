// ============================================================================
// SINGLETON PATTERN - ALL USE CASES INDEX
// ============================================================================

import { exit } from "process";

// Re-export all singleton classes (but don't run their demos automatically)
// Note: Importing these files runs their demonstrations
// For individual testing, use the npm scripts below

console.log('🎯 Singleton Pattern - Individual Use Cases Available:');
console.log('• ConfigurationManager - App settings management');
console.log('• ApplicationLogger - Centralized logging');
console.log('• CacheManager - In-memory caching with TTL');
console.log('• DatabaseManager - Fake database connections');
console.log('• EventBus - Pub/Sub communication');
console.log('\n📋 Run individual examples:');
console.log('npm run singleton:config    - Configuration Manager');
console.log('npm run singleton:logger    - Application Logger');
console.log('npm run singleton:cache     - Cache Manager');
console.log('npm run singleton:database  - Database Manager');
console.log('npm run singleton:eventbus  - Event Bus');
console.log('npm run singleton           - All examples together');
exit(0); 