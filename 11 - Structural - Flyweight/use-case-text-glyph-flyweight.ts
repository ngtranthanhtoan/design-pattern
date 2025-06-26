import { exit } from 'process';

// Flyweight: glyph info
class Glyph {
  constructor(public readonly char: string, public readonly font: string) {}
  draw(x: number, y: number) {
    console.log(`🔤 '${this.char}' (${this.font}) at (${x},${y})`);
  }
}

class GlyphFactory {
  private static cache = new Map<string, Glyph>();
  static get(char: string, font: string): Glyph {
    const key = `${char}_${font}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new Glyph(char, font));
    }
    return this.cache.get(key)!;
  }
  static stats() { console.log(`Factory holds ${this.cache.size} glyphs`); }
}

// Character context
class Character {
  constructor(private x: number, private y: number, private glyph: Glyph) {}
  draw() { this.glyph.draw(this.x, this.y); }
}

// Demo: render text paragraph
const text = 'Flyweight pattern in text editors';
const chars: Character[] = [];
let x = 0;
for (const ch of text) {
  const glyph = GlyphFactory.get(ch, 'Arial');
  chars.push(new Character(x, 0, glyph));
  x += 1;
}
chars.forEach(c => c.draw());
GlyphFactory.stats();
exit(0); 