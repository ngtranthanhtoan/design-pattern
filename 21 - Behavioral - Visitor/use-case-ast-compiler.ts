/**
 * Visitor Pattern - AST Compiler Use Case
 * 
 * This example demonstrates how the Visitor pattern can be used in compiler design
 * to separate different operations (syntax analysis, optimization, code generation,
 * type checking) from AST node classes.
 */

import { exit } from "process";

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface ASTVisitor {
  visitExpression(expression: Expression): void;
  visitStatement(statement: Statement): void;
  visitDeclaration(declaration: Declaration): void;
}

interface ASTNode {
  accept(visitor: ASTVisitor): void;
  getLine(): number;
  getColumn(): number;
}

// ============================================================================
// CONCRETE AST NODE CLASSES
// ============================================================================

abstract class Expression implements ASTNode {
  constructor(
    protected line: number,
    protected column: number
  ) {}

  getLine(): number {
    return this.line;
  }

  getColumn(): number {
    return this.column;
  }

  abstract accept(visitor: ASTVisitor): void;
}

class BinaryExpression extends Expression {
  constructor(
    line: number,
    column: number,
    private operator: string,
    private left: Expression,
    private right: Expression
  ) {
    super(line, column);
  }

  getOperator(): string {
    return this.operator;
  }

  getLeft(): Expression {
    return this.left;
  }

  getRight(): Expression {
    return this.right;
  }

  accept(visitor: ASTVisitor): void {
    visitor.visitExpression(this);
  }
}

class LiteralExpression extends Expression {
  constructor(
    line: number,
    column: number,
    private value: string | number | boolean,
    private type: 'string' | 'number' | 'boolean'
  ) {
    super(line, column);
  }

  getValue(): string | number | boolean {
    return this.value;
  }

  getType(): 'string' | 'number' | 'boolean' {
    return this.type;
  }

  accept(visitor: ASTVisitor): void {
    visitor.visitExpression(this);
  }
}

class VariableExpression extends Expression {
  constructor(
    line: number,
    column: number,
    private name: string
  ) {
    super(line, column);
  }

  getName(): string {
    return this.name;
  }

  accept(visitor: ASTVisitor): void {
    visitor.visitExpression(this);
  }
}

abstract class Statement implements ASTNode {
  constructor(
    protected line: number,
    protected column: number
  ) {}

  getLine(): number {
    return this.line;
  }

  getColumn(): number {
    return this.column;
  }

  abstract accept(visitor: ASTVisitor): void;
}

class AssignmentStatement extends Statement {
  constructor(
    line: number,
    column: number,
    private variable: string,
    private expression: Expression
  ) {
    super(line, column);
  }

  getVariable(): string {
    return this.variable;
  }

  getExpression(): Expression {
    return this.expression;
  }

  accept(visitor: ASTVisitor): void {
    visitor.visitStatement(this);
  }
}

class IfStatement extends Statement {
  constructor(
    line: number,
    column: number,
    private condition: Expression,
    private thenBlock: Statement[],
    private elseBlock: Statement[] = []
  ) {
    super(line, column);
  }

  getCondition(): Expression {
    return this.condition;
  }

  getThenBlock(): Statement[] {
    return this.thenBlock;
  }

  getElseBlock(): Statement[] {
    return this.elseBlock;
  }

  accept(visitor: ASTVisitor): void {
    visitor.visitStatement(this);
  }
}

abstract class Declaration implements ASTNode {
  constructor(
    protected line: number,
    protected column: number
  ) {}

  getLine(): number {
    return this.line;
  }

  getColumn(): number {
    return this.column;
  }

  abstract accept(visitor: ASTVisitor): void;
}

class VariableDeclaration extends Declaration {
  constructor(
    line: number,
    column: number,
    private name: string,
    private type: string,
    private initializer: Expression | null = null
  ) {
    super(line, column);
  }

  getName(): string {
    return this.name;
  }

  getType(): string {
    return this.type;
  }

  getInitializer(): Expression | null {
    return this.initializer;
  }

  accept(visitor: ASTVisitor): void {
    visitor.visitDeclaration(this);
  }
}

// ============================================================================
// CONCRETE VISITOR CLASSES
// ============================================================================

class SyntaxAnalyzer implements ASTVisitor {
  private errors: string[] = [];

  visitExpression(expression: Expression): void {
    if (expression instanceof BinaryExpression) {
      this.analyzeBinaryExpression(expression);
    } else if (expression instanceof LiteralExpression) {
      this.analyzeLiteralExpression(expression);
    } else if (expression instanceof VariableExpression) {
      this.analyzeVariableExpression(expression);
    }
  }

  visitStatement(statement: Statement): void {
    if (statement instanceof AssignmentStatement) {
      this.analyzeAssignmentStatement(statement);
    } else if (statement instanceof IfStatement) {
      this.analyzeIfStatement(statement);
    }
  }

  visitDeclaration(declaration: Declaration): void {
    if (declaration instanceof VariableDeclaration) {
      this.analyzeVariableDeclaration(declaration);
    }
  }

  private analyzeBinaryExpression(expr: BinaryExpression): void {
    const validOperators = ['+', '-', '*', '/', '==', '!=', '<', '>', '<=', '>='];
    if (!validOperators.includes(expr.getOperator())) {
      this.errors.push(`Invalid operator '${expr.getOperator()}' at line ${expr.getLine()}`);
    }
    expr.getLeft().accept(this);
    expr.getRight().accept(this);
  }

  private analyzeLiteralExpression(expr: LiteralExpression): void {
    console.log(`Literal: ${expr.getValue()} (${expr.getType()}) at line ${expr.getLine()}`);
  }

  private analyzeVariableExpression(expr: VariableExpression): void {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr.getName())) {
      this.errors.push(`Invalid variable name '${expr.getName()}' at line ${expr.getLine()}`);
    }
  }

  private analyzeAssignmentStatement(stmt: AssignmentStatement): void {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(stmt.getVariable())) {
      this.errors.push(`Invalid variable name '${stmt.getVariable()}' at line ${stmt.getLine()}`);
    }
    stmt.getExpression().accept(this);
  }

  private analyzeIfStatement(stmt: IfStatement): void {
    stmt.getCondition().accept(this);
    stmt.getThenBlock().forEach(statement => statement.accept(this));
    stmt.getElseBlock().forEach(statement => statement.accept(this));
  }

  private analyzeVariableDeclaration(decl: VariableDeclaration): void {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(decl.getName())) {
      this.errors.push(`Invalid variable name '${decl.getName()}' at line ${decl.getLine()}`);
    }
    if (decl.getInitializer()) {
      decl.getInitializer()!.accept(this);
    }
  }

  getErrors(): string[] {
    return this.errors;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }
}

class CodeGenerator implements ASTVisitor {
  private output: string[] = [];
  private indentLevel: number = 0;

  visitExpression(expression: Expression): void {
    if (expression instanceof BinaryExpression) {
      this.generateBinaryExpression(expression);
    } else if (expression instanceof LiteralExpression) {
      this.generateLiteralExpression(expression);
    } else if (expression instanceof VariableExpression) {
      this.generateVariableExpression(expression);
    }
  }

  visitStatement(statement: Statement): void {
    if (statement instanceof AssignmentStatement) {
      this.generateAssignmentStatement(statement);
    } else if (statement instanceof IfStatement) {
      this.generateIfStatement(statement);
    }
  }

  visitDeclaration(declaration: Declaration): void {
    if (declaration instanceof VariableDeclaration) {
      this.generateVariableDeclaration(declaration);
    }
  }

  private generateBinaryExpression(expr: BinaryExpression): void {
    this.output.push('(');
    expr.getLeft().accept(this);
    this.output.push(` ${expr.getOperator()} `);
    expr.getRight().accept(this);
    this.output.push(')');
  }

  private generateLiteralExpression(expr: LiteralExpression): void {
    if (expr.getType() === 'string') {
      this.output.push(`"${expr.getValue()}"`);
    } else {
      this.output.push(expr.getValue().toString());
    }
  }

  private generateVariableExpression(expr: VariableExpression): void {
    this.output.push(expr.getName());
  }

  private generateAssignmentStatement(stmt: AssignmentStatement): void {
    this.addIndent();
    this.output.push(`${stmt.getVariable()} = `);
    stmt.getExpression().accept(this);
    this.output.push(';\n');
  }

  private generateIfStatement(stmt: IfStatement): void {
    this.addIndent();
    this.output.push('if (');
    stmt.getCondition().accept(this);
    this.output.push(') {\n');
    
    this.indentLevel++;
    stmt.getThenBlock().forEach(statement => statement.accept(this));
    this.indentLevel--;

    if (stmt.getElseBlock().length > 0) {
      this.addIndent();
      this.output.push('} else {\n');
      this.indentLevel++;
      stmt.getElseBlock().forEach(statement => statement.accept(this));
      this.indentLevel--;
    }

    this.addIndent();
    this.output.push('}\n');
  }

  private generateVariableDeclaration(decl: VariableDeclaration): void {
    this.addIndent();
    this.output.push(`${decl.getType()} ${decl.getName()}`);
    if (decl.getInitializer()) {
      this.output.push(' = ');
      decl.getInitializer()!.accept(this);
    }
    this.output.push(';\n');
  }

  private addIndent(): void {
    this.output.push('  '.repeat(this.indentLevel));
  }

  getOutput(): string {
    return this.output.join('');
  }

  reset(): void {
    this.output = [];
    this.indentLevel = 0;
  }
}

// ============================================================================
// AST STRUCTURE
// ============================================================================

class AST {
  private nodes: ASTNode[] = [];

  addNode(node: ASTNode): void {
    this.nodes.push(node);
  }

  accept(visitor: ASTVisitor): void {
    this.nodes.forEach(node => node.accept(visitor));
  }

  getNodeCount(): number {
    return this.nodes.length;
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

function demonstrateASTCompiler(): void {
  console.log("🔧 AST Compiler with Visitor Pattern");
  console.log("====================================\n");

  // Create a simple AST for: int x = 5; if (x > 3) { x = x + 1; }
  const ast = new AST();

  // Variable declaration: int x = 5;
  const literal5 = new LiteralExpression(1, 8, 5, 'number');
  const varDecl = new VariableDeclaration(1, 1, 'x', 'int', literal5);

  // Variable expression: x
  const varX = new VariableExpression(2, 5, 'x');
  
  // Literal: 3
  const literal3 = new LiteralExpression(2, 9, 3, 'number');
  
  // Binary expression: x > 3
  const condition = new BinaryExpression(2, 7, '>', varX, literal3);
  
  // Binary expression: x + 1
  const literal1 = new LiteralExpression(2, 15, 1, 'number');
  const addition = new BinaryExpression(2, 13, '+', varX, literal1);
  
  // Assignment: x = x + 1
  const assignment = new AssignmentStatement(2, 11, 'x', addition);
  
  // If statement
  const ifStatement = new IfStatement(2, 1, condition, [assignment]);

  // Add nodes to AST
  ast.addNode(varDecl);
  ast.addNode(ifStatement);

  console.log(`AST created with ${ast.getNodeCount()} top-level nodes\n`);

  // Test 1: Syntax Analysis
  console.log("1️⃣ Syntax Analysis:");
  console.log("-------------------");
  const syntaxAnalyzer = new SyntaxAnalyzer();
  ast.accept(syntaxAnalyzer);
  
  if (syntaxAnalyzer.isValid()) {
    console.log("✅ AST is syntactically valid!");
  } else {
    console.log("❌ Syntax errors found:");
    syntaxAnalyzer.getErrors().forEach(error => console.log(`  - ${error}`));
  }
  console.log();

  // Test 2: Code Generation
  console.log("2️⃣ Code Generation:");
  console.log("-------------------");
  const codeGenerator = new CodeGenerator();
  ast.accept(codeGenerator);
  console.log("Generated code:");
  console.log(codeGenerator.getOutput());
}

if (require.main === module) {
  try {
    demonstrateASTCompiler();
    console.log("✅ All AST compiler operations completed successfully!");
  } catch (error) {
    console.error("❌ Error during AST compilation:", error);
    exit(1);
  }
}

export {
  ASTVisitor,
  ASTNode,
  Expression,
  BinaryExpression,
  LiteralExpression,
  VariableExpression,
  Statement,
  AssignmentStatement,
  IfStatement,
  Declaration,
  VariableDeclaration,
  SyntaxAnalyzer,
  CodeGenerator,
  AST
}; 