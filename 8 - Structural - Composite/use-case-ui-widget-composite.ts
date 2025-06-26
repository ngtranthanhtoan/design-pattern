// ============================================================================
// UI WIDGET COMPOSITE - Panels containing buttons and labels
// ============================================================================
import { exit } from 'process';

// 1. Component interface
interface Widget {
  render(indent?: string): void;
  getWidth(): number;
  getHeight(): number;
  add?(child: Widget): void; // optional for leaves
}

// 2. Leaf widgets
class Button implements Widget {
  constructor(private label: string, private width: number=80, private height: number=24){}
  render(indent: string=''){console.log(`${indent}🔘 Button[${this.label}] ${this.width}x${this.height}`);} 
  getWidth(){return this.width;} getHeight(){return this.height;}
}
class Label implements Widget {
  constructor(private text: string){ }
  render(indent: string=''){console.log(`${indent}🏷️ Label: "${this.text}"`);} 
  getWidth(){return this.text.length*7;} getHeight(){return 14;}
}

// 3. Composite widget
class Panel implements Widget {
  private children: Widget[]=[];
  constructor(private name:string){ }
  add(child: Widget){this.children.push(child);} 
  getWidth(){return Math.max(...this.children.map(c=>c.getWidth()),0)+20;} 
  getHeight(){return this.children.reduce((s,c)=>s+c.getHeight(),0)+20;}
  render(indent: string=''){
    console.log(`${indent}🗂️ Panel[${this.name}] ${this.getWidth()}x${this.getHeight()}`);
    this.children.forEach(c=>c.render(indent+'  '));
  }
}

// 4. Demo
function demo(){
  console.log('=== UI WIDGET COMPOSITE DEMO ===');
  const root=new Panel('root');
  const header=new Panel('header');
  header.add(new Label('My App'));
  const body=new Panel('body');
  body.add(new Button('Save'));
  body.add(new Button('Cancel'));
  root.add(header);
  root.add(body);
  root.render();
  console.log('Total root size:',root.getWidth(),'x',root.getHeight());
  exit(0);
}

demo();

export {Widget, Button, Label, Panel}; 