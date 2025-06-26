import { exit } from 'process';
console.log('⛓️ CHAIN OF RESPONSIBILITY PATTERN - Overview');
const useCases=[
 {name:'HTTP Request Validation Chain',cmd:'npm run cor:http'},
 {name:'Logging Level Chain',cmd:'npm run cor:logging'},
 {name:'Purchase Approval Chain',cmd:'npm run cor:purchase'},
 {name:'Support Ticket Escalation',cmd:'npm run cor:support'},
 {name:'Email Spam Filter Chain',cmd:'npm run cor:email'},
];
useCases.forEach((u,i)=>console.log(`${i+1}. ${u.name} -> ${u.cmd}`));
exit(0);
export {}; 