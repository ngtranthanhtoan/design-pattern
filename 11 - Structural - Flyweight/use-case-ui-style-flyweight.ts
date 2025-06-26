import { exit } from 'process';

// Flyweight for shared style declarations
class StyleFlyweight {
  constructor(public readonly style: string) {}
  apply(componentId: string) {
    console.log(`🎨 Apply style '${this.style}' to #${componentId}`);
  }
}

class StyleFactory {
  private static cache = new Map<string, StyleFlyweight>();
  static get(style: string): StyleFlyweight {
    if (!this.cache.has(style)) this.cache.set(style, new StyleFlyweight(style));
    return this.cache.get(style)!;
  }
  static stats() { console.log(`Factory holds ${this.cache.size} shared style objects`); }
}

// Component context
class Component {
  constructor(private id: string, private style: StyleFlyweight) {}
  render() { this.style.apply(this.id); }
}

// Demo: 100 components with only 3 style variants
const styles = ['btn-primary', 'btn-secondary', 'btn-danger'];
const components: Component[] = [];
for (let i = 0; i < 100; i++) {
  const st = styles[i % styles.length];
  components.push(new Component(`comp${i}`, StyleFactory.get(st)));
}
components.slice(0, 10).forEach(c => c.render());
StyleFactory.stats();
exit(0); 