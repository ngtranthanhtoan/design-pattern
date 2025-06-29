/**
 * Visitor Pattern - File System Operations Use Case
 * 
 * This example demonstrates how the Visitor pattern can be used in file system
 * operations to separate different operations (backup, search, permissions,
 * size calculation) from file system object classes.
 */

import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface FileSystemVisitor {
  visitFile(file: File): void;
  visitDirectory(directory: Directory): void;
  visitSymbolicLink(symlink: SymbolicLink): void;
}

interface FileSystemObject {
  accept(visitor: FileSystemVisitor): void;
  getName(): string;
  getPath(): string;
  getSize(): number;
  getPermissions(): string;
  getOwner(): string;
  getGroup(): string;
  getModifiedTime(): Date;
}

// ============================================================================
// CONCRETE FILE SYSTEM OBJECT CLASSES
// ============================================================================

class File implements FileSystemObject {
  constructor(
    private name: string,
    private path: string,
    private size: number,
    private permissions: string = "rw-r--r--",
    private owner: string = "user",
    private group: string = "users",
    private modifiedTime: Date = new Date(),
    private content: string = ""
  ) {}

  getName(): string {
    return this.name;
  }

  getPath(): string {
    return this.path;
  }

  getSize(): number {
    return this.size;
  }

  getPermissions(): string {
    return this.permissions;
  }

  getOwner(): string {
    return this.owner;
  }

  getGroup(): string {
    return this.group;
  }

  getModifiedTime(): Date {
    return this.modifiedTime;
  }

  getContent(): string {
    return this.content;
  }

  accept(visitor: FileSystemVisitor): void {
    visitor.visitFile(this);
  }
}

class Directory implements FileSystemObject {
  private children: FileSystemObject[] = [];

  constructor(
    private name: string,
    private path: string,
    private permissions: string = "rwxr-xr-x",
    private owner: string = "user",
    private group: string = "users",
    private modifiedTime: Date = new Date()
  ) {}

  getName(): string {
    return this.name;
  }

  getPath(): string {
    return this.path;
  }

  getSize(): number {
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }

  getPermissions(): string {
    return this.permissions;
  }

  getOwner(): string {
    return this.owner;
  }

  getGroup(): string {
    return this.group;
  }

  getModifiedTime(): Date {
    return this.modifiedTime;
  }

  getChildren(): FileSystemObject[] {
    return [...this.children];
  }

  addChild(child: FileSystemObject): void {
    this.children.push(child);
  }

  getChildCount(): number {
    return this.children.length;
  }

  accept(visitor: FileSystemVisitor): void {
    visitor.visitDirectory(this);
    this.children.forEach(child => child.accept(visitor));
  }
}

class SymbolicLink implements FileSystemObject {
  constructor(
    private name: string,
    private path: string,
    private targetPath: string,
    private permissions: string = "lrwxrwxrwx",
    private owner: string = "user",
    private group: string = "users",
    private modifiedTime: Date = new Date()
  ) {}

  getName(): string {
    return this.name;
  }

  getPath(): string {
    return this.path;
  }

  getSize(): number {
    return this.targetPath.length;
  }

  getPermissions(): string {
    return this.permissions;
  }

  getOwner(): string {
    return this.owner;
  }

  getGroup(): string {
    return this.group;
  }

  getModifiedTime(): Date {
    return this.modifiedTime;
  }

  getTargetPath(): string {
    return this.targetPath;
  }

  accept(visitor: FileSystemVisitor): void {
    visitor.visitSymbolicLink(this);
  }
}

// ============================================================================
// CONCRETE VISITOR CLASSES
// ============================================================================

class BackupVisitor implements FileSystemVisitor {
  private backupLog: string[] = [];
  private totalSize: number = 0;
  private fileCount: number = 0;
  private directoryCount: number = 0;
  private symlinkCount: number = 0;

  visitFile(file: File): void {
    this.backupLog.push(`[BACKUP] File: ${file.getPath()} (${file.getSize()} bytes)`);
    this.backupLog.push(`[BACKUP]   Owner: ${file.getOwner()}:${file.getGroup()}, Permissions: ${file.getPermissions()}`);
    this.backupLog.push(`[BACKUP]   Content: ${file.getContent().substring(0, 50)}${file.getContent().length > 50 ? '...' : ''}`);
    
    this.totalSize += file.getSize();
    this.fileCount++;
  }

  visitDirectory(directory: Directory): void {
    this.backupLog.push(`[BACKUP] Directory: ${directory.getPath()} (${directory.getChildCount()} children)`);
    this.backupLog.push(`[BACKUP]   Owner: ${directory.getOwner()}:${directory.getGroup()}, Permissions: ${directory.getPermissions()}`);
    
    this.directoryCount++;
  }

  visitSymbolicLink(symlink: SymbolicLink): void {
    this.backupLog.push(`[BACKUP] Symlink: ${symlink.getPath()} -> ${symlink.getTargetPath()}`);
    this.backupLog.push(`[BACKUP]   Owner: ${symlink.getOwner()}:${symlink.getGroup()}, Permissions: ${symlink.getPermissions()}`);
    
    this.totalSize += symlink.getSize();
    this.symlinkCount++;
  }

  getBackupLog(): string[] {
    return this.backupLog;
  }

  getSummary(): { totalSize: number; fileCount: number; directoryCount: number; symlinkCount: number } {
    return {
      totalSize: this.totalSize,
      fileCount: this.fileCount,
      directoryCount: this.directoryCount,
      symlinkCount: this.symlinkCount
    };
  }
}

class SearchVisitor implements FileSystemVisitor {
  private searchResults: string[] = [];
  private searchTerm: string;

  constructor(searchTerm: string) {
    this.searchTerm = searchTerm.toLowerCase();
  }

  visitFile(file: File): void {
    const fileName = file.getName().toLowerCase();
    const fileContent = file.getContent().toLowerCase();
    
    if (fileName.includes(this.searchTerm) || fileContent.includes(this.searchTerm)) {
      this.searchResults.push(`[SEARCH] Match found in file: ${file.getPath()}`);
      this.searchResults.push(`[SEARCH]   Name: ${file.getName()}, Size: ${file.getSize()} bytes`);
    }
  }

  visitDirectory(directory: Directory): void {
    const dirName = directory.getName().toLowerCase();
    
    if (dirName.includes(this.searchTerm)) {
      this.searchResults.push(`[SEARCH] Match found in directory: ${directory.getPath()}`);
      this.searchResults.push(`[SEARCH]   Name: ${directory.getName()}, Children: ${directory.getChildCount()}`);
    }
  }

  visitSymbolicLink(symlink: SymbolicLink): void {
    const linkName = symlink.getName().toLowerCase();
    const targetPath = symlink.getTargetPath().toLowerCase();
    
    if (linkName.includes(this.searchTerm) || targetPath.includes(this.searchTerm)) {
      this.searchResults.push(`[SEARCH] Match found in symlink: ${symlink.getPath()}`);
      this.searchResults.push(`[SEARCH]   Name: ${symlink.getName()}, Target: ${symlink.getTargetPath()}`);
    }
  }

  getSearchResults(): string[] {
    return this.searchResults;
  }

  getMatchCount(): number {
    return this.searchResults.filter(result => result.includes('[SEARCH] Match found')).length;
  }
}

class PermissionVisitor implements FileSystemVisitor {
  private permissionIssues: string[] = [];

  visitFile(file: File): void {
    const permissions = file.getPermissions();
    
    if (permissions.includes('w') && permissions.endsWith('w')) {
      this.permissionIssues.push(`[PERMISSIONS] Security issue: World-writable file ${file.getPath()}`);
    }
  }

  visitDirectory(directory: Directory): void {
    const permissions = directory.getPermissions();
    
    if (permissions.includes('w') && permissions.endsWith('w')) {
      this.permissionIssues.push(`[PERMISSIONS] Security issue: World-writable directory ${directory.getPath()}`);
    }
  }

  visitSymbolicLink(symlink: SymbolicLink): void {
    const permissions = symlink.getPermissions();
    
    if (!permissions.startsWith('l')) {
      this.permissionIssues.push(`[PERMISSIONS] Warning: Symlink ${symlink.getPath()} has unusual permissions`);
    }
  }

  getPermissionIssues(): string[] {
    return this.permissionIssues;
  }

  getIssueCount(): number {
    return this.permissionIssues.length;
  }
}

class SizeCalculator implements FileSystemVisitor {
  private totalSize: number = 0;
  private fileCount: number = 0;
  private directoryCount: number = 0;
  private symlinkCount: number = 0;

  visitFile(file: File): void {
    const size = file.getSize();
    this.totalSize += size;
    this.fileCount++;
    
    console.log(`[SIZE] File: ${file.getPath()} - ${size} bytes`);
  }

  visitDirectory(directory: Directory): void {
    const size = directory.getSize();
    this.directoryCount++;
    
    console.log(`[SIZE] Directory: ${directory.getPath()} - ${size} bytes (${directory.getChildCount()} children)`);
  }

  visitSymbolicLink(symlink: SymbolicLink): void {
    const size = symlink.getSize();
    this.totalSize += size;
    this.symlinkCount++;
    
    console.log(`[SIZE] Symlink: ${symlink.getPath()} - ${size} bytes (target: ${symlink.getTargetPath()})`);
  }

  getTotalSize(): number {
    return this.totalSize;
  }

  getSummary(): { totalSize: number; fileCount: number; directoryCount: number; symlinkCount: number } {
    return {
      totalSize: this.totalSize,
      fileCount: this.fileCount,
      directoryCount: this.directoryCount,
      symlinkCount: this.symlinkCount
    };
  }
}

// ============================================================================
// FILE SYSTEM STRUCTURE
// ============================================================================

class FileSystem {
  private root: Directory;

  constructor() {
    this.root = new Directory("root", "/");
  }

  getRoot(): Directory {
    return this.root;
  }

  accept(visitor: FileSystemVisitor): void {
    this.root.accept(visitor);
  }

  addToRoot(object: FileSystemObject): void {
    this.root.addChild(object);
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

function demonstrateFileSystemOperations(): void {
  console.log("📁 File System Operations with Visitor Pattern");
  console.log("==============================================\n");

  // Create a file system structure
  const fs = new FileSystem();
  
  // Add some files
  const readmeFile = new File("README.md", "/README.md", 1024, "rw-r--r--", "user", "users", new Date(), "# Project Documentation\nThis is a sample project with documentation.");
  const configFile = new File("config.json", "/config.json", 512, "rw-rw-rw-", "user", "users", new Date(), '{"debug": true, "port": 3000}');
  
  // Add directories
  const srcDir = new Directory("src", "/src");
  const docsDir = new Directory("docs", "/docs", "rwxrwxrwx"); // World-writable for testing
  
  // Add files to directories
  const mainFile = new File("main.ts", "/src/main.ts", 2048, "rw-r--r--", "user", "users", new Date(), "import { Component } from 'react';\n\nclass App extends Component {\n  render() {\n    return <div>Hello World</div>;\n  }\n}");
  
  srcDir.addChild(mainFile);
  
  // Add symlinks
  const symlink = new SymbolicLink("current", "/current", "/src/main.ts");
  
  // Build the file system
  fs.addToRoot(readmeFile);
  fs.addToRoot(configFile);
  fs.addToRoot(srcDir);
  fs.addToRoot(docsDir);
  fs.addToRoot(symlink);

  console.log(`File system created with ${fs.getRoot().getChildCount()} root objects\n`);

  // Test 1: Backup Operation
  console.log("1️⃣ Backup Operation:");
  console.log("-------------------");
  const backupVisitor = new BackupVisitor();
  fs.accept(backupVisitor);
  
  console.log("Backup log:");
  backupVisitor.getBackupLog().forEach(log => console.log(log));
  
  const backupSummary = backupVisitor.getSummary();
  console.log(`\n📊 Backup Summary:`);
  console.log(`Total size: ${backupSummary.totalSize} bytes`);
  console.log(`Files: ${backupSummary.fileCount}`);
  console.log(`Directories: ${backupSummary.directoryCount}`);
  console.log(`Symlinks: ${backupSummary.symlinkCount}`);
  console.log();

  // Test 2: Search Operation
  console.log("2️⃣ Search Operation:");
  console.log("-------------------");
  const searchVisitor = new SearchVisitor("main");
  fs.accept(searchVisitor);
  
  console.log("Search results:");
  searchVisitor.getSearchResults().forEach(result => console.log(result));
  console.log(`\nFound ${searchVisitor.getMatchCount()} matches`);
  console.log();

  // Test 3: Permission Analysis
  console.log("3️⃣ Permission Analysis:");
  console.log("------------------------");
  const permissionVisitor = new PermissionVisitor();
  fs.accept(permissionVisitor);
  
  console.log("Permission issues:");
  permissionVisitor.getPermissionIssues().forEach(issue => console.log(issue));
  console.log(`\nTotal issues found: ${permissionVisitor.getIssueCount()}`);
  console.log();

  // Test 4: Size Calculation
  console.log("4️⃣ Size Calculation:");
  console.log("---------------------");
  const sizeCalculator = new SizeCalculator();
  fs.accept(sizeCalculator);
  
  const sizeSummary = sizeCalculator.getSummary();
  console.log(`\n📊 Size Summary:`);
  console.log(`Total size: ${sizeSummary.totalSize} bytes`);
  console.log(`Files: ${sizeSummary.fileCount}`);
  console.log(`Directories: ${sizeSummary.directoryCount}`);
  console.log(`Symlinks: ${sizeSummary.symlinkCount}`);
  console.log();
}

if (require.main === module) {
  try {
    demonstrateFileSystemOperations();
    console.log("✅ All file system operations completed successfully!");
  } catch (error) {
    console.error("❌ Error during file system operations:", error);
    exit(1);
  }
}

export {
  FileSystemVisitor,
  FileSystemObject,
  File,
  Directory,
  SymbolicLink,
  BackupVisitor,
  SearchVisitor,
  PermissionVisitor,
  SizeCalculator,
  FileSystem
}; 