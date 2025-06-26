import { exit } from 'process';
console.log('🛡️ PROXY PATTERN - Overview');
const useCases=[
 {name:'Caching Proxy',cmd:'npm run proxy:cache'},
 {name:'Security Proxy',cmd:'npm run proxy:security'},
 {name:'Remote Service Proxy',cmd:'npm run proxy:remote'},
 {name:'Lazy Image Proxy',cmd:'npm run proxy:lazy'},
 {name:'Rate Limiting Proxy',cmd:'npm run proxy:rate'},
];
useCases.forEach((u,i)=>console.log(`${i+1}. ${u.name} -> ${u.cmd}`));
exit(0);
export {}; 