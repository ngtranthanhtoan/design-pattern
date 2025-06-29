/**
 * Visitor Pattern - Document Processing Use Case
 * 
 * This example demonstrates how the Visitor pattern can be used to separate
 * different operations (export, print, validate, count words) from document
 * element classes. Each operation becomes a visitor that implements specific
 * logic for each element type.
 */

import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

// Visitor interface for document operations
interface DocumentVisitor {
  visitParagraph(paragraph: Paragraph): void;
  visitImage(image: Image): void;
  visitTable(table: Table): void;
}

// Base interface for all document elements
interface DocumentElement {
  accept(visitor: DocumentVisitor): void;
}

// ============================================================================
// CONCRETE ELEMENT CLASSES
// ============================================================================

class Paragraph implements DocumentElement {
  constructor(
    private content: string,
    private fontSize: number = 12,
    private fontFamily: string = "Arial"
  ) {}

  getContent(): string {
    return this.content;
  }

  getFontSize(): number {
    return this.fontSize;
  }

  getFontFamily(): string {
    return this.fontFamily;
  }

  getWordCount(): number {
    return this.content.split(/\s+/).filter(word => word.length > 0).length;
  }

  accept(visitor: DocumentVisitor): void {
    visitor.visitParagraph(this);
  }
}

class Image implements DocumentElement {
  constructor(
    private src: string,
    private alt: string,
    private width: number,
    private height: number,
    private format: string
  ) {}

  getSrc(): string {
    return this.src;
  }

  getAlt(): string {
    return this.alt;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getFormat(): string {
    return this.format;
  }

  getFileSize(): number {
    // Simulate file size calculation
    return this.width * this.height * 3; // 3 bytes per pixel (RGB)
  }

  accept(visitor: DocumentVisitor): void {
    visitor.visitImage(this);
  }
}

class Table implements DocumentElement {
  constructor(
    private headers: string[],
    private rows: string[][],
    private caption: string = ""
  ) {}

  getHeaders(): string[] {
    return this.headers;
  }

  getRows(): string[][] {
    return this.rows;
  }

  getCaption(): string {
    return this.caption;
  }

  getRowCount(): number {
    return this.rows.length;
  }

  getColumnCount(): number {
    return this.headers.length;
  }

  getCellCount(): number {
    return this.headers.length * this.rows.length;
  }

  accept(visitor: DocumentVisitor): void {
    visitor.visitTable(this);
  }
}

// ============================================================================
// CONCRETE VISITOR CLASSES
// ============================================================================

class PDFExporter implements DocumentVisitor {
  private output: string[] = [];

  visitParagraph(paragraph: Paragraph): void {
    this.output.push(`<p style="font-family: ${paragraph.getFontFamily()}; font-size: ${paragraph.getFontSize()}px;">`);
    this.output.push(`  ${paragraph.getContent()}`);
    this.output.push(`</p>`);
  }

  visitImage(image: Image): void {
    this.output.push(`<img src="${image.getSrc()}" alt="${image.getAlt()}" width="${image.getWidth()}" height="${image.getHeight()}" />`);
  }

  visitTable(table: Table): void {
    this.output.push(`<table>`);
    if (table.getCaption()) {
      this.output.push(`  <caption>${table.getCaption()}</caption>`);
    }
    this.output.push(`  <thead>`);
    this.output.push(`    <tr>`);
    table.getHeaders().forEach(header => {
      this.output.push(`      <th>${header}</th>`);
    });
    this.output.push(`    </tr>`);
    this.output.push(`  </thead>`);
    this.output.push(`  <tbody>`);
    table.getRows().forEach(row => {
      this.output.push(`    <tr>`);
      row.forEach(cell => {
        this.output.push(`      <td>${cell}</td>`);
      });
      this.output.push(`    </tr>`);
    });
    this.output.push(`  </tbody>`);
    this.output.push(`</table>`);
  }

  getOutput(): string {
    return this.output.join('\n');
  }

  reset(): void {
    this.output = [];
  }
}

class Printer implements DocumentVisitor {
  private output: string[] = [];

  visitParagraph(paragraph: Paragraph): void {
    this.output.push(`[PRINT] Paragraph: "${paragraph.getContent().substring(0, 50)}${paragraph.getContent().length > 50 ? '...' : ''}"`);
    this.output.push(`[PRINT] Font: ${paragraph.getFontFamily()} ${paragraph.getFontSize()}px`);
  }

  visitImage(image: Image): void {
    this.output.push(`[PRINT] Image: ${image.getAlt()} (${image.getWidth()}x${image.getHeight()})`);
    this.output.push(`[PRINT] Source: ${image.getSrc()}`);
  }

  visitTable(table: Table): void {
    this.output.push(`[PRINT] Table: ${table.getCaption() || 'Untitled'}`);
    this.output.push(`[PRINT] Dimensions: ${table.getRowCount()} rows x ${table.getColumnCount()} columns`);
  }

  getOutput(): string {
    return this.output.join('\n');
  }

  reset(): void {
    this.output = [];
  }
}

class Validator implements DocumentVisitor {
  private errors: string[] = [];
  private warnings: string[] = [];

  visitParagraph(paragraph: Paragraph): void {
    // Validate paragraph content
    if (paragraph.getContent().length === 0) {
      this.errors.push(`Paragraph is empty`);
    }
    if (paragraph.getContent().length > 1000) {
      this.warnings.push(`Paragraph is very long (${paragraph.getContent().length} characters)`);
    }
    if (paragraph.getFontSize() < 8 || paragraph.getFontSize() > 72) {
      this.warnings.push(`Paragraph font size (${paragraph.getFontSize()}px) is outside recommended range`);
    }
  }

  visitImage(image: Image): void {
    // Validate image properties
    if (!image.getAlt()) {
      this.errors.push(`Image missing alt text: ${image.getSrc()}`);
    }
    if (image.getWidth() === 0 || image.getHeight() === 0) {
      this.errors.push(`Image has invalid dimensions: ${image.getSrc()}`);
    }
    if (image.getWidth() > 2000 || image.getHeight() > 2000) {
      this.warnings.push(`Image is very large: ${image.getWidth()}x${image.getHeight()}`);
    }
  }

  visitTable(table: Table): void {
    // Validate table structure
    if (table.getHeaders().length === 0) {
      this.errors.push(`Table has no headers`);
    }
    if (table.getRows().length === 0) {
      this.warnings.push(`Table has no data rows`);
    }
    table.getRows().forEach((row, index) => {
      if (row.length !== table.getHeaders().length) {
        this.errors.push(`Row ${index + 1} has ${row.length} cells, expected ${table.getHeaders().length}`);
      }
    });
  }

  getErrors(): string[] {
    return this.errors;
  }

  getWarnings(): string[] {
    return this.warnings;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  reset(): void {
    this.errors = [];
    this.warnings = [];
  }
}

class WordCounter implements DocumentVisitor {
  private totalWords: number = 0;
  private elementCounts: Map<string, number> = new Map();

  visitParagraph(paragraph: Paragraph): void {
    const wordCount = paragraph.getWordCount();
    this.totalWords += wordCount;
    this.elementCounts.set('paragraphs', (this.elementCounts.get('paragraphs') || 0) + 1);
    console.log(`Paragraph: ${wordCount} words`);
  }

  visitImage(image: Image): void {
    // Images don't contribute to word count
    this.elementCounts.set('images', (this.elementCounts.get('images') || 0) + 1);
    console.log(`Image: ${image.getAlt()} (no words)`);
  }

  visitTable(table: Table): void {
    let tableWords = 0;
    table.getHeaders().forEach(header => {
      tableWords += header.split(/\s+/).filter(word => word.length > 0).length;
    });
    table.getRows().forEach(row => {
      row.forEach(cell => {
        tableWords += cell.split(/\s+/).filter(word => word.length > 0).length;
      });
    });
    this.totalWords += tableWords;
    this.elementCounts.set('tables', (this.elementCounts.get('tables') || 0) + 1);
    console.log(`Table: ${tableWords} words`);
  }

  getTotalWords(): number {
    return this.totalWords;
  }

  getElementCounts(): Map<string, number> {
    return this.elementCounts;
  }

  reset(): void {
    this.totalWords = 0;
    this.elementCounts.clear();
  }
}

// ============================================================================
// DOCUMENT STRUCTURE
// ============================================================================

class Document {
  private elements: DocumentElement[] = [];

  addElement(element: DocumentElement): void {
    this.elements.push(element);
  }

  accept(visitor: DocumentVisitor): void {
    this.elements.forEach(element => element.accept(visitor));
  }

  getElementCount(): number {
    return this.elements.length;
  }
}

// ============================================================================
// USAGE EXAMPLES AND TESTING
// ============================================================================

function demonstrateDocumentProcessing(): void {
  console.log("📄 Document Processing with Visitor Pattern");
  console.log("===========================================\n");

  // Create a document with various elements
  const document = new Document();
  
  document.addElement(new Paragraph("This is the first paragraph of our document. It contains some text that we will process using different visitors.", 14, "Times New Roman"));
  document.addElement(new Image("header.jpg", "Document Header", 800, 200, "JPEG"));
  document.addElement(new Table(["Name", "Age", "City"], [
    ["John Doe", "30", "New York"],
    ["Jane Smith", "25", "Los Angeles"],
    ["Bob Johnson", "35", "Chicago"]
  ], "Employee Information"));
  document.addElement(new Paragraph("This is another paragraph with different content. It demonstrates how the visitor pattern can handle multiple operations on the same elements.", 12, "Arial"));
  document.addElement(new Image("chart.png", "Sales Chart", 600, 400, "PNG"));

  console.log(`Document created with ${document.getElementCount()} elements\n`);

  // Test 1: PDF Export
  console.log("1️⃣ PDF Export Operation:");
  console.log("------------------------");
  const pdfExporter = new PDFExporter();
  document.accept(pdfExporter);
  console.log(pdfExporter.getOutput());
  console.log();

  // Test 2: Print Operation
  console.log("2️⃣ Print Operation:");
  console.log("------------------");
  const printer = new Printer();
  document.accept(printer);
  console.log(printer.getOutput());
  console.log();

  // Test 3: Validation
  console.log("3️⃣ Validation Operation:");
  console.log("------------------------");
  const validator = new Validator();
  document.accept(validator);
  
  if (validator.isValid()) {
    console.log("✅ Document is valid!");
  } else {
    console.log("❌ Document has errors:");
    validator.getErrors().forEach(error => console.log(`  - ${error}`));
  }
  
  if (validator.getWarnings().length > 0) {
    console.log("⚠️  Warnings:");
    validator.getWarnings().forEach(warning => console.log(`  - ${warning}`));
  }
  console.log();

  // Test 4: Word Counting
  console.log("4️⃣ Word Counting Operation:");
  console.log("----------------------------");
  const wordCounter = new WordCounter();
  document.accept(wordCounter);
  console.log(`\n📊 Summary:`);
  console.log(`Total words: ${wordCounter.getTotalWords()}`);
  wordCounter.getElementCounts().forEach((count, elementType) => {
    console.log(`${elementType}: ${count}`);
  });
  console.log();

  // Test 5: Edge Cases
  console.log("5️⃣ Edge Cases Testing:");
  console.log("----------------------");
  const edgeCaseDocument = new Document();
  
  // Empty paragraph
  edgeCaseDocument.addElement(new Paragraph("", 6, "Arial"));
  
  // Image without alt text
  edgeCaseDocument.addElement(new Image("test.jpg", "", 0, 0, "JPEG"));
  
  // Table with mismatched columns
  edgeCaseDocument.addElement(new Table([], [
    ["Only", "Two", "Columns"],
    ["Three", "Columns", "Here", "Extra"]
  ]));

  const edgeCaseValidator = new Validator();
  edgeCaseDocument.accept(edgeCaseValidator);
  
  console.log("Edge case validation results:");
  if (!edgeCaseValidator.isValid()) {
    console.log("❌ Errors found:");
    edgeCaseValidator.getErrors().forEach(error => console.log(`  - ${error}`));
  }
  if (edgeCaseValidator.getWarnings().length > 0) {
    console.log("⚠️  Warnings:");
    edgeCaseValidator.getWarnings().forEach(warning => console.log(`  - ${warning}`));
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

if (require.main === module) {
  try {
    demonstrateDocumentProcessing();
    console.log("✅ All document processing operations completed successfully!");
  } catch (error) {
    console.error("❌ Error during document processing:", error);
    exit(1);
  }
}

export {
  DocumentVisitor,
  DocumentElement,
  Paragraph,
  Image,
  Table,
  PDFExporter,
  Printer,
  Validator,
  WordCounter,
  Document
}; 