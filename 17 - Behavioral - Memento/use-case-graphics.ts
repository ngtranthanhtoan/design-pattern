import { exit } from 'process';

// Graphics State interfaces
interface Point {
  x: number;
  y: number;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'text';
  position: Point;
  size: Point;
  color: string;
  strokeWidth: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  shapes: Shape[];
}

interface CanvasState {
  width: number;
  height: number;
  backgroundColor: string;
  layers: Layer[];
  activeLayerId: string;
  selectedShapeIds: string[];
  brushColor: string;
  brushSize: number;
  tool: 'select' | 'draw' | 'text' | 'shape';
}

// Memento interface
interface Memento {
  getState(): any;
  getTimestamp(): Date;
}

// Canvas Memento
class CanvasMemento implements Memento {
  private state: CanvasState;
  private timestamp: Date;

  constructor(state: CanvasState) {
    // Deep copy the state to ensure immutability
    this.state = {
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
      layers: state.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        shapes: layer.shapes.map(shape => ({ ...shape }))
      })),
      activeLayerId: state.activeLayerId,
      selectedShapeIds: [...state.selectedShapeIds],
      brushColor: state.brushColor,
      brushSize: state.brushSize,
      tool: state.tool
    };
    this.timestamp = new Date();
  }

  getState(): CanvasState {
    return JSON.parse(JSON.stringify(this.state)); // Deep copy
  }

  getTimestamp(): Date {
    return new Date(this.timestamp);
  }
}

// Graphics Canvas (Originator)
class GraphicsCanvas {
  private state: CanvasState;
  private shapeIdCounter: number = 0;

  constructor(width: number = 800, height: number = 600) {
    this.state = {
      width,
      height,
      backgroundColor: '#ffffff',
      layers: [
        {
          id: 'layer-1',
          name: 'Background',
          visible: true,
          opacity: 1.0,
          shapes: []
        }
      ],
      activeLayerId: 'layer-1',
      selectedShapeIds: [],
      brushColor: '#000000',
      brushSize: 2,
      tool: 'select'
    };
  }

  // Create memento of current state
  createMemento(): Memento {
    console.log('💾 Creating canvas memento...');
    return new CanvasMemento(this.state);
  }

  // Restore state from memento
  restore(memento: Memento): void {
    console.log('🔄 Restoring canvas state...');
    this.state = memento.getState();
  }

  // Canvas operations
  addLayer(name: string): void {
    const layerId = `layer-${++this.shapeIdCounter}`;
    const newLayer: Layer = {
      id: layerId,
      name,
      visible: true,
      opacity: 1.0,
      shapes: []
    };
    this.state.layers.push(newLayer);
    this.state.activeLayerId = layerId;
    console.log(`📑 Added layer: ${name}`);
  }

  addShape(shape: Omit<Shape, 'id'>): void {
    const activeLayer = this.state.layers.find(l => l.id === this.state.activeLayerId);
    if (!activeLayer) return;

    const newShape: Shape = {
      ...shape,
      id: `shape-${++this.shapeIdCounter}`
    };
    activeLayer.shapes.push(newShape);
    console.log(`🎨 Added ${shape.type}: ${newShape.id}`);
  }

  addRectangle(x: number, y: number, width: number, height: number): void {
    this.addShape({
      type: 'rectangle',
      position: { x, y },
      size: { x: width, y: height },
      color: this.state.brushColor,
      strokeWidth: this.state.brushSize
    });
  }

  addCircle(x: number, y: number, radius: number): void {
    this.addShape({
      type: 'circle',
      position: { x, y },
      size: { x: radius * 2, y: radius * 2 },
      color: this.state.brushColor,
      strokeWidth: this.state.brushSize
    });
  }

  addLine(x1: number, y1: number, x2: number, y2: number): void {
    this.addShape({
      type: 'line',
      position: { x: x1, y: y1 },
      size: { x: x2 - x1, y: y2 - y1 },
      color: this.state.brushColor,
      strokeWidth: this.state.brushSize
    });
  }

  addText(x: number, y: number, text: string): void {
    this.addShape({
      type: 'text',
      position: { x, y },
      size: { x: 0, y: 0 },
      color: this.state.brushColor,
      strokeWidth: 1,
      text,
      fontFamily: 'Arial',
      fontSize: 16
    });
  }

  selectShape(shapeId: string): void {
    this.state.selectedShapeIds = [shapeId];
    console.log(`📋 Selected shape: ${shapeId}`);
  }

  deleteSelectedShapes(): void {
    const activeLayer = this.state.layers.find(l => l.id === this.state.activeLayerId);
    if (!activeLayer) return;

    const deletedCount = this.state.selectedShapeIds.length;
    activeLayer.shapes = activeLayer.shapes.filter(
      shape => !this.state.selectedShapeIds.includes(shape.id)
    );
    this.state.selectedShapeIds = [];
    console.log(`🗑️ Deleted ${deletedCount} shapes`);
  }

  setBrushColor(color: string): void {
    this.state.brushColor = color;
    console.log(`🎨 Set brush color: ${color}`);
  }

  setBrushSize(size: number): void {
    this.state.brushSize = size;
    console.log(`📏 Set brush size: ${size}`);
  }

  setTool(tool: CanvasState['tool']): void {
    this.state.tool = tool;
    console.log(`🔧 Set tool: ${tool}`);
  }

  toggleLayerVisibility(layerId: string): void {
    const layer = this.state.layers.find(l => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
      console.log(`👁️ Toggled layer visibility: ${layer.name} (${layer.visible})`);
    }
  }

  setLayerOpacity(layerId: string, opacity: number): void {
    const layer = this.state.layers.find(l => l.id === layerId);
    if (layer) {
      layer.opacity = Math.max(0, Math.min(1, opacity));
      console.log(`🎚️ Set layer opacity: ${layer.name} (${layer.opacity})`);
    }
  }

  // Get current state
  getState(): CanvasState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Display current state
  display(): void {
    console.log('\n🎨 Current Canvas State:');
    console.log(`Canvas: ${this.state.width}x${this.state.height}, Background: ${this.state.backgroundColor}`);
    console.log(`Tool: ${this.state.tool}, Brush: ${this.state.brushColor} (${this.state.brushSize}px)`);
    console.log(`Active Layer: ${this.state.activeLayerId}`);
    console.log(`Selected Shapes: ${this.state.selectedShapeIds.length}`);
    
    console.log('\n📑 Layers:');
    this.state.layers.forEach(layer => {
      const activeIndicator = layer.id === this.state.activeLayerId ? ' (active)' : '';
      const visibilityIcon = layer.visible ? '👁️' : '🙈';
      console.log(`  ${visibilityIcon} ${layer.name}${activeIndicator} - ${layer.shapes.length} shapes (opacity: ${layer.opacity})`);
    });
    
    console.log('');
  }
}

// Caretaker - Manages memento history
class GraphicsCaretaker {
  private undoStack: Memento[] = [];
  private redoStack: Memento[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 20) {
    this.maxHistorySize = maxHistorySize;
  }

  // Save current state
  save(canvas: GraphicsCanvas): void {
    const memento = canvas.createMemento();
    this.undoStack.push(memento);
    
    // Clear redo stack when new action is performed
    this.redoStack = [];
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    
    console.log(`💾 Canvas state saved. Undo stack: ${this.undoStack.length}`);
  }

  // Undo last action
  undo(canvas: GraphicsCanvas): boolean {
    if (this.undoStack.length === 0) {
      console.log('❌ Nothing to undo');
      return false;
    }

    const currentMemento = canvas.createMemento();
    this.redoStack.push(currentMemento);

    const previousMemento = this.undoStack.pop()!;
    canvas.restore(previousMemento);

    console.log(`↩️ Undo performed. Undo stack: ${this.undoStack.length}, Redo stack: ${this.redoStack.length}`);
    return true;
  }

  // Redo last undone action
  redo(canvas: GraphicsCanvas): boolean {
    if (this.redoStack.length === 0) {
      console.log('❌ Nothing to redo');
      return false;
    }

    const currentMemento = canvas.createMemento();
    this.undoStack.push(currentMemento);

    const nextMemento = this.redoStack.pop()!;
    canvas.restore(nextMemento);

    console.log(`↪️ Redo performed. Undo stack: ${this.undoStack.length}, Redo stack: ${this.redoStack.length}`);
    return true;
  }

  // Get history information
  getHistoryInfo(): { undoCount: number; redoCount: number } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length
    };
  }
}

// Demo
console.log('=== GRAPHICS APPLICATION DRAWING HISTORY DEMO ===\n');

// Create canvas and caretaker
const canvas = new GraphicsCanvas(800, 600);
const caretaker = new GraphicsCaretaker(10);

console.log('🚀 Starting graphics editing session...\n');

// Initial state
canvas.display();

// Perform various drawing operations
console.log('=== DRAWING OPERATIONS ===');

caretaker.save(canvas);
canvas.setBrushColor('#ff0000');
canvas.setBrushSize(3);
canvas.addRectangle(50, 50, 100, 80);
canvas.display();

caretaker.save(canvas);
canvas.setBrushColor('#00ff00');
canvas.addCircle(200, 100, 50);
canvas.display();

caretaker.save(canvas);
canvas.addLayer('Foreground');
canvas.display();

caretaker.save(canvas);
canvas.setBrushColor('#0000ff');
canvas.addLine(300, 50, 400, 150);
canvas.display();

caretaker.save(canvas);
canvas.addText(350, 200, 'Hello Graphics!');
canvas.display();

caretaker.save(canvas);
canvas.selectShape('shape-1');
canvas.display();

caretaker.save(canvas);
canvas.deleteSelectedShapes();
canvas.display();

caretaker.save(canvas);
canvas.setLayerOpacity('layer-2', 0.7);
canvas.display();

// Demonstrate undo/redo
console.log('=== UNDO/REDO OPERATIONS ===');

console.log('\n🔄 Undoing last action...');
caretaker.undo(canvas);
canvas.display();

console.log('\n🔄 Undoing deletion...');
caretaker.undo(canvas);
canvas.display();

console.log('\n🔄 Undoing selection...');
caretaker.undo(canvas);
canvas.display();

console.log('\n↪️ Redoing selection...');
caretaker.redo(canvas);
canvas.display();

console.log('\n↪️ Redoing deletion...');
caretaker.redo(canvas);
canvas.display();

console.log('\n🔄 Undoing multiple actions...');
caretaker.undo(canvas);
caretaker.undo(canvas);
caretaker.undo(canvas);
canvas.display();

// Show history information
const history = caretaker.getHistoryInfo();
console.log('\n📊 History Information:');
console.log(`Undo stack: ${history.undoCount} items`);
console.log(`Redo stack: ${history.redoCount} items`);

// Demonstrate multiple undos
console.log('\n=== MULTIPLE UNDO DEMO ===');
for (let i = 0; i < 3; i++) {
  console.log(`\n🔄 Undo ${i + 1}:`);
  caretaker.undo(canvas);
  canvas.display();
}

// Demonstrate multiple redos
console.log('\n=== MULTIPLE REDO DEMO ===');
for (let i = 0; i < 3; i++) {
  console.log(`\n↪️ Redo ${i + 1}:`);
  caretaker.redo(canvas);
  canvas.display();
}

console.log('\n✅ Graphics application drawing history demo completed successfully');

exit(0); 