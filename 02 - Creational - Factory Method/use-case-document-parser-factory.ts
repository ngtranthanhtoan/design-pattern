// ============================================================================
// DOCUMENT PARSER FACTORY - Multi-Format Document Processing
// ============================================================================

import { exit } from "process";

// Document metadata and content interfaces
interface DocumentMetadata {
  title?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  pageCount?: number;
  wordCount?: number;
  fileSize?: number;
  format: string;
  encoding?: string;
  [key: string]: any;
}

interface ParsedDocument {
  getTitle(): string;
  getText(): string;
  getMetadata(): DocumentMetadata;
  getImages(): string[];
  getTables(): any[][];
  getLinks(): { text: string; url: string }[];
  search(query: string): { position: number; context: string }[];
  export(format: 'txt' | 'json' | 'html'): string;
}

interface ParserConfig {
  extractImages?: boolean;
  extractTables?: boolean;
  extractLinks?: boolean;
  maxTextLength?: number;
  encoding?: string;
}

// Product interface - what all document parsers must implement
interface DocumentParser {
  parse(filePath: string, config?: ParserConfig): Promise<ParsedDocument>;
  canParse(mimeType: string): boolean;
  getSupportedFormats(): string[];
  validateFile(filePath: string): Promise<boolean>;
}

// Abstract Creator - defines the factory method
abstract class DocumentParserFactory {
  // Factory method - to be implemented by concrete creators
  abstract createParser(): DocumentParser;
  
  // Parse method that matches the documented API
  public async parse(filePath: string, config?: ParserConfig): Promise<ParsedDocument> {
    const parser = this.createParser();
    const isValid = await parser.validateFile(filePath);
    if (!isValid) {
      throw new Error('Invalid or corrupted file');
    }
    return await parser.parse(filePath, config);
  }
  
  // Static method to create appropriate factory based on MIME type
  public static createParser(mimeType: string): DocumentParserFactory {
    switch (mimeType.toLowerCase()) {
      case 'application/pdf':
        return new PDFParserFactory();
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return new ExcelParserFactory();
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return new WordParserFactory();
      case 'application/json':
        return new JSONParserFactory();
      case 'application/xml':
      case 'text/xml':
        return new XMLParserFactory();
      case 'text/plain':
        return new TextParserFactory();
      default:
        throw new Error(`Unsupported document type: ${mimeType}`);
    }
  }
  
  // Helper method to detect MIME type from file extension
  public static detectMimeType(filePath: string): string {
    const extension = filePath.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'xls': return 'application/vnd.ms-excel';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'json': return 'application/json';
      case 'xml': return 'application/xml';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  }
}

// Base parsed document implementation
class BaseDocument implements ParsedDocument {
  constructor(
    private title: string,
    private text: string,
    private metadata: DocumentMetadata,
    private images: string[] = [],
    private tables: any[][] = [],
    private links: { text: string; url: string }[] = []
  ) {}

  getTitle(): string {
    return this.title;
  }

  getText(): string {
    return this.text;
  }

  getMetadata(): DocumentMetadata {
    return this.metadata;
  }

  getImages(): string[] {
    return this.images;
  }

  getTables(): any[][] {
    return this.tables;
  }

  getLinks(): { text: string; url: string }[] {
    return this.links;
  }

  search(query: string): { position: number; context: string }[] {
    const results: { position: number; context: string }[] = [];
    const text = this.text.toLowerCase();
    const searchTerm = query.toLowerCase();
    let position = 0;

    while ((position = text.indexOf(searchTerm, position)) !== -1) {
      const start = Math.max(0, position - 50);
      const end = Math.min(text.length, position + searchTerm.length + 50);
      const context = this.text.substring(start, end);
      
      results.push({ position, context: context.trim() });
      position += searchTerm.length;
    }

    return results;
  }

  export(format: 'txt' | 'json' | 'html'): string {
    switch (format) {
      case 'txt':
        return this.text;
      case 'json':
        return JSON.stringify({
          title: this.title,
          text: this.text,
          metadata: this.metadata,
          images: this.images,
          tables: this.tables,
          links: this.links
        }, null, 2);
      case 'html':
        return `
          <html>
            <head><title>${this.title}</title></head>
            <body>
              <h1>${this.title}</h1>
              <pre>${this.text}</pre>
              ${this.links.length > 0 ? '<h2>Links</h2><ul>' + this.links.map(link => `<li><a href="${link.url}">${link.text}</a></li>`).join('') + '</ul>' : ''}
            </body>
          </html>
        `;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}

// Concrete Product implementations
class PDFParser implements DocumentParser {
  canParse(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  getSupportedFormats(): string[] {
    return ['application/pdf'];
  }

  async validateFile(filePath: string): Promise<boolean> {
    console.log(`Validating PDF file: ${filePath}`);
    // Simulate file validation
    await this.simulateDelay(50);
    return filePath.endsWith('.pdf');
  }

  async parse(filePath: string, config?: ParserConfig): Promise<ParsedDocument> {
    console.log(`Parsing PDF document: ${filePath}`);
    await this.simulateDelay(200);

    const metadata: DocumentMetadata = {
      title: 'Sample PDF Document',
      author: 'PDF Author',
      createdDate: new Date('2023-01-01'),
      modifiedDate: new Date(),
      pageCount: 25,
      wordCount: 5000,
      fileSize: 2048000,
      format: 'PDF',
      encoding: 'UTF-8'
    };

    const text = `This is extracted text from a PDF document.
    
PDF documents can contain rich formatting, images, and complex layouts.
The parser extracts the text content while preserving structure where possible.

Key features of PDF parsing:
- Text extraction from multiple pages
- Image extraction and cataloging
- Table structure recognition
- Metadata extraction
- Link extraction

This sample document demonstrates how the PDF parser processes content
and makes it available through a consistent interface.`;

    const images = config?.extractImages ? [
      'image1.png (embedded)',
      'chart1.jpg (embedded)',
      'logo.svg (embedded)'
    ] : [];

    const tables = config?.extractTables ? [
      [['Feature', 'Status'], ['Text Extraction', 'Complete'], ['Image Extraction', 'In Progress']],
      [['Page', 'Word Count'], ['1', '250'], ['2', '320'], ['3', '180']]
    ] : [];

    const links = config?.extractLinks ? [
      { text: 'Reference Documentation', url: 'https://example.com/docs' },
      { text: 'Support Portal', url: 'https://support.example.com' }
    ] : [];

    return new BaseDocument(metadata.title!, text, metadata, images, tables, links);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class ExcelParser implements DocumentParser {
  canParse(mimeType: string): boolean {
    return mimeType.includes('excel') || mimeType.includes('spreadsheet');
  }

  getSupportedFormats(): string[] {
    return [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
  }

  async validateFile(filePath: string): Promise<boolean> {
    console.log(`Validating Excel file: ${filePath}`);
    await this.simulateDelay(30);
    return filePath.endsWith('.xls') || filePath.endsWith('.xlsx');
  }

  async parse(filePath: string, config?: ParserConfig): Promise<ParsedDocument> {
    console.log(`Parsing Excel document: ${filePath}`);
    await this.simulateDelay(150);

    const metadata: DocumentMetadata = {
      title: 'Financial Report Q1 2024',
      author: 'Finance Team',
      createdDate: new Date('2024-01-15'),
      modifiedDate: new Date(),
      pageCount: 5, // sheets
      fileSize: 1024000,
      format: 'Excel',
      sheets: ['Summary', 'Revenue', 'Expenses', 'Projections', 'Notes']
    };

    const text = `Excel Spreadsheet Content Summary:
    
Sheet 1: Summary
- Total Revenue: $1,250,000
- Total Expenses: $950,000
- Net Profit: $300,000
- Growth Rate: 15.2%

Sheet 2: Revenue Breakdown
- Product Sales: $800,000
- Service Revenue: $350,000
- Other Income: $100,000

Sheet 3: Expense Categories
- Personnel: $450,000
- Operations: $300,000
- Marketing: $120,000
- Other: $80,000

This data has been extracted from multiple worksheets and combined
into a readable text format while preserving the tabular structure
in the tables section.`;

    const tables = [
      [
        ['Quarter', 'Revenue', 'Expenses', 'Profit'],
        ['Q1 2024', '$1,250,000', '$950,000', '$300,000'],
        ['Q4 2023', '$1,100,000', '$900,000', '$200,000'],
        ['Q3 2023', '$980,000', '$850,000', '$130,000']
      ],
      [
        ['Department', 'Budget', 'Actual', 'Variance'],
        ['Sales', '$100,000', '$95,000', '-$5,000'],
        ['Marketing', '$80,000', '$85,000', '$5,000'],
        ['Operations', '$200,000', '$190,000', '-$10,000']
      ]
    ];

    return new BaseDocument(metadata.title!, text, metadata, [], tables, []);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class WordParser implements DocumentParser {
  canParse(mimeType: string): boolean {
    return mimeType.includes('word') || mimeType.includes('wordprocessing');
  }

  getSupportedFormats(): string[] {
    return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }

  async validateFile(filePath: string): Promise<boolean> {
    console.log(`Validating Word document: ${filePath}`);
    await this.simulateDelay(40);
    return filePath.endsWith('.doc') || filePath.endsWith('.docx');
  }

  async parse(filePath: string, config?: ParserConfig): Promise<ParsedDocument> {
    console.log(`Parsing Word document: ${filePath}`);
    await this.simulateDelay(120);

    const metadata: DocumentMetadata = {
      title: 'Project Proposal: AI-Powered Analytics Platform',
      author: 'Product Team',
      createdDate: new Date('2024-02-01'),
      modifiedDate: new Date(),
      pageCount: 12,
      wordCount: 3500,
      fileSize: 856000,
      format: 'Word',
      encoding: 'UTF-8'
    };

    const text = `PROJECT PROPOSAL: AI-POWERED ANALYTICS PLATFORM

EXECUTIVE SUMMARY
This document outlines the proposal for developing an AI-powered analytics platform
that will revolutionize how our organization processes and interprets data.

OBJECTIVES
1. Reduce data processing time by 75%
2. Improve accuracy of insights by 40%
3. Enable real-time decision making
4. Provide intuitive user interface for non-technical users

TECHNICAL REQUIREMENTS
- Cloud-native architecture
- Machine learning capabilities
- Real-time data streaming
- Advanced visualization tools
- Multi-tenant support

IMPLEMENTATION TIMELINE
Phase 1: Architecture Design (2 months)
Phase 2: Core Development (6 months)
Phase 3: Testing & Optimization (2 months)
Phase 4: Deployment & Training (1 month)

BUDGET ESTIMATION
Total project cost: $2,500,000
- Development: $1,800,000
- Infrastructure: $400,000
- Training & Support: $300,000

CONCLUSION
The proposed AI-powered analytics platform represents a significant opportunity
to enhance our data capabilities and maintain competitive advantage in the market.`;

    const links = [
      { text: 'Technical Specifications', url: 'https://docs.company.com/tech-specs' },
      { text: 'Market Research Report', url: 'https://research.company.com/market-analysis' }
    ];

    return new BaseDocument(metadata.title!, text, metadata, [], [], links);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class JSONParser implements DocumentParser {
  canParse(mimeType: string): boolean {
    return mimeType === 'application/json';
  }

  getSupportedFormats(): string[] {
    return ['application/json'];
  }

  async validateFile(filePath: string): Promise<boolean> {
    console.log(`Validating JSON file: ${filePath}`);
    await this.simulateDelay(20);
    return filePath.endsWith('.json');
  }

  async parse(filePath: string, config?: ParserConfig): Promise<ParsedDocument> {
    console.log(`Parsing JSON document: ${filePath}`);
    await this.simulateDelay(50);

    const metadata: DocumentMetadata = {
      title: 'API Configuration Data',
      createdDate: new Date(),
      fileSize: 45000,
      format: 'JSON',
      encoding: 'UTF-8'
    };

    // Simulate parsing a complex JSON configuration file
    const mockData = {
      api: {
        version: '2.1',
        endpoints: [
          { path: '/users', methods: ['GET', 'POST'] },
          { path: '/orders', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
        ]
      },
      database: {
        host: 'localhost',
        port: 5432,
        name: 'production_db'
      },
      features: {
        caching: true,
        logging: true,
        metrics: true
      }
    };

    const text = `JSON Configuration Summary:

API Configuration:
- Version: 2.1
- Endpoints: 2 configured
  * /users (GET, POST)
  * /orders (GET, POST, PUT, DELETE)

Database Settings:
- Host: localhost
- Port: 5432  
- Database: production_db

Feature Flags:
- Caching: Enabled
- Logging: Enabled
- Metrics: Enabled

Raw JSON structure contains nested objects with configuration
parameters for various system components.`;

    return new BaseDocument(metadata.title!, text, metadata);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class XMLParser implements DocumentParser {
  canParse(mimeType: string): boolean {
    return mimeType.includes('xml');
  }

  getSupportedFormats(): string[] {
    return ['application/xml', 'text/xml'];
  }

  async validateFile(filePath: string): Promise<boolean> {
    console.log(`Validating XML file: ${filePath}`);
    await this.simulateDelay(25);
    return filePath.endsWith('.xml');
  }

  async parse(filePath: string, config?: ParserConfig): Promise<ParsedDocument> {
    console.log(`Parsing XML document: ${filePath}`);
    await this.simulateDelay(80);

    const metadata: DocumentMetadata = {
      title: 'Product Catalog XML',
      createdDate: new Date('2024-01-01'),
      modifiedDate: new Date(),
      fileSize: 128000,
      format: 'XML',
      encoding: 'UTF-8',
      schema: 'product-catalog-v1.0'
    };

    const text = `XML Product Catalog Content:

Product Catalog (Version 1.0)
- Total Products: 150
- Categories: Electronics, Clothing, Books, Home & Garden

Featured Products:
1. Wireless Headphones
   - SKU: WH-1000XM4
   - Price: $299.99
   - Stock: 25 units

2. Smart Watch
   - SKU: SW-SERIES-7
   - Price: $399.99
   - Stock: 15 units

3. Laptop Computer
   - SKU: LAP-PRO-16
   - Price: $1999.99
   - Stock: 8 units

The XML structure contains detailed product information including
specifications, pricing, inventory levels, and category mappings.`;

    const tables = [
      [
        ['Category', 'Product Count', 'Avg Price'],
        ['Electronics', '45', '$299.99'],
        ['Clothing', '60', '$49.99'],
        ['Books', '30', '$19.99'],
        ['Home & Garden', '15', '$89.99']
      ]
    ];

    return new BaseDocument(metadata.title!, text, metadata, [], tables);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class TextParser implements DocumentParser {
  canParse(mimeType: string): boolean {
    return mimeType === 'text/plain';
  }

  getSupportedFormats(): string[] {
    return ['text/plain'];
  }

  async validateFile(filePath: string): Promise<boolean> {
    console.log(`Validating text file: ${filePath}`);
    await this.simulateDelay(10);
    return filePath.endsWith('.txt');
  }

  async parse(filePath: string, config?: ParserConfig): Promise<ParsedDocument> {
    console.log(`Parsing text document: ${filePath}`);
    await this.simulateDelay(30);

    const metadata: DocumentMetadata = {
      title: 'Plain Text Document',
      createdDate: new Date(),
      fileSize: 12000,
      format: 'Text',
      encoding: 'UTF-8'
    };

    const text = `This is a plain text document that contains unformatted content.

Plain text files are the simplest document format, containing only
readable characters without any formatting information.

Key characteristics:
- No formatting (bold, italic, colors)
- Universal compatibility
- Small file size
- Easy to process and search
- Human readable

This parser demonstrates how even simple text files can be processed
through the same document parsing interface as more complex formats.

The content can still be searched, exported to different formats,
and have metadata extracted for cataloging purposes.`;

    return new BaseDocument(metadata.title!, text, metadata);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Concrete Creator implementations
class PDFParserFactory extends DocumentParserFactory {
  createParser(): DocumentParser {
    return new PDFParser();
  }
}

class ExcelParserFactory extends DocumentParserFactory {
  createParser(): DocumentParser {
    return new ExcelParser();
  }
}

class WordParserFactory extends DocumentParserFactory {
  createParser(): DocumentParser {
    return new WordParser();
  }
}

class JSONParserFactory extends DocumentParserFactory {
  createParser(): DocumentParser {
    return new JSONParser();
  }
}

class XMLParserFactory extends DocumentParserFactory {
  createParser(): DocumentParser {
    return new XMLParser();
  }
}

class TextParserFactory extends DocumentParserFactory {
  createParser(): DocumentParser {
    return new TextParser();
  }
}

// Document Processing Service - shows real-world usage
class DocumentProcessingService {
  private readonly supportedTypes = new Set([
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/json',
    'application/xml',
    'text/xml',
    'text/plain'
  ]);

  async processDocument(filePath: string, config?: ParserConfig): Promise<ParsedDocument> {
    const mimeType = DocumentParserFactory.detectMimeType(filePath);
    
    if (!this.supportedTypes.has(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    const factory = DocumentParserFactory.createParser(mimeType);
    return await factory.parse(filePath, config);
  }

  async batchProcess(filePaths: string[], config?: ParserConfig): Promise<ParsedDocument[]> {
    const results: ParsedDocument[] = [];
    
    for (const filePath of filePaths) {
      try {
        const document = await this.processDocument(filePath, config);
        results.push(document);
        console.log(`✅ Successfully processed: ${filePath}`);
      } catch (error) {
        console.error(`❌ Failed to process ${filePath}:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    return results;
  }

  getSupportedTypes(): string[] {
    return Array.from(this.supportedTypes);
  }

  async searchAcrossDocuments(documents: ParsedDocument[], query: string): Promise<any[]> {
    const results = [];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const matches = doc.search(query);
      
      if (matches.length > 0) {
        results.push({
          document: doc.getTitle(),
          matches: matches.length,
          contexts: matches.map(m => m.context)
        });
      }
    }
    
    return results;
  }
}

// Usage Example - Following the documented API exactly
async function demonstrateDocumentParser(): Promise<void> {
  console.log('=== DOCUMENT PARSER FACTORY DEMO ===');
  console.log('Following the documented API pattern:\n');

  // Test different document types with the exact documented API
  const testDocuments = [
    { file: './invoice.pdf', mimeType: 'application/pdf' },
    { file: './report.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { file: './proposal.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { file: './config.json', mimeType: 'application/json' },
    { file: './catalog.xml', mimeType: 'application/xml' },
    { file: './readme.txt', mimeType: 'text/plain' }
  ];

  const documents: ParsedDocument[] = [];
  
  for (const { file, mimeType } of testDocuments) {
    console.log(`--- Parsing ${file} ---`);
    
    try {
      // Following the exact documented API
      const parserFactory = DocumentParserFactory.createParser(mimeType);
      const document = await parserFactory.parse(file);

      console.log('Title:', document.getTitle());
      console.log('Text:', document.getText().substring(0, 100) + '...');
      console.log('Metadata:', JSON.stringify(document.getMetadata(), null, 2));
      
      // Show extracted content
      const tables = document.getTables();
      const images = document.getImages();
      const links = document.getLinks();
      
      if (tables.length > 0) {
        console.log(`Tables extracted: ${tables.length}`);
      }
      if (images.length > 0) {
        console.log(`Images found: ${images.length}`);
      }
      if (links.length > 0) {
        console.log(`Links found: ${links.length}`);
      }

      documents.push(document);
      
    } catch (error) {
      console.error(`Failed to parse ${file}:`, error instanceof Error ? error.message : String(error));
    }
    
    console.log();
  }

  // Advanced usage example
  console.log('--- Advanced Document Processing ---');
  if (documents.length > 0) {
    const pdfDocument = documents[0]; // First document should be PDF
    
    // Search within document
    const searchResults = pdfDocument.search('PDF');
    console.log(`Search results for "PDF": ${searchResults.length} matches`);
    
    // Export to different formats
    const htmlExport = pdfDocument.export('html');
    console.log('HTML export length:', htmlExport.length);
    
    const jsonExport = pdfDocument.export('json');
    console.log('JSON export contains metadata:', jsonExport.includes('metadata'));
  }

  console.log(`✅ Successfully processed ${documents.length} documents`);
}

// Testing Example
async function testDocumentParser(): Promise<void> {
  console.log('=== DOCUMENT PARSER FACTORY TESTS ===');
  
  // Test 1: MIME type detection
  console.log('Test 1 - MIME type detection:');
  const testExtensions = ['report.pdf', 'data.xlsx', 'doc.docx', 'config.json', 'data.xml', 'readme.txt'];
  testExtensions.forEach(file => {
    const mimeType = DocumentParserFactory.detectMimeType(file);
    console.log(`${file} -> ${mimeType}`);
  });
  
  // Test 2: Factory creation for different types
  console.log('\nTest 2 - Factory creation:');
  const mimeTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/msword',
    'application/json',
    'application/xml',
    'text/plain'
  ];
  
  for (const mimeType of mimeTypes) {
    try {
      const factory = DocumentParserFactory.createParser(mimeType);
      const parser = factory.createParser();
      console.log(`✅ ${mimeType}: Parser created, supports ${parser.getSupportedFormats().length} formats`);
    } catch (error) {
      console.log(`❌ ${mimeType}: Failed to create parser`);
    }
  }
  
  // Test 3: Document parsing interface
  console.log('\nTest 3 - Document parsing interface:');
  const factory = DocumentParserFactory.createParser('application/pdf');
  const document = await factory.parse('test.pdf');
  
  console.log('Document interface test:');
  console.log('- Title:', document.getTitle());
  console.log('- Text length:', document.getText().length);
  console.log('- Metadata keys:', Object.keys(document.getMetadata()).length);
  console.log('- Search functionality:', document.search('PDF').length > 0 ? 'Working' : 'Not working');
  console.log('- Export functionality:', document.export('json').length > 0 ? 'Working' : 'Not working');
  
  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateDocumentParser();
  await testDocumentParser();
  exit(0);
})();

export {
  DocumentParserFactory,
  DocumentParser,
  ParsedDocument,
  ParserConfig,
  DocumentProcessingService
}; 