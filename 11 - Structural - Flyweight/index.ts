import { exit } from 'process';
console.log('🍃 FLYWEIGHT PATTERN - Overview');
const useCases=[
 {name:'Forest Rendering',cmd:'npm run flyweight:forest'},
 {name:'Map Marker Icons',cmd:'npm run flyweight:map'},
 {name:'Particle System',cmd:'npm run flyweight:particles'},
 {name:'Text Editor Glyphs',cmd:'npm run flyweight:glyphs'},
 {name:'UI Theme Styles',cmd:'npm run flyweight:styles'},
];
useCases.forEach((u,i)=>console.log(`${i+1}. ${u.name} -> ${u.cmd}`));
exit(0);
export {}; 