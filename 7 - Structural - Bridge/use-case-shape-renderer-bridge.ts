// ============================================================================
// SHAPE RENDERER BRIDGE - Draw shapes via SVG, Canvas, or PDF backends
// ============================================================================

import { exit } from 'process';

// -----------------------------------------------------------------------------
// 1. Implementation hierarchy – Renderer back-ends
// -----------------------------------------------------------------------------

interface Renderer {
  renderCircle(x: number, y: number, radius: number): void;
  renderRectangle(x: number, y: number, w: number, h: number): void;
  name(): string;
}

class SvgRenderer implements Renderer {
  renderCircle(x:number,y:number,r:number):void {console.log(`🖼️ <circle cx="${x}" cy="${y}" r="${r}" />`);} 
  renderRectangle(x:number,y:number,w:number,h:number):void {console.log(`🖼️ <rect x="${x}" y="${y}" width="${w}" height="${h}" />`);} 
  name():string{return 'svg';}
}

class CanvasRenderer implements Renderer {
  renderCircle(x:number,y:number,r:number):void {console.log(`🖌️ ctx.arc(${x},${y},${r},0,2*Math.PI); ctx.fill();`);} 
  renderRectangle(x:number,y:number,w:number,h:number):void {console.log(`🖌️ ctx.fillRect(${x},${y},${w},${h});`);} 
  name():string{return 'canvas';}
}

class PdfRenderer implements Renderer {
  renderCircle(x:number,y:number,r:number):void {console.log(`📄 pdf.drawCircle(${x},${y},${r});`);} 
  renderRectangle(x:number,y:number,w:number,h:number):void {console.log(`📄 pdf.drawRect(${x},${y},${w},${h});`);} 
  name():string{return 'pdf';}
}

// -----------------------------------------------------------------------------
// 2. Abstraction hierarchy – Shapes
// -----------------------------------------------------------------------------

abstract class Shape {
  protected renderer: Renderer;
  constructor(renderer: Renderer){this.renderer = renderer;}
  abstract draw(): void;
}

class Circle extends Shape {
  constructor(renderer: Renderer, private x:number, private y:number, private r:number){super(renderer);} 
  draw():void{this.renderer.renderCircle(this.x,this.y,this.r);} 
}

class Rectangle extends Shape {
  constructor(renderer: Renderer, private x:number, private y:number, private w:number, private h:number){super(renderer);} 
  draw():void{this.renderer.renderRectangle(this.x,this.y,this.w,this.h);} 
}

// -----------------------------------------------------------------------------
// 3. Demo
// -----------------------------------------------------------------------------

function demo() {
  console.log('=== SHAPE RENDERER BRIDGE DEMO ===');
  const renderers: Renderer[] = [new SvgRenderer(), new CanvasRenderer(), new PdfRenderer()];
  const shapes = [
    (r:Renderer)=>new Circle(r,50,50,20),
    (r:Renderer)=>new Rectangle(r,10,10,80,40)
  ];

  for(const renderer of renderers){
    console.log(`\n--- Using ${renderer.name().toUpperCase()} renderer ---`);
    shapes.map(factory=>factory(renderer)).forEach(s=>s.draw());
  }
}

demo();
exit(0);

export { Renderer, SvgRenderer, CanvasRenderer, PdfRenderer, Shape, Circle, Rectangle }; 