import { exit } from 'process';

// Mock subsystem services
class ComputeService { provision(instanceType:string){console.log(`💻 Compute instance ${instanceType} provisioned`);} }
class StorageService { createBucket(name:string){console.log(`📦 Storage bucket ${name} created`);} }
class NetworkService { setupLoadBalancer(name:string){console.log(`🌐 Load balancer ${name} configured`);} }

interface WebAppConfig { name:string; instanceType:string; bucket:string; lb:string; }

// Facade
class CloudDeploymentFacade {
  private compute=new ComputeService();
  private storage=new StorageService();
  private network=new NetworkService();
  deployWebApp(cfg:WebAppConfig){
    console.log('\n🚀 Deploying web app');
    this.compute.provision(cfg.instanceType);
    this.storage.createBucket(cfg.bucket);
    this.network.setupLoadBalancer(cfg.lb);
    console.log(`✅ ${cfg.name} deployed`);
  }
}

// Demo
const cloud=new CloudDeploymentFacade();
cloud.deployWebApp({name:'MyApp',instanceType:'t3.micro',bucket:'myapp-assets',lb:'myapp-lb'});
exit(0); 