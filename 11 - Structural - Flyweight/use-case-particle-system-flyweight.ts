import { exit } from 'process';

// Flyweight holding shared particle type data
class ParticleType {
  constructor(public readonly sprite: string, public readonly color: string, public readonly behavior: string) {}
  render(x: number, y: number) {
    console.log(`✨ Particle '${this.sprite}' color ${this.color} at (${x.toFixed(1)},${y.toFixed(1)})`);
  }
}

class ParticleFactory {
  private static cache = new Map<string, ParticleType>();
  static get(sprite: string, color: string, behavior: string): ParticleType {
    const key = `${sprite}_${color}_${behavior}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new ParticleType(sprite, color, behavior));
    }
    return this.cache.get(key)!;
  }
  static stats() { console.log(`Factory holds ${this.cache.size} particle types`); }
}

// Particle context (extrinsic)
class Particle {
  constructor(private x: number, private y: number, private vx: number, private vy: number, private type: ParticleType) {}
  update() {
    this.x += this.vx; this.y += this.vy;
    this.type.render(this.x, this.y);
  }
}

// Demo: Explosion with 1000 fire & 1000 smoke particles
const particles: Particle[] = [];
for (let i = 0; i < 1000; i++) {
  particles.push(new Particle(0, 0, Math.random(), Math.random(), ParticleFactory.get('spark', 'orange', 'fire')));
}
for (let i = 0; i < 1000; i++) {
  particles.push(new Particle(0, 0, Math.random(), Math.random(), ParticleFactory.get('cloud', 'gray', 'smoke')));
}
// Simulate one frame
particles.slice(0, 6).forEach(p => p.update());
ParticleFactory.stats();
exit(0); 