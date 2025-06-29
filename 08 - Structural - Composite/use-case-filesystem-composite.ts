// ============================================================================
// FILE SYSTEM COMPOSITE - Calculate size & render directory tree
// ============================================================================
import { exit } from 'process';

// 1. Component interface
interface FileSystemEntity {
  getName(): string;
  getSize(): number; // bytes
  render(indent?: string): void;
}

// 2. Leaf
class File implements FileSystemEntity {
  constructor(private name: string, private size: number) {}
  getName(){return this.name;}
  getSize(){return this.size;}
  render(indent: string=''){
    console.log(`${indent}📄 ${this.name} (${this.size}B)`);
  }
}

// 3. Composite
class Folder implements FileSystemEntity {
  private children: FileSystemEntity[]=[];
  constructor(private name:string){}
  add(child: FileSystemEntity){this.children.push(child);}
  remove(child: FileSystemEntity){this.children=this.children.filter(c=>c!==child);}  
  getName(){return this.name;}
  getSize(){return this.children.reduce((sum,c)=>sum+c.getSize(),0);}  
  render(indent: string=''){
    console.log(`${indent}📁 ${this.name}/ (${this.getSize()}B)`);
    this.children.forEach(c=>c.render(indent+'  '));
  }
}

// 4. Demo
function buildSampleFS(): Folder {
  const root=new Folder('root');
  const docs=new Folder('docs');
  docs.add(new File('readme.md',1200));
  docs.add(new File('license.txt',800));
  const src=new Folder('src');
  src.add(new File('index.ts',2400));
  const assets=new Folder('assets');
  assets.add(new File('logo.png',5300));
  src.add(assets);
  root.add(docs);root.add(src);
  return root;
}

(function demo(){
  console.log('=== FILE SYSTEM COMPOSITE DEMO ===');
  const fs=buildSampleFS();
  fs.render();
  console.log('\nTotal size:',fs.getSize(),'bytes');
  exit(0);
})();

export {FileSystemEntity, File, Folder}; 