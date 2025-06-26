import { exit } from 'process';

interface Image {
  display(): Promise<void>;
}

class RealImage implements Image {
  private loaded = false;
  constructor(private filename: string) {}
  async load() {
    console.log('🖼️ Loading high-res image from disk:', this.filename);
    await new Promise((r) => setTimeout(r, 400));
    this.loaded = true;
  }
  async display() {
    if (!this.loaded) await this.load();
    console.log('📸 Displaying', this.filename);
  }
}

class ImageProxy implements Image {
  private real?: RealImage;
  constructor(private filename: string) {}
  async display() {
    if (!this.real) this.real = new RealImage(this.filename);
    await this.real.display();
  }
}

// Demo
(async () => {
  const img: Image = new ImageProxy('product-hero.png');
  console.log('Page rendering… placeholder shown.');
  // Later when user scrolls
  await img.display();
  exit(0);
})(); 