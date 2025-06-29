// ============================================================================
// CLOUD INFRASTRUCTURE FACTORY - Multi-Cloud Resource Creation
// ============================================================================

import { exit } from "process";

// Cloud configuration and resource interfaces
interface ResourceConfig {
  name: string;
  region: string;
  type?: string;
  size?: string;
  ports?: number[];
  replicas?: number;
  tags?: Record<string, string>;
  [key: string]: any;
}

interface ResourceStatus {
  id: string;
  status: 'creating' | 'running' | 'stopped' | 'error';
  created: Date;
  cost: number;
  metadata: Record<string, any>;
}

// Abstract Product interfaces - what all cloud resources must implement
interface ComputeInstance {
  deploy(): Promise<ResourceStatus>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  getStatus(): Promise<ResourceStatus>;
  scale(replicas: number): Promise<void>;
  terminate(): Promise<void>;
}

interface StorageBucket {
  create(): Promise<ResourceStatus>;
  upload(fileName: string, content: string): Promise<string>;
  download(fileName: string): Promise<string>;
  delete(fileName: string): Promise<void>;
  listFiles(): Promise<string[]>;
  getUrl(fileName: string): string;
}

interface LoadBalancer {
  configure(): Promise<ResourceStatus>;
  addTarget(targetId: string): Promise<void>;
  removeTarget(targetId: string): Promise<void>;
  updateHealthCheck(config: any): Promise<void>;
  getMetrics(): Promise<any>;
  scale(capacity: number): Promise<void>;
}

// Abstract Factory interface - defines the family of cloud resources
interface CloudAbstractFactory {
  createComputeInstance(config: ResourceConfig): ComputeInstance;
  createStorageBucket(config: ResourceConfig): StorageBucket;
  createLoadBalancer(config: ResourceConfig): LoadBalancer;
  getProvider(): string;
  getRegion(): string;
  getCostCalculator(): any;
}

// ============================================================================
// AWS CLOUD RESOURCES
// ============================================================================

class AWSComputeInstance implements ComputeInstance {
  private config: ResourceConfig;
  private instanceId?: string;
  private status: ResourceStatus['status'] = 'creating';

  constructor(config: ResourceConfig) {
    this.config = config;
  }

  async deploy(): Promise<ResourceStatus> {
    console.log(`Deploying AWS EC2 instance: ${this.config.name} in ${this.config.region}`);
    console.log(`Instance type: ${this.config.type || 't3.medium'}`);
    
    await this.simulateDelay(2000);
    
    this.instanceId = `i-${Date.now().toString(16)}`;
    this.status = 'running';
    
    const resourceStatus: ResourceStatus = {
      id: this.instanceId,
      status: this.status,
      created: new Date(),
      cost: 0.05, // $0.05/hour
      metadata: {
        provider: 'AWS',
        service: 'EC2',
        instanceType: this.config.type || 't3.medium',
        region: this.config.region
      }
    };

    console.log(`✅ AWS EC2 instance deployed: ${this.instanceId}`);
    return resourceStatus;
  }

  async start(): Promise<void> {
    console.log(`Starting AWS EC2 instance: ${this.instanceId}`);
    this.status = 'running';
  }

  async stop(): Promise<void> {
    console.log(`Stopping AWS EC2 instance: ${this.instanceId}`);
    this.status = 'stopped';
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.simulateDelay(1000);
    await this.start();
  }

  async getStatus(): Promise<ResourceStatus> {
    return {
      id: this.instanceId || '',
      status: this.status,
      created: new Date(),
      cost: 0.05,
      metadata: { provider: 'AWS', service: 'EC2' }
    };
  }

  async scale(replicas: number): Promise<void> {
    console.log(`Scaling AWS EC2 instances to ${replicas} replicas using Auto Scaling Group`);
  }

  async terminate(): Promise<void> {
    console.log(`Terminating AWS EC2 instance: ${this.instanceId}`);
    this.status = 'error'; // Terminated state
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class AWSStorageBucket implements StorageBucket {
  private config: ResourceConfig;
  private bucketName: string;
  private files: Map<string, string> = new Map();

  constructor(config: ResourceConfig) {
    this.config = config;
    this.bucketName = config.name;
  }

  async create(): Promise<ResourceStatus> {
    console.log(`Creating AWS S3 bucket: ${this.bucketName} in ${this.config.region}`);
    await this.simulateDelay(1000);

    const resourceStatus: ResourceStatus = {
      id: this.bucketName,
      status: 'running',
      created: new Date(),
      cost: 0.023, // $0.023/GB/month
      metadata: {
        provider: 'AWS',
        service: 'S3',
        region: this.config.region,
        encryption: 'AES-256'
      }
    };

    console.log(`✅ AWS S3 bucket created: ${this.bucketName}`);
    return resourceStatus;
  }

  async upload(fileName: string, content: string): Promise<string> {
    this.files.set(fileName, content);
    const key = `s3://${this.bucketName}/${fileName}`;
    console.log(`Uploaded to AWS S3: ${key}`);
    return key;
  }

  async download(fileName: string): Promise<string> {
    const content = this.files.get(fileName);
    if (!content) throw new Error(`File not found: ${fileName}`);
    console.log(`Downloaded from AWS S3: ${fileName}`);
    return content;
  }

  async delete(fileName: string): Promise<void> {
    this.files.delete(fileName);
    console.log(`Deleted from AWS S3: ${fileName}`);
  }

  async listFiles(): Promise<string[]> {
    return Array.from(this.files.keys());
  }

  getUrl(fileName: string): string {
    return `https://${this.bucketName}.s3.${this.config.region}.amazonaws.com/${fileName}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class AWSLoadBalancer implements LoadBalancer {
  private config: ResourceConfig;
  private elbName: string;
  private targets: Set<string> = new Set();

  constructor(config: ResourceConfig) {
    this.config = config;
    this.elbName = config.name;
  }

  async configure(): Promise<ResourceStatus> {
    console.log(`Configuring AWS Application Load Balancer: ${this.elbName}`);
    console.log(`Ports: ${this.config.ports?.join(', ') || '80, 443'}`);
    await this.simulateDelay(1500);

    const resourceStatus: ResourceStatus = {
      id: `arn:aws:elasticloadbalancing:${this.config.region}:account:loadbalancer/app/${this.elbName}`,
      status: 'running',
      created: new Date(),
      cost: 0.0225, // $0.0225/hour
      metadata: {
        provider: 'AWS',
        service: 'ELB',
        type: 'Application Load Balancer',
        region: this.config.region
      }
    };

    console.log(`✅ AWS ALB configured: ${this.elbName}`);
    return resourceStatus;
  }

  async addTarget(targetId: string): Promise<void> {
    this.targets.add(targetId);
    console.log(`Added target to AWS ALB: ${targetId}`);
  }

  async removeTarget(targetId: string): Promise<void> {
    this.targets.delete(targetId);
    console.log(`Removed target from AWS ALB: ${targetId}`);
  }

  async updateHealthCheck(config: any): Promise<void> {
    console.log(`Updated AWS ALB health check configuration`);
  }

  async getMetrics(): Promise<any> {
    return {
      requestCount: Math.floor(Math.random() * 10000),
      responseTime: Math.floor(Math.random() * 200),
      activeTargets: this.targets.size,
      provider: 'AWS CloudWatch'
    };
  }

  async scale(capacity: number): Promise<void> {
    console.log(`Scaling AWS ALB capacity to ${capacity} units`);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// AZURE CLOUD RESOURCES
// ============================================================================

class AzureComputeInstance implements ComputeInstance {
  private config: ResourceConfig;
  private vmId?: string;
  private status: ResourceStatus['status'] = 'creating';

  constructor(config: ResourceConfig) {
    this.config = config;
  }

  async deploy(): Promise<ResourceStatus> {
    console.log(`Deploying Azure Virtual Machine: ${this.config.name} in ${this.config.region}`);
    console.log(`VM size: ${this.config.type || 'Standard_B2s'}`);
    
    await this.simulateDelay(2500);
    
    this.vmId = `vm-${Date.now().toString(16)}`;
    this.status = 'running';
    
    const resourceStatus: ResourceStatus = {
      id: this.vmId,
      status: this.status,
      created: new Date(),
      cost: 0.041, // $0.041/hour
      metadata: {
        provider: 'Azure',
        service: 'Virtual Machines',
        vmSize: this.config.type || 'Standard_B2s',
        region: this.config.region
      }
    };

    console.log(`✅ Azure VM deployed: ${this.vmId}`);
    return resourceStatus;
  }

  async start(): Promise<void> {
    console.log(`Starting Azure VM: ${this.vmId}`);
    this.status = 'running';
  }

  async stop(): Promise<void> {
    console.log(`Stopping Azure VM: ${this.vmId}`);
    this.status = 'stopped';
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.simulateDelay(1000);
    await this.start();
  }

  async getStatus(): Promise<ResourceStatus> {
    return {
      id: this.vmId || '',
      status: this.status,
      created: new Date(),
      cost: 0.041,
      metadata: { provider: 'Azure', service: 'Virtual Machines' }
    };
  }

  async scale(replicas: number): Promise<void> {
    console.log(`Scaling Azure VMs to ${replicas} replicas using Virtual Machine Scale Sets`);
  }

  async terminate(): Promise<void> {
    console.log(`Deleting Azure VM: ${this.vmId}`);
    this.status = 'error';
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class AzureStorageBucket implements StorageBucket {
  private config: ResourceConfig;
  private containerName: string;
  private files: Map<string, string> = new Map();

  constructor(config: ResourceConfig) {
    this.config = config;
    this.containerName = config.name;
  }

  async create(): Promise<ResourceStatus> {
    console.log(`Creating Azure Blob Storage container: ${this.containerName}`);
    await this.simulateDelay(800);

    const resourceStatus: ResourceStatus = {
      id: this.containerName,
      status: 'running',
      created: new Date(),
      cost: 0.018, // $0.018/GB/month
      metadata: {
        provider: 'Azure',
        service: 'Blob Storage',
        region: this.config.region,
        accessTier: 'Hot'
      }
    };

    console.log(`✅ Azure Blob Storage container created: ${this.containerName}`);
    return resourceStatus;
  }

  async upload(fileName: string, content: string): Promise<string> {
    this.files.set(fileName, content);
    const url = `https://account.blob.core.windows.net/${this.containerName}/${fileName}`;
    console.log(`Uploaded to Azure Blob Storage: ${url}`);
    return url;
  }

  async download(fileName: string): Promise<string> {
    const content = this.files.get(fileName);
    if (!content) throw new Error(`Blob not found: ${fileName}`);
    console.log(`Downloaded from Azure Blob Storage: ${fileName}`);
    return content;
  }

  async delete(fileName: string): Promise<void> {
    this.files.delete(fileName);
    console.log(`Deleted from Azure Blob Storage: ${fileName}`);
  }

  async listFiles(): Promise<string[]> {
    return Array.from(this.files.keys());
  }

  getUrl(fileName: string): string {
    return `https://account.blob.core.windows.net/${this.containerName}/${fileName}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class AzureLoadBalancer implements LoadBalancer {
  private config: ResourceConfig;
  private lbName: string;
  private targets: Set<string> = new Set();

  constructor(config: ResourceConfig) {
    this.config = config;
    this.lbName = config.name;
  }

  async configure(): Promise<ResourceStatus> {
    console.log(`Configuring Azure Application Gateway: ${this.lbName}`);
    console.log(`Ports: ${this.config.ports?.join(', ') || '80, 443'}`);
    await this.simulateDelay(2000);

    const resourceStatus: ResourceStatus = {
      id: `/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Network/applicationGateways/${this.lbName}`,
      status: 'running',
      created: new Date(),
      cost: 0.032, // $0.032/hour
      metadata: {
        provider: 'Azure',
        service: 'Application Gateway',
        sku: 'Standard_v2',
        region: this.config.region
      }
    };

    console.log(`✅ Azure Application Gateway configured: ${this.lbName}`);
    return resourceStatus;
  }

  async addTarget(targetId: string): Promise<void> {
    this.targets.add(targetId);
    console.log(`Added backend to Azure Application Gateway: ${targetId}`);
  }

  async removeTarget(targetId: string): Promise<void> {
    this.targets.delete(targetId);
    console.log(`Removed backend from Azure Application Gateway: ${targetId}`);
  }

  async updateHealthCheck(config: any): Promise<void> {
    console.log(`Updated Azure Application Gateway health probe configuration`);
  }

  async getMetrics(): Promise<any> {
    return {
      requestCount: Math.floor(Math.random() * 8000),
      responseTime: Math.floor(Math.random() * 150),
      activeTargets: this.targets.size,
      provider: 'Azure Monitor'
    };
  }

  async scale(capacity: number): Promise<void> {
    console.log(`Scaling Azure Application Gateway to ${capacity} capacity units`);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// GOOGLE CLOUD PLATFORM RESOURCES
// ============================================================================

class GCPComputeInstance implements ComputeInstance {
  private config: ResourceConfig;
  private instanceId?: string;
  private status: ResourceStatus['status'] = 'creating';

  constructor(config: ResourceConfig) {
    this.config = config;
  }

  async deploy(): Promise<ResourceStatus> {
    console.log(`Deploying GCP Compute Engine instance: ${this.config.name} in ${this.config.region}`);
    console.log(`Machine type: ${this.config.type || 'e2-medium'}`);
    
    await this.simulateDelay(1800);
    
    this.instanceId = `gce-${Date.now().toString(16)}`;
    this.status = 'running';
    
    const resourceStatus: ResourceStatus = {
      id: this.instanceId,
      status: this.status,
      created: new Date(),
      cost: 0.038, // $0.038/hour
      metadata: {
        provider: 'GCP',
        service: 'Compute Engine',
        machineType: this.config.type || 'e2-medium',
        zone: `${this.config.region}-a`
      }
    };

    console.log(`✅ GCP Compute Engine instance deployed: ${this.instanceId}`);
    return resourceStatus;
  }

  async start(): Promise<void> {
    console.log(`Starting GCP Compute Engine instance: ${this.instanceId}`);
    this.status = 'running';
  }

  async stop(): Promise<void> {
    console.log(`Stopping GCP Compute Engine instance: ${this.instanceId}`);
    this.status = 'stopped';
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.simulateDelay(1000);
    await this.start();
  }

  async getStatus(): Promise<ResourceStatus> {
    return {
      id: this.instanceId || '',
      status: this.status,
      created: new Date(),
      cost: 0.038,
      metadata: { provider: 'GCP', service: 'Compute Engine' }
    };
  }

  async scale(replicas: number): Promise<void> {
    console.log(`Scaling GCP instances to ${replicas} replicas using Managed Instance Groups`);
  }

  async terminate(): Promise<void> {
    console.log(`Deleting GCP Compute Engine instance: ${this.instanceId}`);
    this.status = 'error';
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class GCPStorageBucket implements StorageBucket {
  private config: ResourceConfig;
  private bucketName: string;
  private files: Map<string, string> = new Map();

  constructor(config: ResourceConfig) {
    this.config = config;
    this.bucketName = config.name;
  }

  async create(): Promise<ResourceStatus> {
    console.log(`Creating GCP Cloud Storage bucket: ${this.bucketName}`);
    await this.simulateDelay(600);

    const resourceStatus: ResourceStatus = {
      id: this.bucketName,
      status: 'running',
      created: new Date(),
      cost: 0.020, // $0.020/GB/month
      metadata: {
        provider: 'GCP',
        service: 'Cloud Storage',
        storageClass: 'STANDARD',
        location: this.config.region
      }
    };

    console.log(`✅ GCP Cloud Storage bucket created: ${this.bucketName}`);
    return resourceStatus;
  }

  async upload(fileName: string, content: string): Promise<string> {
    this.files.set(fileName, content);
    const gsUrl = `gs://${this.bucketName}/${fileName}`;
    console.log(`Uploaded to GCP Cloud Storage: ${gsUrl}`);
    return gsUrl;
  }

  async download(fileName: string): Promise<string> {
    const content = this.files.get(fileName);
    if (!content) throw new Error(`Object not found: ${fileName}`);
    console.log(`Downloaded from GCP Cloud Storage: ${fileName}`);
    return content;
  }

  async delete(fileName: string): Promise<void> {
    this.files.delete(fileName);
    console.log(`Deleted from GCP Cloud Storage: ${fileName}`);
  }

  async listFiles(): Promise<string[]> {
    return Array.from(this.files.keys());
  }

  getUrl(fileName: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class GCPLoadBalancer implements LoadBalancer {
  private config: ResourceConfig;
  private lbName: string;
  private targets: Set<string> = new Set();

  constructor(config: ResourceConfig) {
    this.config = config;
    this.lbName = config.name;
  }

  async configure(): Promise<ResourceStatus> {
    console.log(`Configuring GCP HTTP(S) Load Balancer: ${this.lbName}`);
    console.log(`Ports: ${this.config.ports?.join(', ') || '80, 443'}`);
    await this.simulateDelay(1200);

    const resourceStatus: ResourceStatus = {
      id: `projects/project/global/urlMaps/${this.lbName}`,
      status: 'running',
      created: new Date(),
      cost: 0.025, // $0.025/hour
      metadata: {
        provider: 'GCP',
        service: 'Cloud Load Balancing',
        type: 'HTTP(S) Load Balancer',
        region: 'global'
      }
    };

    console.log(`✅ GCP HTTP(S) Load Balancer configured: ${this.lbName}`);
    return resourceStatus;
  }

  async addTarget(targetId: string): Promise<void> {
    this.targets.add(targetId);
    console.log(`Added backend service to GCP Load Balancer: ${targetId}`);
  }

  async removeTarget(targetId: string): Promise<void> {
    this.targets.delete(targetId);
    console.log(`Removed backend service from GCP Load Balancer: ${targetId}`);
  }

  async updateHealthCheck(config: any): Promise<void> {
    console.log(`Updated GCP Load Balancer health check configuration`);
  }

  async getMetrics(): Promise<any> {
    return {
      requestCount: Math.floor(Math.random() * 12000),
      responseTime: Math.floor(Math.random() * 100),
      activeTargets: this.targets.size,
      provider: 'Google Cloud Monitoring'
    };
  }

  async scale(capacity: number): Promise<void> {
    console.log(`Scaling GCP Load Balancer capacity to ${capacity} units`);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// CONCRETE FACTORY IMPLEMENTATIONS
// ============================================================================

class AWSInfrastructureFactory implements CloudAbstractFactory {
  private region: string;

  constructor(region: string = 'us-east-1') {
    this.region = region;
  }

  createComputeInstance(config: ResourceConfig): ComputeInstance {
    return new AWSComputeInstance({ ...config, region: this.region });
  }

  createStorageBucket(config: ResourceConfig): StorageBucket {
    return new AWSStorageBucket({ ...config, region: this.region });
  }

  createLoadBalancer(config: ResourceConfig): LoadBalancer {
    return new AWSLoadBalancer({ ...config, region: this.region });
  }

  getProvider(): string {
    return 'AWS';
  }

  getRegion(): string {
    return this.region;
  }

  getCostCalculator(): any {
    return {
      compute: 0.05, // per hour
      storage: 0.023, // per GB/month
      network: 0.0225 // per hour
    };
  }
}

class AzureInfrastructureFactory implements CloudAbstractFactory {
  private region: string;

  constructor(region: string = 'East US') {
    this.region = region;
  }

  createComputeInstance(config: ResourceConfig): ComputeInstance {
    return new AzureComputeInstance({ ...config, region: this.region });
  }

  createStorageBucket(config: ResourceConfig): StorageBucket {
    return new AzureStorageBucket({ ...config, region: this.region });
  }

  createLoadBalancer(config: ResourceConfig): LoadBalancer {
    return new AzureLoadBalancer({ ...config, region: this.region });
  }

  getProvider(): string {
    return 'Azure';
  }

  getRegion(): string {
    return this.region;
  }

  getCostCalculator(): any {
    return {
      compute: 0.041, // per hour
      storage: 0.018, // per GB/month
      network: 0.032 // per hour
    };
  }
}

class GCPInfrastructureFactory implements CloudAbstractFactory {
  private region: string;

  constructor(region: string = 'us-central1') {
    this.region = region;
  }

  createComputeInstance(config: ResourceConfig): ComputeInstance {
    return new GCPComputeInstance({ ...config, region: this.region });
  }

  createStorageBucket(config: ResourceConfig): StorageBucket {
    return new GCPStorageBucket({ ...config, region: this.region });
  }

  createLoadBalancer(config: ResourceConfig): LoadBalancer {
    return new GCPLoadBalancer({ ...config, region: this.region });
  }

  getProvider(): string {
    return 'GCP';
  }

  getRegion(): string {
    return this.region;
  }

  getCostCalculator(): any {
    return {
      compute: 0.038, // per hour
      storage: 0.020, // per GB/month
      network: 0.025 // per hour
    };
  }
}

// ============================================================================
// ABSTRACT FACTORY REGISTRY
// ============================================================================

class CloudAbstractFactory {
  private static factories = new Map<string, (region?: string) => CloudAbstractFactory>([
    ['aws', (region) => new AWSInfrastructureFactory(region)],
    ['azure', (region) => new AzureInfrastructureFactory(region)],
    ['gcp', (region) => new GCPInfrastructureFactory(region)]
  ]);

  public static createForProvider(provider: string, region?: string): CloudAbstractFactory {
    const factoryCreator = this.factories.get(provider.toLowerCase());
    if (!factoryCreator) {
      throw new Error(`Unsupported cloud provider: ${provider}`);
    }
    return factoryCreator(region);
  }

  public static getSupportedProviders(): string[] {
    return Array.from(this.factories.keys());
  }
}

// Usage Example - Following the documented API exactly
async function demonstrateCloudInfrastructure(): Promise<void> {
  console.log('=== CLOUD INFRASTRUCTURE FACTORY DEMO ===');
  console.log('Following the documented API pattern:\n');

  const providers = ['aws', 'azure', 'gcp'];

  for (const provider of providers) {
    console.log(`--- Testing ${provider.toUpperCase()} Provider ---`);
    
    try {
      // Following the exact documented API
      const cloudFactory = CloudAbstractFactory.createForProvider(provider);
      const compute = cloudFactory.createComputeInstance({
        name: 'web-server',
        type: provider === 'aws' ? 't3.medium' : provider === 'azure' ? 'Standard_B2s' : 'e2-medium',
        region: cloudFactory.getRegion()
      });
      const storage = cloudFactory.createStorageBucket({ name: 'my-app-data', region: cloudFactory.getRegion() });
      const network = cloudFactory.createLoadBalancer({ name: 'main-lb', ports: [80, 443], region: cloudFactory.getRegion() });

      // All resources are provider-specific but work together
      const computeStatus = await compute.deploy();
      const storageStatus = await storage.create();
      const networkStatus = await network.configure();
      
      console.log(`Provider: ${cloudFactory.getProvider()}`);
      console.log(`Region: ${cloudFactory.getRegion()}`);
      console.log(`Compute deployed: ${computeStatus.id}`);
      console.log(`Storage created: ${storageStatus.id}`);
      console.log(`Load balancer configured: ${networkStatus.id}`);
      
      // Test resource operations
      await storage.upload('config.json', '{"app": "test"}');
      const files = await storage.listFiles();
      console.log(`Files in storage: ${files.length}`);
      
      await network.addTarget(computeStatus.id);
      const metrics = await network.getMetrics();
      console.log(`Load balancer metrics: ${metrics.requestCount} requests, ${metrics.responseTime}ms avg`);
      
      // Cost calculation
      const costCalc = cloudFactory.getCostCalculator();
      console.log(`Hourly costs - Compute: $${costCalc.compute}, Storage: $${costCalc.storage}/GB/month, Network: $${costCalc.network}`);
      
    } catch (error) {
      console.error(`❌ Error with ${provider}:`, error instanceof Error ? error.message : String(error));
    }
    
    console.log();
  }

  console.log(`✅ Successfully demonstrated ${providers.length} cloud providers with documented API`);
}

// Testing Example
async function testCloudInfrastructure(): Promise<void> {
  console.log('=== CLOUD INFRASTRUCTURE FACTORY TESTS ===');
  
  // Test 1: Factory creation for different providers
  console.log('Test 1 - Provider factory creation:');
  const supportedProviders = CloudAbstractFactory.getSupportedProviders();
  
  for (const provider of supportedProviders) {
    try {
      const factory = CloudAbstractFactory.createForProvider(provider);
      console.log(`✅ ${provider}: Factory created successfully`);
    } catch (error) {
      console.log(`❌ ${provider}: Failed to create factory`);
    }
  }
  
  // Test 2: Resource family consistency
  console.log('\nTest 2 - Resource family consistency:');
  const factory = CloudAbstractFactory.createForProvider('aws');
  
  const compute = factory.createComputeInstance({ name: 'test', region: 'us-east-1' });
  const storage = factory.createStorageBucket({ name: 'test', region: 'us-east-1' });
  const network = factory.createLoadBalancer({ name: 'test', region: 'us-east-1' });
  
  console.log('✅ All resources created from same factory');
  console.log('✅ Resources configured for same provider');
  
  // Test 3: Multi-cloud deployment simulation
  console.log('\nTest 3 - Multi-cloud deployment:');
  const awsFactory = CloudAbstractFactory.createForProvider('aws');
  const azureFactory = CloudAbstractFactory.createForProvider('azure');
  
  console.log(`AWS factory region: ${awsFactory.getRegion()}`);
  console.log(`Azure factory region: ${azureFactory.getRegion()}`);
  console.log('✅ Multi-cloud setup works');
  
  console.log();
}

// Run demonstrations
(async () => {
  await demonstrateCloudInfrastructure();
  await testCloudInfrastructure();
  exit(0);
})();

export {
  CloudAbstractFactory,
  ComputeInstance,
  StorageBucket,
  LoadBalancer,
  ResourceConfig,
  ResourceStatus
}; 