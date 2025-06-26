import { exit } from 'process';

// Flyweight representing an icon for a category
class IconFlyweight {
  constructor(public readonly category: string, public readonly file: string) {}
  draw(x: number, y: number) {
    console.log(`📍 ${this.category} (${this.file}) at (${x.toFixed(1)},${y.toFixed(1)})`);
  }
}

// Factory to cache and reuse icon flyweights
class IconFactory {
  private static cache = new Map<string, IconFlyweight>();
  static get(category: string): IconFlyweight {
    if (!this.cache.has(category)) {
      this.cache.set(category, new IconFlyweight(category, `${category}.png`));
    }
    return this.cache.get(category)!;
  }
  static stats() { console.log(`Factory holds ${this.cache.size} icon flyweights`); }
}

// Marker context storing extrinsic state
class MapMarker {
  constructor(private x: number, private y: number, private icon: IconFlyweight) {}
  draw() { this.icon.draw(this.x, this.y); }
}

// Demo: create 5000 markers across 3 categories
const cats = ['restaurant', 'hotel', 'museum'];
const markers: MapMarker[] = [];
for (let i = 0; i < 5000; i++) {
  const cat = cats[Math.floor(Math.random() * cats.length)];
  markers.push(new MapMarker(Math.random() * 100, Math.random() * 100, IconFactory.get(cat)));
}

markers.slice(0, 9).forEach(m => m.draw());
IconFactory.stats();
exit(0); 