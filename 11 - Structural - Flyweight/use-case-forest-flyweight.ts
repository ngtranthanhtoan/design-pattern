import { exit } from 'process';

// 1. Flyweight (intrinsic state)
class TreeType {
  constructor(public readonly name: string, public readonly color: string, public readonly texture: string) {}
  draw(x: number, y: number) {
    // In real engine, would draw texture; here just log
    console.log(`🌳 Draw '${this.name}' at (${x},${y}) with color ${this.color}`);
  }
}

// 2. Flyweight Factory
class TreeFactory {
  private static types = new Map<string, TreeType>();
  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = `${name}_${color}_${texture}`;
    if (!this.types.has(key)) {
      this.types.set(key, new TreeType(name, color, texture));
    }
    return this.types.get(key)!;
  }
  static stats() {
    console.log(`Factory contains ${this.types.size} tree types`);
  }
}

// 3. Context holding extrinsic state
class Tree {
  constructor(private x: number, private y: number, private type: TreeType) {}
  draw() { this.type.draw(this.x, this.y); }
}

// 4. Client (Forest)
class Forest {
  private trees: Tree[] = [];
  plant(x: number, y: number, name: string, color: string, texture: string) {
    const type = TreeFactory.getTreeType(name, color, texture);
    this.trees.push(new Tree(x, y, type));
  }
  draw() { this.trees.forEach(t => t.draw()); }
}

// 5. Demo
const forest = new Forest();
for (let i = 0; i < 1000; i++) {
  forest.plant(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), 'Oak', 'green', 'oak-texture');
}
for (let i = 0; i < 1000; i++) {
  forest.plant(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), 'Pine', 'darkgreen', 'pine-texture');
}

forest.draw();
TreeFactory.stats();
exit(0); 