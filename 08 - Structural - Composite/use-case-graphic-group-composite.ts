// ============================================================================
// GRAPHICS GROUP COMPOSITE - Apply transforms to grouped shapes
// ============================================================================
import { exit } from 'process';

interface Graphic {
  translate(dx:number, dy:number): void;
  render(indent?:string): void;
}

class Shape implements Graphic {
  constructor(private name:string, private x:number, private y:number){}
  translate(dx:number,dy:number){this.x+=dx; this.y+=dy;}
  render(indent:string=''){console.log(`${indent}⬜ ${this.name} at (${this.x},${this.y})`);} 
}

class Group implements Graphic {
  private children: Graphic[]=[];
  constructor(private name:string){}
  add(g:Graphic){this.children.push(g);} 
  translate(dx:number,dy:number){this.children.forEach(c=>c.translate(dx,dy));}
  render(indent:string=''){
    console.log(`${indent}📦 Group[${this.name}]`);
    this.children.forEach(c=>c.render(indent+'  '));
  }
}

function demo(){
  console.log('=== GRAPHIC GROUP COMPOSITE DEMO ===');
  const group=new Group('Root');
  group.add(new Shape('Circle',10,10));
  const sub=new Group('SubGroup');
  sub.add(new Shape('Square',5,5));
  group.add(sub);
  console.log('\nInitial render');
  group.render();
  console.log('\nTranslate root by (10,10)');
  group.translate(10,10);
  group.render();
  exit(0);
}

demo();

export {Graphic, Shape, Group}; 