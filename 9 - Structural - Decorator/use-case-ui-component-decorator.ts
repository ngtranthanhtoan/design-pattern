import { exit } from 'process';

// 1. Interface
interface VisualComponent {
  draw(): string; // returns markup string for demo purposes
}

// 2. Concrete component
class TextView implements VisualComponent {
  constructor(private text: string) {}
  draw(): string {
    return this.text;
  }
}

// 3. Base decorator
abstract class ComponentDecorator implements VisualComponent {
  constructor(protected component: VisualComponent) {}
  abstract draw(): string;
}

// 4. Concrete decorators
class BorderDecorator extends ComponentDecorator {
  constructor(component: VisualComponent, private width = 1) {
    super(component);
  }
  draw(): string {
    const inner = this.component.draw();
    const border = '*'.repeat(this.width);
    return `${border} ${inner} ${border}`;
  }
}

class ShadowDecorator extends ComponentDecorator {
  draw(): string {
    const inner = this.component.draw();
    return `${inner}\n   \\`;
  }
}

// 5. Usage example
const simple = new TextView('Hello Decorator');
const bordered = new BorderDecorator(simple, 3);
const fancy = new ShadowDecorator(bordered);

console.log('--- UI DECORATOR DEMO ---');
console.log(fancy.draw());
exit(0); 