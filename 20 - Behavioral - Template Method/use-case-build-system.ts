/**
 * Template Method Pattern - Build System Use Case
 * 
 * Demonstrates how to use Template Method to create a standardized build pipeline
 * where different projects can customize specific build steps while maintaining
 * the same overall build process.
 */

import { exit } from "process";

// =============================================================================
// INTERFACES AND TYPES
// =============================================================================

interface BuildResult {
  success: boolean;
  message: string;
  artifacts?: string[];
  errors?: string[];
}

interface BuildContext {
  projectName: string;
  sourcePath: string;
  outputPath: string;
  environment: 'development' | 'production' | 'testing';
}

// =============================================================================
// ABSTRACT CLASS - BUILD SYSTEM TEMPLATE
// =============================================================================

abstract class BuildSystem {
  protected context: BuildContext;

  constructor(context: BuildContext) {
    this.context = context;
  }

  /**
   * Template Method: Defines the overall build process
   * This method cannot be overridden by subclasses
   */
  public build(): BuildResult {
    console.log(`🚀 Starting build for ${this.context.projectName}`);
    
    try {
      // Step 1: Setup and validation
      this.setup();
      
      // Step 2: Compile the project
      const compileResult = this.compile();
      if (!compileResult.success) {
        return compileResult;
      }
      
      // Step 3: Run tests (optional based on hook)
      if (this.shouldRunTests()) {
        const testResult = this.test();
        if (!testResult.success) {
          return testResult;
        }
      }
      
      // Step 4: Package the application
      const packageResult = this.package();
      if (!packageResult.success) {
        return packageResult;
      }
      
      // Step 5: Deploy (optional based on hook)
      if (this.shouldDeploy()) {
        const deployResult = this.deploy();
        if (!deployResult.success) {
          return deployResult;
        }
      }
      
      // Step 6: Cleanup
      this.cleanup();
      
      return {
        success: true,
        message: `✅ Build completed successfully for ${this.context.projectName}`,
        artifacts: this.getArtifacts()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // =============================================================================
  // PRIMITIVE OPERATIONS - Must be implemented by subclasses
  // =============================================================================

  /**
   * Compile the project - must be implemented by each project type
   */
  protected abstract compile(): BuildResult;

  /**
   * Package the application - must be implemented by each project type
   */
  protected abstract package(): BuildResult;

  /**
   * Deploy the application - must be implemented by each project type
   */
  protected abstract deploy(): BuildResult;

  // =============================================================================
  // HOOK METHODS - Optional methods that subclasses can override
  // =============================================================================

  /**
   * Hook method: Should tests be run during the build?
   * Default implementation returns true
   */
  protected shouldRunTests(): boolean {
    return true;
  }

  /**
   * Hook method: Should the application be deployed after packaging?
   * Default implementation returns false
   */
  protected shouldDeploy(): boolean {
    return this.context.environment === 'production';
  }

  /**
   * Hook method: Should run before compilation
   * Default implementation does nothing
   */
  protected beforeCompile(): void {
    // Optional hook - subclasses can override
  }

  /**
   * Hook method: Should run after packaging
   * Default implementation does nothing
   */
  protected afterPackage(): void {
    // Optional hook - subclasses can override
  }

  // =============================================================================
  // CONCRETE OPERATIONS - Common implementations shared by all subclasses
  // =============================================================================

  /**
   * Setup the build environment
   */
  protected setup(): void {
    console.log(`📁 Setting up build environment for ${this.context.projectName}`);
    console.log(`   Source: ${this.context.sourcePath}`);
    console.log(`   Output: ${this.context.outputPath}`);
    console.log(`   Environment: ${this.context.environment}`);
  }

  /**
   * Run tests on the compiled code
   */
  protected test(): BuildResult {
    console.log(`🧪 Running tests for ${this.context.projectName}`);
    
    // Simulate test execution
    const testSuccess = Math.random() > 0.1; // 90% success rate
    
    if (testSuccess) {
      console.log(`   ✅ All tests passed`);
      return { success: true, message: "Tests passed successfully" };
    } else {
      console.log(`   ❌ Some tests failed`);
      return { 
        success: false, 
        message: "Tests failed", 
        errors: ["Test failure detected"] 
      };
    }
  }

  /**
   * Cleanup temporary files and resources
   */
  protected cleanup(): void {
    console.log(`🧹 Cleaning up build artifacts for ${this.context.projectName}`);
  }

  /**
   * Get build artifacts
   */
  protected getArtifacts(): string[] {
    return [`${this.context.projectName}.jar`, `${this.context.projectName}.war`];
  }
}

// =============================================================================
// CONCRETE IMPLEMENTATIONS
// =============================================================================

/**
 * Java Project Build System
 */
class JavaProjectBuild extends BuildSystem {
  protected override compile(): BuildResult {
    this.beforeCompile(); // Hook method call
    
    console.log(`☕ Compiling Java project: ${this.context.projectName}`);
    
    // Simulate Java compilation
    const compileSuccess = Math.random() > 0.05; // 95% success rate
    
    if (compileSuccess) {
      console.log(`   ✅ Java compilation successful`);
      return { success: true, message: "Java compilation completed" };
    } else {
      console.log(`   ❌ Java compilation failed`);
      return { 
        success: false, 
        message: "Java compilation failed", 
        errors: ["Compilation error detected"] 
      };
    }
  }

  protected override package(): BuildResult {
    console.log(`📦 Packaging Java project: ${this.context.projectName}`);
    
    // Simulate JAR/WAR packaging
    const packageSuccess = Math.random() > 0.1; // 90% success rate
    
    if (packageSuccess) {
      console.log(`   ✅ Java packaging successful`);
      this.afterPackage(); // Hook method call
      return { success: true, message: "Java packaging completed" };
    } else {
      console.log(`   ❌ Java packaging failed`);
      return { 
        success: false, 
        message: "Java packaging failed", 
        errors: ["Packaging error detected"] 
      };
    }
  }

  protected override deploy(): BuildResult {
    console.log(`🚀 Deploying Java application: ${this.context.projectName}`);
    
    // Simulate deployment to application server
    const deploySuccess = Math.random() > 0.15; // 85% success rate
    
    if (deploySuccess) {
      console.log(`   ✅ Java deployment successful`);
      return { success: true, message: "Java deployment completed" };
    } else {
      console.log(`   ❌ Java deployment failed`);
      return { 
        success: false, 
        message: "Java deployment failed", 
        errors: ["Deployment error detected"] 
      };
    }
  }

  // Override hook method for Java projects
  protected override shouldRunTests(): boolean {
    return this.context.environment !== 'development'; // Skip tests in dev
  }

  protected override beforeCompile(): void {
    console.log(`   🔍 Running Java code analysis`);
  }

  protected override afterPackage(): void {
    console.log(`   📋 Generating Java documentation`);
  }
}

/**
 * Node.js Project Build System
 */
class NodeProjectBuild extends BuildSystem {
  protected override compile(): BuildResult {
    this.beforeCompile(); // Hook method call
    
    console.log(`🟢 Compiling Node.js project: ${this.context.projectName}`);
    
    // Simulate TypeScript compilation or bundling
    const compileSuccess = Math.random() > 0.08; // 92% success rate
    
    if (compileSuccess) {
      console.log(`   ✅ Node.js compilation successful`);
      return { success: true, message: "Node.js compilation completed" };
    } else {
      console.log(`   ❌ Node.js compilation failed`);
      return { 
        success: false, 
        message: "Node.js compilation failed", 
        errors: ["Compilation error detected"] 
      };
    }
  }

  protected override package(): BuildResult {
    console.log(`📦 Packaging Node.js project: ${this.context.projectName}`);
    
    // Simulate npm packaging or Docker build
    const packageSuccess = Math.random() > 0.12; // 88% success rate
    
    if (packageSuccess) {
      console.log(`   ✅ Node.js packaging successful`);
      this.afterPackage(); // Hook method call
      return { success: true, message: "Node.js packaging completed" };
    } else {
      console.log(`   ❌ Node.js packaging failed`);
      return { 
        success: false, 
        message: "Node.js packaging failed", 
        errors: ["Packaging error detected"] 
      };
    }
  }

  protected override deploy(): BuildResult {
    console.log(`🚀 Deploying Node.js application: ${this.context.projectName}`);
    
    // Simulate deployment to cloud platform
    const deploySuccess = Math.random() > 0.18; // 82% success rate
    
    if (deploySuccess) {
      console.log(`   ✅ Node.js deployment successful`);
      return { success: true, message: "Node.js deployment completed" };
    } else {
      console.log(`   ❌ Node.js deployment failed`);
      return { 
        success: false, 
        message: "Node.js deployment failed", 
        errors: ["Deployment error detected"] 
      };
    }
  }

  // Override hook method for Node.js projects
  protected override shouldRunTests(): boolean {
    return true; // Always run tests for Node.js projects
  }

  protected override shouldDeploy(): boolean {
    return this.context.environment === 'production' || this.context.environment === 'testing';
  }

  protected override beforeCompile(): void {
    console.log(`   📦 Installing Node.js dependencies`);
  }

  protected override afterPackage(): void {
    console.log(`   🐳 Building Docker image`);
  }
}

/**
 * Python Project Build System
 */
class PythonProjectBuild extends BuildSystem {
  protected override compile(): BuildResult {
    this.beforeCompile(); // Hook method call
    
    console.log(`🐍 Compiling Python project: ${this.context.projectName}`);
    
    // Simulate Python bytecode compilation or type checking
    const compileSuccess = Math.random() > 0.06; // 94% success rate
    
    if (compileSuccess) {
      console.log(`   ✅ Python compilation successful`);
      return { success: true, message: "Python compilation completed" };
    } else {
      console.log(`   ❌ Python compilation failed`);
      return { 
        success: false, 
        message: "Python compilation failed", 
        errors: ["Compilation error detected"] 
      };
    }
  }

  protected override package(): BuildResult {
    console.log(`📦 Packaging Python project: ${this.context.projectName}`);
    
    // Simulate wheel or egg packaging
    const packageSuccess = Math.random() > 0.14; // 86% success rate
    
    if (packageSuccess) {
      console.log(`   ✅ Python packaging successful`);
      this.afterPackage(); // Hook method call
      return { success: true, message: "Python packaging completed" };
    } else {
      console.log(`   ❌ Python packaging failed`);
      return { 
        success: false, 
        message: "Python packaging failed", 
        errors: ["Packaging error detected"] 
      };
    }
  }

  protected override deploy(): BuildResult {
    console.log(`🚀 Deploying Python application: ${this.context.projectName}`);
    
    // Simulate deployment to Python hosting platform
    const deploySuccess = Math.random() > 0.16; // 84% success rate
    
    if (deploySuccess) {
      console.log(`   ✅ Python deployment successful`);
      return { success: true, message: "Python deployment completed" };
    } else {
      console.log(`   ❌ Python deployment failed`);
      return { 
        success: false, 
        message: "Python deployment failed", 
        errors: ["Deployment error detected"] 
      };
    }
  }

  // Override hook methods for Python projects
  protected override shouldRunTests(): boolean {
    return this.context.environment !== 'development';
  }

  protected override beforeCompile(): void {
    console.log(`   🔧 Setting up Python virtual environment`);
  }

  protected override afterPackage(): void {
    console.log(`   📚 Generating Python documentation with Sphinx`);
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

function demonstrateBuildSystem(): void {
  console.log("🏗️  Build System Template Method Pattern Demo");
  console.log("=============================================");
  console.log();

  // Create different project contexts
  const javaContext: BuildContext = {
    projectName: "user-service",
    sourcePath: "/src/main/java",
    outputPath: "/target",
    environment: 'production'
  };

  const nodeContext: BuildContext = {
    projectName: "api-gateway",
    sourcePath: "/src",
    outputPath: "/dist",
    environment: 'testing'
  };

  const pythonContext: BuildContext = {
    projectName: "data-processor",
    sourcePath: "/app",
    outputPath: "/build",
    environment: 'development'
  };

  // Create build systems
  const javaBuild = new JavaProjectBuild(javaContext);
  const nodeBuild = new NodeProjectBuild(nodeContext);
  const pythonBuild = new PythonProjectBuild(pythonContext);

  // Execute builds
  console.log("1. Building Java Project (Production):");
  const javaResult = javaBuild.build();
  console.log(`   Result: ${javaResult.message}`);
  console.log();

  console.log("2. Building Node.js Project (Testing):");
  const nodeResult = nodeBuild.build();
  console.log(`   Result: ${nodeResult.message}`);
  console.log();

  console.log("3. Building Python Project (Development):");
  const pythonResult = pythonBuild.build();
  console.log(`   Result: ${pythonResult.message}`);
  console.log();
}

function testBuildSystem(): void {
  console.log("🧪 Testing Build System Edge Cases");
  console.log("==================================");
  console.log();

  // Test with different environments
  const testContexts: BuildContext[] = [
    {
      projectName: "test-java",
      sourcePath: "/test/src",
      outputPath: "/test/target",
      environment: 'development'
    },
    {
      projectName: "test-node",
      sourcePath: "/test/src",
      outputPath: "/test/dist",
      environment: 'production'
    }
  ];

  testContexts.forEach((context, index) => {
    console.log(`Test ${index + 1}: ${context.projectName} (${context.environment})`);
    
    const buildSystem = context.projectName.includes('java') 
      ? new JavaProjectBuild(context)
      : new NodeProjectBuild(context);
    
    const result = buildSystem.build();
    console.log(`   Success: ${result.success}`);
    console.log(`   Message: ${result.message}`);
    if (result.errors) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
    console.log();
  });
}

// =============================================================================
// DEMONSTRATION
// =============================================================================

function main(): void {
  try {
    demonstrateBuildSystem();
    testBuildSystem();
    
    console.log("✅ Template Method Pattern - Build System demonstration completed");
  } catch (error) {
    console.error("❌ Error during demonstration:", error);
  }
}

// Run the demonstration
main();

exit(0); 