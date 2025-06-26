// ============================================================================
// MENU COMPOSITE - Menu and SubMenu with uniform render and enable logic
// ============================================================================
import { exit } from 'process';

interface MenuComponent {
  render(indent?:string): void;
  setEnabled(enabled:boolean): void;
}

class MenuItem implements MenuComponent {
  private enabled=true;
  constructor(private title:string){}
  render(indent:string=''){const state=this.enabled?'':'(disabled)';console.log(`${indent}🍔 ${this.title} ${state}`);} 
  setEnabled(en:boolean){this.enabled=en;}
}

class Menu implements MenuComponent {
  private children: MenuComponent[]=[];
  private enabled=true;
  constructor(private title:string){}
  add(c:MenuComponent){this.children.push(c);} 
  render(indent:string=''){const state=this.enabled?'':'(disabled)';console.log(`${indent}📂 ${this.title} ${state}`);this.children.forEach(c=>c.render(indent+'  '));}
  setEnabled(en:boolean){this.enabled=en; this.children.forEach(c=>c.setEnabled(en));}
}

function demo(){
  console.log('=== MENU COMPOSITE DEMO ===');
  const root=new Menu('File');
  const newMenu=new Menu('New');
  newMenu.add(new MenuItem('Project'));
  newMenu.add(new MenuItem('File'));
  root.add(newMenu);
  root.add(new MenuItem('Open'));
  root.add(new MenuItem('Exit'));
  console.log('\nInitial:');
  root.render();
  console.log('\nDisable File menu:');
  root.setEnabled(false);
  root.render();
  exit(0);
}

demo();

export {MenuComponent, MenuItem, Menu}; 