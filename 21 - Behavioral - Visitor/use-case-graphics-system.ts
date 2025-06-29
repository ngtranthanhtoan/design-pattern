/**
 * Visitor Pattern - Graphics System Use Case
 * 
 * This example demonstrates how the Visitor pattern can be used in graphics systems
 * to separate different operations (rendering, serialization, transformation, bounding
 * box calculation) from shape classes. Each operation becomes a visitor that implements
 * specific logic for each shape type.
 */

import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface GraphicsVisitor {
  visitCircle(circle: Circle): void;
  visitRectangle(rectangle: Rectangle): void;
  visitLine(line: Line): void;
}

interface Shape {
  accept(visitor: GraphicsVisitor): void;
  getX(): number;
  getY(): number;
}

// ============================================================================
// CONCRETE SHAPE CLASSES
// ============================================================================

class Circle implements Shape {
  constructor(
    private x: number,
    private y: number,
    private radius: number,
    private color: string = "black"
  ) {}

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getRadius(): number {
    return this.radius;
  }

  getColor(): string {
    return this.color;
  }

  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  getCircumference(): number {
    return 2 * Math.PI * this.radius;
  }

  accept(visitor: GraphicsVisitor): void {
    visitor.visitCircle(this);
  }
}

class Rectangle implements Shape {
  constructor(
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    private color: string = "black"
  ) {}

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getColor(): string {
    return this.color;
  }

  getArea(): number {
    return this.width * this.height;
  }

  getPerimeter(): number {
    return 2 * (this.width + this.height);
  }

  accept(visitor: GraphicsVisitor): void {
    visitor.visitRectangle(this);
  }
}

class Line implements Shape {
  constructor(
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number,
    private color: string = "black",
    private thickness: number = 1
  ) {}

  getX(): number {
    return this.x1;
  }

  getY(): number {
    return this.y1;
  }

  getX2(): number {
    return this.x2;
  }

  getY2(): number {
    return this.y2;
  }

  getColor(): string {
    return this.color;
  }

  getThickness(): number {
    return this.thickness;
  }

  getLength(): number {
    const dx = this.x2 - this.x1;
    const dy = this.y2 - this.y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  accept(visitor: GraphicsVisitor): void {
    visitor.visitLine(this);
  }
}

// ============================================================================
// CONCRETE VISITOR CLASSES
// ============================================================================

class Renderer implements GraphicsVisitor {
  private output: string[] = [];

  visitCircle(circle: Circle): void {
    this.output.push(`[RENDER] Drawing circle at (${circle.getX()}, ${circle.getY()}) with radius ${circle.getRadius()}`);
    this.output.push(`[RENDER] Color: ${circle.getColor()}, Area: ${circle.getArea().toFixed(2)}`);
    this.output.push(`[RENDER] SVG: <circle cx="${circle.getX()}" cy="${circle.getY()}" r="${circle.getRadius()}" fill="${circle.getColor()}" />`);
  }

  visitRectangle(rectangle: Rectangle): void {
    this.output.push(`[RENDER] Drawing rectangle at (${rectangle.getX()}, ${rectangle.getY()}) with size ${rectangle.getWidth()}x${rectangle.getHeight()}`);
    this.output.push(`[RENDER] Color: ${rectangle.getColor()}, Area: ${rectangle.getArea()}`);
    this.output.push(`[RENDER] SVG: <rect x="${rectangle.getX()}" y="${rectangle.getY()}" width="${rectangle.getWidth()}" height="${rectangle.getHeight()}" fill="${rectangle.getColor()}" />`);
  }

  visitLine(line: Line): void {
    this.output.push(`[RENDER] Drawing line from (${line.getX()}, ${line.getY()}) to (${line.getX2()}, ${line.getY2()})`);
    this.output.push(`[RENDER] Color: ${line.getColor()}, Thickness: ${line.getThickness()}, Length: ${line.getLength().toFixed(2)}`);
    this.output.push(`[RENDER] SVG: <line x1="${line.getX()}" y1="${line.getY()}" x2="${line.getX2()}" y2="${line.getY2()}" stroke="${line.getColor()}" stroke-width="${line.getThickness()}" />`);
  }

  getOutput(): string {
    return this.output.join('\n');
  }

  reset(): void {
    this.output = [];
  }
}

class Serializer implements GraphicsVisitor {
  private output: string[] = [];

  visitCircle(circle: Circle): void {
    const json = {
      type: 'circle',
      x: circle.getX(),
      y: circle.getY(),
      radius: circle.getRadius(),
      color: circle.getColor(),
      area: circle.getArea(),
      circumference: circle.getCircumference()
    };
    this.output.push(JSON.stringify(json, null, 2));
  }

  visitRectangle(rectangle: Rectangle): void {
    const json = {
      type: 'rectangle',
      x: rectangle.getX(),
      y: rectangle.getY(),
      width: rectangle.getWidth(),
      height: rectangle.getHeight(),
      color: rectangle.getColor(),
      area: rectangle.getArea(),
      perimeter: rectangle.getPerimeter()
    };
    this.output.push(JSON.stringify(json, null, 2));
  }

  visitLine(line: Line): void {
    const json = {
      type: 'line',
      x1: line.getX(),
      y1: line.getY(),
      x2: line.getX2(),
      y2: line.getY2(),
      color: line.getColor(),
      thickness: line.getThickness(),
      length: line.getLength()
    };
    this.output.push(JSON.stringify(json, null, 2));
  }

  getOutput(): string {
    return this.output.join('\n\n');
  }

  reset(): void {
    this.output = [];
  }
}

class Transformer implements GraphicsVisitor {
  private scaleX: number = 1;
  private scaleY: number = 1;
  private translateX: number = 0;
  private translateY: number = 0;
  private rotate: number = 0;

  constructor(scaleX: number = 1, scaleY: number = 1, translateX: number = 0, translateY: number = 0, rotate: number = 0) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.translateX = translateX;
    this.translateY = translateY;
    this.rotate = rotate;
  }

  visitCircle(circle: Circle): void {
    const newX = circle.getX() * this.scaleX + this.translateX;
    const newY = circle.getY() * this.scaleY + this.translateY;
    const newRadius = circle.getRadius() * Math.max(this.scaleX, this.scaleY);
    
    console.log(`[TRANSFORM] Circle: (${circle.getX()}, ${circle.getY()}) r=${circle.getRadius()} -> (${newX.toFixed(2)}, ${newY.toFixed(2)}) r=${newRadius.toFixed(2)}`);
    console.log(`[TRANSFORM] Scale: (${this.scaleX}, ${this.scaleY}), Translate: (${this.translateX}, ${this.translateY}), Rotate: ${this.rotate}°`);
  }

  visitRectangle(rectangle: Rectangle): void {
    const newX = rectangle.getX() * this.scaleX + this.translateX;
    const newY = rectangle.getY() * this.scaleY + this.translateY;
    const newWidth = rectangle.getWidth() * this.scaleX;
    const newHeight = rectangle.getHeight() * this.scaleY;
    
    console.log(`[TRANSFORM] Rectangle: (${rectangle.getX()}, ${rectangle.getY()}) ${rectangle.getWidth()}x${rectangle.getHeight()} -> (${newX.toFixed(2)}, ${newY.toFixed(2)}) ${newWidth.toFixed(2)}x${newHeight.toFixed(2)}`);
    console.log(`[TRANSFORM] Scale: (${this.scaleX}, ${this.scaleY}), Translate: (${this.translateX}, ${this.translateY}), Rotate: ${this.rotate}°`);
  }

  visitLine(line: Line): void {
    const newX1 = line.getX() * this.scaleX + this.translateX;
    const newY1 = line.getY() * this.scaleY + this.translateY;
    const newX2 = line.getX2() * this.scaleX + this.translateX;
    const newY2 = line.getY2() * this.scaleY + this.translateY;
    
    console.log(`[TRANSFORM] Line: (${line.getX()}, ${line.getY()}) to (${line.getX2()}, ${line.getY2()}) -> (${newX1.toFixed(2)}, ${newY1.toFixed(2)}) to (${newX2.toFixed(2)}, ${newY2.toFixed(2)})`);
    console.log(`[TRANSFORM] Scale: (${this.scaleX}, ${this.scaleY}), Translate: (${this.translateX}, ${this.translateY}), Rotate: ${this.rotate}°`);
  }

  setTransform(scaleX: number, scaleY: number, translateX: number, translateY: number, rotate: number): void {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.translateX = translateX;
    this.translateY = translateY;
    this.rotate = rotate;
  }
}

class BoundingBoxCalculator implements GraphicsVisitor {
  private minX: number = Infinity;
  private minY: number = Infinity;
  private maxX: number = -Infinity;
  private maxY: number = -Infinity;
  private shapeCount: number = 0;

  visitCircle(circle: Circle): void {
    const x = circle.getX();
    const y = circle.getY();
    const radius = circle.getRadius();
    
    this.minX = Math.min(this.minX, x - radius);
    this.minY = Math.min(this.minY, y - radius);
    this.maxX = Math.max(this.maxX, x + radius);
    this.maxY = Math.max(this.maxY, y + radius);
    this.shapeCount++;
    
    console.log(`[BOUNDS] Circle at (${x}, ${y}) with radius ${radius} affects bounds`);
  }

  visitRectangle(rectangle: Rectangle): void {
    const x = rectangle.getX();
    const y = rectangle.getY();
    const width = rectangle.getWidth();
    const height = rectangle.getHeight();
    
    this.minX = Math.min(this.minX, x);
    this.minY = Math.min(this.minY, y);
    this.maxX = Math.max(this.maxX, x + width);
    this.maxY = Math.max(this.maxY, y + height);
    this.shapeCount++;
    
    console.log(`[BOUNDS] Rectangle at (${x}, ${y}) with size ${width}x${height} affects bounds`);
  }

  visitLine(line: Line): void {
    const x1 = line.getX();
    const y1 = line.getY();
    const x2 = line.getX2();
    const y2 = line.getY2();
    
    this.minX = Math.min(this.minX, x1, x2);
    this.minY = Math.min(this.minY, y1, y2);
    this.maxX = Math.max(this.maxX, x1, x2);
    this.maxY = Math.max(this.maxY, y1, y2);
    this.shapeCount++;
    
    console.log(`[BOUNDS] Line from (${x1}, ${y1}) to (${x2}, ${y2}) affects bounds`);
  }

  getBoundingBox(): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
    return {
      minX: this.minX,
      minY: this.minY,
      maxX: this.maxX,
      maxY: this.maxY,
      width: this.maxX - this.minX,
      height: this.maxY - this.minY
    };
  }

  getShapeCount(): number {
    return this.shapeCount;
  }

  reset(): void {
    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
    this.shapeCount = 0;
  }
}

// ============================================================================
// GRAPHICS SCENE
// ============================================================================

class GraphicsScene {
  private shapes: Shape[] = [];

  addShape(shape: Shape): void {
    this.shapes.push(shape);
  }

  accept(visitor: GraphicsVisitor): void {
    this.shapes.forEach(shape => shape.accept(visitor));
  }

  getShapeCount(): number {
    return this.shapes.length;
  }

  clear(): void {
    this.shapes = [];
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

function demonstrateGraphicsSystem(): void {
  console.log("🎨 Graphics System with Visitor Pattern");
  console.log("=======================================\n");

  // Create a graphics scene with various shapes
  const scene = new GraphicsScene();
  
  scene.addShape(new Circle(100, 100, 50, "red"));
  scene.addShape(new Rectangle(200, 150, 80, 60, "blue"));
  scene.addShape(new Line(50, 200, 250, 200, "green", 3));
  scene.addShape(new Circle(300, 100, 30, "yellow"));
  scene.addShape(new Rectangle(50, 50, 40, 40, "purple"));

  console.log(`Graphics scene created with ${scene.getShapeCount()} shapes\n`);

  // Test 1: Rendering
  console.log("1️⃣ Rendering Operation:");
  console.log("------------------------");
  const renderer = new Renderer();
  scene.accept(renderer);
  console.log(renderer.getOutput());
  console.log();

  // Test 2: Serialization
  console.log("2️⃣ Serialization Operation:");
  console.log("----------------------------");
  const serializer = new Serializer();
  scene.accept(serializer);
  console.log("Serialized shapes:");
  console.log(serializer.getOutput());
  console.log();

  // Test 3: Transformation
  console.log("3️⃣ Transformation Operation:");
  console.log("------------------------------");
  const transformer = new Transformer(2, 1.5, 50, 25, 45);
  scene.accept(transformer);
  console.log();

  // Test 4: Bounding Box Calculation
  console.log("4️⃣ Bounding Box Calculation:");
  console.log("-----------------------------");
  const boundingBoxCalculator = new BoundingBoxCalculator();
  scene.accept(boundingBoxCalculator);
  
  const bounds = boundingBoxCalculator.getBoundingBox();
  console.log(`\n📊 Bounding Box Summary:`);
  console.log(`Total shapes: ${boundingBoxCalculator.getShapeCount()}`);
  console.log(`Bounds: (${bounds.minX.toFixed(2)}, ${bounds.minY.toFixed(2)}) to (${bounds.maxX.toFixed(2)}, ${bounds.maxY.toFixed(2)})`);
  console.log(`Size: ${bounds.width.toFixed(2)} x ${bounds.height.toFixed(2)}`);
  console.log();

  // Test 5: Multiple Transformations
  console.log("5️⃣ Multiple Transformations:");
  console.log("------------------------------");
  const scaleTransformer = new Transformer(0.5, 0.5, 0, 0, 0);
  console.log("Scaling down by 50%:");
  scene.accept(scaleTransformer);
  
  const translateTransformer = new Transformer(1, 1, 100, 100, 0);
  console.log("\nTranslating by (100, 100):");
  scene.accept(translateTransformer);
  console.log();

  // Test 6: Edge Cases
  console.log("6️⃣ Edge Cases Testing:");
  console.log("----------------------");
  const emptyScene = new GraphicsScene();
  const edgeCaseRenderer = new Renderer();
  const edgeCaseBoundingBox = new BoundingBoxCalculator();
  
  console.log("Empty scene:");
  emptyScene.accept(edgeCaseRenderer);
  emptyScene.accept(edgeCaseBoundingBox);
  
  const edgeBounds = edgeCaseBoundingBox.getBoundingBox();
  console.log(`Empty scene bounds: ${edgeBounds.minX} to ${edgeBounds.maxX}, ${edgeBounds.minY} to ${edgeBounds.maxY}`);
  
  // Single shape scene
  const singleShapeScene = new GraphicsScene();
  singleShapeScene.addShape(new Circle(0, 0, 10, "black"));
  
  const singleBoundingBox = new BoundingBoxCalculator();
  singleShapeScene.accept(singleBoundingBox);
  
  const singleBounds = singleBoundingBox.getBoundingBox();
  console.log(`Single shape bounds: (${singleBounds.minX}, ${singleBounds.minY}) to (${singleBounds.maxX}, ${singleBounds.maxY})`);
}

if (require.main === module) {
  try {
    demonstrateGraphicsSystem();
    console.log("✅ All graphics system operations completed successfully!");
  } catch (error) {
    console.error("❌ Error during graphics system operations:", error);
    exit(1);
  }
}

export {
  GraphicsVisitor,
  Shape,
  Circle,
  Rectangle,
  Line,
  Renderer,
  Serializer,
  Transformer,
  BoundingBoxCalculator,
  GraphicsScene
}; 