// ============================================================================
// STORAGE PROVIDER BRIDGE - Upload & Download files across cloud providers
// ============================================================================

import { exit } from 'process';

// -----------------------------------------------------------------------------
// 1. Implementation hierarchy – Cloud providers
// -----------------------------------------------------------------------------

interface StorageProvider {
  upload(path: string, content: string): Promise<void>;
  download(path: string): Promise<string>;
  name(): string;
}

class S3Provider implements StorageProvider {
  async upload(path:string,content:string){console.log(`☁️ [S3] putObject ${path}`);} 
  async download(path:string){console.log(`☁️ [S3] getObject ${path}`); return 'data';}
  name():string{return 's3';}
}
class AzureBlobProvider implements StorageProvider {
  async upload(path:string,content:string){console.log(`☁️ [Azure] uploadBlob ${path}`);} 
  async download(path:string){console.log(`☁️ [Azure] downloadBlob ${path}`); return 'data';}
  name():string{return 'azure';}
}
class GcpProvider implements StorageProvider {
  async upload(path:string,content:string){console.log(`☁️ [GCP] upload ${path}`);} 
  async download(path:string){console.log(`☁️ [GCP] download ${path}`); return 'data';}
  name():string{return 'gcp';}
}

// -----------------------------------------------------------------------------
// 2. Abstraction hierarchy – File API
// -----------------------------------------------------------------------------

abstract class CloudFile {
  protected provider: StorageProvider;
  protected path: string;
  constructor(provider: StorageProvider, path: string){this.provider = provider; this.path = path;}
  abstract save(content: string): Promise<void>;
  abstract read(): Promise<string>;
}

class TxtFile extends CloudFile {
  async save(content:string){await this.provider.upload(this.path,content);} 
  async read(){return this.provider.download(this.path);} 
}

class JsonFile extends CloudFile {
  async save(content: string){await this.provider.upload(this.path,JSON.stringify({data:content}));}
  async read(){const raw = await this.provider.download(this.path); try{return JSON.parse(raw).data;}catch{return raw;}}
}

// -----------------------------------------------------------------------------
// 3. Demo
// -----------------------------------------------------------------------------

async function demo(){
  console.log('=== STORAGE PROVIDER BRIDGE DEMO ===');
  const providers:StorageProvider[]=[new S3Provider(), new AzureBlobProvider(), new GcpProvider()];

  for(const p of providers){
    console.log(`\n--- Provider ${p.name().toUpperCase()} ---`);
    const txt = new TxtFile(p,'/docs/readme.txt');
    await txt.save('hello world');
    await txt.read();

    const json = new JsonFile(p,'/data/config.json');
    await json.save('42');
    await json.read();
  }
}

(async()=>{await demo(); exit(0);})();

export {StorageProvider,S3Provider,AzureBlobProvider,GcpProvider,CloudFile,TxtFile,JsonFile}; 