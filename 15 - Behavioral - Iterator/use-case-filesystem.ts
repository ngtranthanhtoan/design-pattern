import { exit } from 'process';

// Iterator interface
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
  current(): T;
  reset(): void;
}

// File system item interface
interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modifiedDate: Date;
  isHidden: boolean;
}

// File system node
class FileSystemNode {
  public children: FileSystemNode[] = [];
  
  constructor(
    public name: string,
    public type: 'file' | 'directory',
    public size: number = 0,
    public modifiedDate: Date = new Date(),
    public isHidden: boolean = false
  ) {}
  
  addChild(child: FileSystemNode): void {
    if (this.type === 'directory') {
      this.children.push(child);
    }
  }
  
  getPath(): string {
    return this.name;
  }
  
  toFileSystemItem(path: string = ''): FileSystemItem {
    return {
      name: this.name,
      path: path ? `${path}/${this.name}` : this.name,
      type: this.type,
      size: this.size,
      modifiedDate: this.modifiedDate,
      isHidden: this.isHidden
    };
  }
}

// File system collection
class FileSystem {
  private root: FileSystemNode;
  
  constructor() {
    this.root = new FileSystemNode('root', 'directory');
    this.buildMockFileSystem();
  }
  
  createIterator(strategy: 'depth-first' | 'breadth-first' | 'by-size' | 'by-date'): Iterator<FileSystemItem> {
    switch (strategy) {
      case 'depth-first':
        return new DepthFirstIterator(this.root);
      case 'breadth-first':
        return new BreadthFirstIterator(this.root);
      case 'by-size':
        return new SizeOrderIterator(this.root);
      case 'by-date':
        return new DateOrderIterator(this.root);
      default:
        return new DepthFirstIterator(this.root);
    }
  }
  
  private buildMockFileSystem(): void {
    // Create a mock file system structure
    const documents = new FileSystemNode('Documents', 'directory');
    const downloads = new FileSystemNode('Downloads', 'directory');
    const pictures = new FileSystemNode('Pictures', 'directory');
    
    // Add files to Documents
    documents.addChild(new FileSystemNode('report.pdf', 'file', 2048576, new Date('2024-01-15')));
    documents.addChild(new FileSystemNode('presentation.pptx', 'file', 1048576, new Date('2024-01-20')));
    documents.addChild(new FileSystemNode('.hidden.txt', 'file', 1024, new Date('2024-01-10'), true));
    
    // Add files to Downloads
    downloads.addChild(new FileSystemNode('image.jpg', 'file', 524288, new Date('2024-01-25')));
    downloads.addChild(new FileSystemNode('video.mp4', 'file', 52428800, new Date('2024-01-22')));
    downloads.addChild(new FileSystemNode('archive.zip', 'file', 15728640, new Date('2024-01-18')));
    
    // Add subdirectories to Pictures
    const vacation = new FileSystemNode('Vacation', 'directory');
    vacation.addChild(new FileSystemNode('beach.jpg', 'file', 2097152, new Date('2024-01-30')));
    vacation.addChild(new FileSystemNode('mountain.jpg', 'file', 3145728, new Date('2024-01-31')));
    
    pictures.addChild(vacation);
    pictures.addChild(new FileSystemNode('screenshot.png', 'file', 1048576, new Date('2024-01-28')));
    
    // Add to root
    this.root.addChild(documents);
    this.root.addChild(downloads);
    this.root.addChild(pictures);
  }
}

// Depth-first iterator
class DepthFirstIterator implements Iterator<FileSystemItem> {
  private stack: { node: FileSystemNode; path: string }[] = [];
  private currentIndex: number = 0;
  private items: FileSystemItem[] = [];
  
  constructor(private root: FileSystemNode) {
    this.traverse();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): FileSystemItem {
    if (!this.hasNext()) {
      throw new Error('No more items');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): FileSystemItem {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current item');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private traverse(): void {
    this.stack = [{ node: this.root, path: '' }];
    
    while (this.stack.length > 0) {
      const { node, path } = this.stack.pop()!;
      
      // Add current node to items
      if (node !== this.root) {
        this.items.push(node.toFileSystemItem(path));
      }
      
      // Add children to stack (reverse order for correct traversal)
      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i];
        const childPath = path ? `${path}/${node.name}` : node.name;
        this.stack.push({ node: child, path: childPath });
      }
    }
  }
}

// Breadth-first iterator
class BreadthFirstIterator implements Iterator<FileSystemItem> {
  private queue: { node: FileSystemNode; path: string }[] = [];
  private currentIndex: number = 0;
  private items: FileSystemItem[] = [];
  
  constructor(private root: FileSystemNode) {
    this.traverse();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): FileSystemItem {
    if (!this.hasNext()) {
      throw new Error('No more items');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): FileSystemItem {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current item');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private traverse(): void {
    this.queue = [{ node: this.root, path: '' }];
    
    while (this.queue.length > 0) {
      const { node, path } = this.queue.shift()!;
      
      // Add current node to items
      if (node !== this.root) {
        this.items.push(node.toFileSystemItem(path));
      }
      
      // Add children to queue
      for (const child of node.children) {
        const childPath = path ? `${path}/${node.name}` : node.name;
        this.queue.push({ node: child, path: childPath });
      }
    }
  }
}

// Size-ordered iterator
class SizeOrderIterator implements Iterator<FileSystemItem> {
  private currentIndex: number = 0;
  private items: FileSystemItem[] = [];
  
  constructor(private root: FileSystemNode) {
    this.collectAndSort();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): FileSystemItem {
    if (!this.hasNext()) {
      throw new Error('No more items');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): FileSystemItem {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current item');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private collectAndSort(): void {
    // Collect all items first
    const depthFirst = new DepthFirstIterator(this.root);
    while (depthFirst.hasNext()) {
      this.items.push(depthFirst.next());
    }
    
    // Sort by size (largest first)
    this.items.sort((a, b) => b.size - a.size);
  }
}

// Date-ordered iterator
class DateOrderIterator implements Iterator<FileSystemItem> {
  private currentIndex: number = 0;
  private items: FileSystemItem[] = [];
  
  constructor(private root: FileSystemNode) {
    this.collectAndSort();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): FileSystemItem {
    if (!this.hasNext()) {
      throw new Error('No more items');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): FileSystemItem {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current item');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private collectAndSort(): void {
    // Collect all items first
    const depthFirst = new DepthFirstIterator(this.root);
    while (depthFirst.hasNext()) {
      this.items.push(depthFirst.next());
    }
    
    // Sort by date (newest first)
    this.items.sort((a, b) => b.modifiedDate.getTime() - a.modifiedDate.getTime());
  }
}

// Demo
console.log('=== FILE SYSTEM TRAVERSAL ITERATOR DEMO ===\n');

const fileSystem = new FileSystem();

// Depth-first traversal
console.log('--- Depth-First Traversal ---');
const depthFirstIterator = fileSystem.createIterator('depth-first');
while (depthFirstIterator.hasNext()) {
  const item = depthFirstIterator.next();
  const sizeKB = Math.round(item.size / 1024);
  console.log(`  📁 ${item.path} (${sizeKB} KB) - ${item.modifiedDate.toLocaleDateString()}`);
}

// Breadth-first traversal
console.log('\n--- Breadth-First Traversal ---');
const breadthFirstIterator = fileSystem.createIterator('breadth-first');
while (breadthFirstIterator.hasNext()) {
  const item = breadthFirstIterator.next();
  const sizeKB = Math.round(item.size / 1024);
  console.log(`  📁 ${item.path} (${sizeKB} KB) - ${item.modifiedDate.toLocaleDateString()}`);
}

// Size-ordered traversal
console.log('\n--- Size-Ordered Traversal (Largest First) ---');
const sizeIterator = fileSystem.createIterator('by-size');
while (sizeIterator.hasNext()) {
  const item = sizeIterator.next();
  const sizeMB = Math.round(item.size / (1024 * 1024) * 100) / 100;
  console.log(`  📁 ${item.path} (${sizeMB} MB) - ${item.modifiedDate.toLocaleDateString()}`);
}

// Date-ordered traversal
console.log('\n--- Date-Ordered Traversal (Newest First) ---');
const dateIterator = fileSystem.createIterator('by-date');
while (dateIterator.hasNext()) {
  const item = dateIterator.next();
  const sizeKB = Math.round(item.size / 1024);
  console.log(`  📁 ${item.path} (${sizeKB} KB) - ${item.modifiedDate.toLocaleDateString()}`);
}

// Reset and iterate again
console.log('\n--- Reset and Iterate Again (Depth-First) ---');
depthFirstIterator.reset();
let count = 0;
while (depthFirstIterator.hasNext() && count < 3) {
  const item = depthFirstIterator.next();
  const sizeKB = Math.round(item.size / 1024);
  console.log(`  📁 ${item.path} (${sizeKB} KB)`);
  count++;
}

console.log('\n✅ File system traversal completed successfully');

exit(0); 