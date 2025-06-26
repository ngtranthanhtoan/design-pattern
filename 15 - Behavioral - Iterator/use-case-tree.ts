import { exit } from 'process';

// Iterator interface
interface Iterator<T> {
  hasNext(): boolean;
  next(): T;
  current(): T;
  reset(): void;
}

// Tree node interface
interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
  addChild(child: TreeNode<T>): void;
  getChildren(): TreeNode<T>[];
  getValue(): T;
}

// Generic tree node implementation
class GenericTreeNode<T> implements TreeNode<T> {
  public children: TreeNode<T>[] = [];
  
  constructor(public value: T) {}
  
  addChild(child: TreeNode<T>): void {
    this.children.push(child);
  }
  
  getChildren(): TreeNode<T>[] {
    return this.children;
  }
  
  getValue(): T {
    return this.value;
  }
}

// Tree collection interface
interface TreeCollection<T> {
  getRoot(): TreeNode<T>;
  createIterator(strategy: 'pre-order' | 'post-order' | 'level-order'): Iterator<T>;
}

// Generic tree collection
class GenericTree<T> implements TreeCollection<T> {
  private root: TreeNode<T>;
  
  constructor(root: TreeNode<T>) {
    this.root = root;
  }
  
  getRoot(): TreeNode<T> {
    return this.root;
  }
  
  createIterator(strategy: 'pre-order' | 'post-order' | 'level-order'): Iterator<T> {
    switch (strategy) {
      case 'pre-order':
        return new PreOrderIterator<T>(this.root);
      case 'post-order':
        return new PostOrderIterator<T>(this.root);
      case 'level-order':
        return new LevelOrderIterator<T>(this.root);
      default:
        return new PreOrderIterator<T>(this.root);
    }
  }
}

// Pre-order iterator (Root -> Left -> Right)
class PreOrderIterator<T> implements Iterator<T> {
  private stack: TreeNode<T>[] = [];
  private currentIndex: number = 0;
  private items: T[] = [];
  
  constructor(private root: TreeNode<T>) {
    this.traverse();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): T {
    if (!this.hasNext()) {
      throw new Error('No more items');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): T {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current item');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private traverse(): void {
    this.stack = [this.root];
    
    while (this.stack.length > 0) {
      const node = this.stack.pop()!;
      this.items.push(node.getValue());
      
      // Add children to stack (reverse order for correct traversal)
      for (let i = node.getChildren().length - 1; i >= 0; i--) {
        this.stack.push(node.getChildren()[i]);
      }
    }
  }
}

// Post-order iterator (Left -> Right -> Root)
class PostOrderIterator<T> implements Iterator<T> {
  private stack: TreeNode<T>[] = [];
  private currentIndex: number = 0;
  private items: T[] = [];
  
  constructor(private root: TreeNode<T>) {
    this.traverse();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): T {
    if (!this.hasNext()) {
      throw new Error('No more items');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): T {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current item');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private traverse(): void {
    this.stack = [this.root];
    const visited = new Set<TreeNode<T>>();
    
    while (this.stack.length > 0) {
      const node = this.stack[this.stack.length - 1];
      
      // If all children have been visited, process this node
      const unvisitedChildren = node.getChildren().filter(child => !visited.has(child));
      
      if (unvisitedChildren.length === 0) {
        this.stack.pop();
        this.items.push(node.getValue());
        visited.add(node);
      } else {
        // Add unvisited children to stack
        for (let i = unvisitedChildren.length - 1; i >= 0; i--) {
          this.stack.push(unvisitedChildren[i]);
        }
      }
    }
  }
}

// Level-order iterator (Breadth-first)
class LevelOrderIterator<T> implements Iterator<T> {
  private queue: TreeNode<T>[] = [];
  private currentIndex: number = 0;
  private items: T[] = [];
  
  constructor(private root: TreeNode<T>) {
    this.traverse();
  }
  
  hasNext(): boolean {
    return this.currentIndex < this.items.length;
  }
  
  next(): T {
    if (!this.hasNext()) {
      throw new Error('No more items');
    }
    return this.items[this.currentIndex++];
  }
  
  current(): T {
    if (this.currentIndex >= this.items.length) {
      throw new Error('No current item');
    }
    return this.items[this.currentIndex];
  }
  
  reset(): void {
    this.currentIndex = 0;
  }
  
  private traverse(): void {
    this.queue = [this.root];
    
    while (this.queue.length > 0) {
      const node = this.queue.shift()!;
      this.items.push(node.getValue());
      
      // Add children to queue
      for (const child of node.getChildren()) {
        this.queue.push(child);
      }
    }
  }
}

// Organization chart specific types
interface Employee {
  id: number;
  name: string;
  title: string;
  department: string;
  salary: number;
}

// Demo
console.log('=== TREE STRUCTURE ITERATOR DEMO ===\n');

// Build organization chart
const ceo = new GenericTreeNode<Employee>({
  id: 1,
  name: 'John Smith',
  title: 'CEO',
  department: 'Executive',
  salary: 200000
});

const cto = new GenericTreeNode<Employee>({
  id: 2,
  name: 'Sarah Johnson',
  title: 'CTO',
  department: 'Technology',
  salary: 180000
});

const cfo = new GenericTreeNode<Employee>({
  id: 3,
  name: 'Mike Davis',
  title: 'CFO',
  department: 'Finance',
  salary: 175000
});

const devManager = new GenericTreeNode<Employee>({
  id: 4,
  name: 'Alex Chen',
  title: 'Development Manager',
  department: 'Technology',
  salary: 120000
});

const seniorDev = new GenericTreeNode<Employee>({
  id: 5,
  name: 'Lisa Wang',
  title: 'Senior Developer',
  department: 'Technology',
  salary: 95000
});

const juniorDev = new GenericTreeNode<Employee>({
  id: 6,
  name: 'Tom Brown',
  title: 'Junior Developer',
  department: 'Technology',
  salary: 75000
});

const accountant = new GenericTreeNode<Employee>({
  id: 7,
  name: 'Emma Wilson',
  title: 'Senior Accountant',
  department: 'Finance',
  salary: 85000
});

// Build the tree structure
ceo.addChild(cto);
ceo.addChild(cfo);

cto.addChild(devManager);
devManager.addChild(seniorDev);
devManager.addChild(juniorDev);

cfo.addChild(accountant);

// Create tree collection
const orgChart = new GenericTree<Employee>(ceo);

// Pre-order traversal (Root -> Left -> Right)
console.log('--- Pre-Order Traversal (Root -> Left -> Right) ---');
const preOrderIterator = orgChart.createIterator('pre-order');
while (preOrderIterator.hasNext()) {
  const employee = preOrderIterator.next();
  console.log(`  👤 ${employee.name} - ${employee.title} (${employee.department})`);
}

// Post-order traversal (Left -> Right -> Root)
console.log('\n--- Post-Order Traversal (Left -> Right -> Root) ---');
const postOrderIterator = orgChart.createIterator('post-order');
while (postOrderIterator.hasNext()) {
  const employee = postOrderIterator.next();
  console.log(`  👤 ${employee.name} - ${employee.title} (${employee.department})`);
}

// Level-order traversal (Breadth-first)
console.log('\n--- Level-Order Traversal (Breadth-First) ---');
const levelOrderIterator = orgChart.createIterator('level-order');
while (levelOrderIterator.hasNext()) {
  const employee = levelOrderIterator.next();
  console.log(`  👤 ${employee.name} - ${employee.title} (${employee.department})`);
}

// Reset and iterate again
console.log('\n--- Reset and Iterate Again (Pre-Order) ---');
preOrderIterator.reset();
let count = 0;
while (preOrderIterator.hasNext() && count < 3) {
  const employee = preOrderIterator.next();
  console.log(`  👤 ${employee.name} - ${employee.title}`);
  count++;
}

// Demonstrate different tree structure (file system)
console.log('\n--- File System Tree Example ---');
const root = new GenericTreeNode<string>('root');
const documents = new GenericTreeNode<string>('Documents');
const downloads = new GenericTreeNode<string>('Downloads');
const pictures = new GenericTreeNode<string>('Pictures');

root.addChild(documents);
root.addChild(downloads);
root.addChild(pictures);

documents.addChild(new GenericTreeNode<string>('report.pdf'));
documents.addChild(new GenericTreeNode<string>('presentation.pptx'));

downloads.addChild(new GenericTreeNode<string>('image.jpg'));
downloads.addChild(new GenericTreeNode<string>('video.mp4'));

const vacation = new GenericTreeNode<string>('Vacation');
pictures.addChild(vacation);
vacation.addChild(new GenericTreeNode<string>('beach.jpg'));
vacation.addChild(new GenericTreeNode<string>('mountain.jpg'));

const fileTree = new GenericTree<string>(root);

console.log('Pre-Order File System Traversal:');
const fileIterator = fileTree.createIterator('pre-order');
while (fileIterator.hasNext()) {
  const file = fileIterator.next();
  console.log(`  📁 ${file}`);
}

console.log('\n✅ Tree structure iteration completed successfully');

exit(0); 