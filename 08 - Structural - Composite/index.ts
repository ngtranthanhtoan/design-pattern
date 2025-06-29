// ============================================================================
// COMPOSITE PATTERN - Overview & Navigation
// ============================================================================
import { exit } from 'process';
console.log('🌳 COMPOSITE PATTERN - Overview');
console.log('================================\n');
const useCases=[
 {name:'File System Composite',description:'Folders & files with size calculation',command:'npm run composite:filesystem',example:'const root=new Folder("/"); root.add(new File("a.txt",100));'},
 {name:'UI Widget Composite',description:'Panels with buttons and labels',command:'npm run composite:widgets',example:'const panel=new Panel("root"); panel.add(new Button("OK"));'},
 {name:'Org Chart Composite',description:'Departments and employees',command:'npm run composite:org',example:'const dev=new Department("Dev"); dev.add(new Employee("Joe",100000));'},
 {name:'Graphic Group Composite',description:'Group shapes for transforms',command:'npm run composite:graphics',example:'const grp=new Group("root");'},
 {name:'Menu Composite',description:'Menu and submenu items',command:'npm run composite:menu',example:'const menu=new Menu("File");'},
];
useCases.forEach((u,i)=>{
 console.log(`${i+1}. 🎯 ${u.name}`);console.log(`   ${u.description}`);console.log(`   Command: ${u.command}`);console.log(`   Example: ${u.example}\n`);
});
exit(0);
export {}; 