import { exit } from 'process';
console.log('🎀 DECORATOR PATTERN - Overview');
const useCases=[
 {name:'HTTP Middleware',cmd:'npm run decorator:http'},
 {name:'Logger Decorators',cmd:'npm run decorator:logger'},
 {name:'UI Component Decorators',cmd:'npm run decorator:ui'},
 {name:'Encryption Stream Decorators',cmd:'npm run decorator:encrypt'},
 {name:'Repository Validation Decorator',cmd:'npm run decorator:repo'},
];
useCases.forEach((u,i)=>console.log(`${i+1}. ${u.name} -> ${u.cmd}`));
exit(0);
export {}; 