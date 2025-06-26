import { exit } from 'process';
console.log('🏠 FACADE PATTERN - Overview');
const useCases=[
 {name:'Home Theater Facade',cmd:'npm run facade:home'},
 {name:'Payment Processing Facade',cmd:'npm run facade:payment'},
 {name:'Notification Service Facade',cmd:'npm run facade:notify'},
 {name:'Cloud Deployment Facade',cmd:'npm run facade:cloud'},
 {name:'API Client Facade',cmd:'npm run facade:api'},
];
useCases.forEach((u,i)=>console.log(`${i+1}. ${u.name} -> ${u.cmd}`));
exit(0);
export {}; 