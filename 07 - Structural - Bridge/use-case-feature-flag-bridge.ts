// ============================================================================
// FEATURE FLAG BRIDGE - Client vs Server Evaluation Strategies
// ============================================================================
import { exit } from 'process';

// 1. Implementation hierarchy
interface EvaluationStrategy {
  isEnabled(flagKey: string, userId?: string): Promise<boolean>;
  name(): string;
}

class ClientSideStrategy implements EvaluationStrategy {
  private cache: Record<string, boolean>={ darkMode:true, beta:false };
  async isEnabled(flagKey:string){return this.cache[flagKey]??false;}
  name(){return 'client';}
}

class ServerSideStrategy implements EvaluationStrategy {
  async isEnabled(flagKey:string,userId?:string){console.log(`🌐 Query /flags/${flagKey}?user=${userId}`);return Math.random()<0.5;}
  name(){return 'server';}
}

// 2. Abstraction hierarchy
class FeatureFlag {
  constructor(private strategy: EvaluationStrategy, private key:string){}
  async enabled(userId?:string){return this.strategy.isEnabled(this.key,userId);} 
}

// 3. Demo
async function demo(){
  console.log('=== FEATURE FLAG BRIDGE DEMO ===');
  const strategies=[new ClientSideStrategy(), new ServerSideStrategy()];
  for(const strat of strategies){
    console.log(`\n--- Using ${strat.name()}-side evaluation ---`);
    const flag=new FeatureFlag(strat,'darkMode');
    console.log('darkMode:',await flag.enabled('user123'));
  }
}

(async()=>{await demo(); exit(0);})();

export {EvaluationStrategy, ClientSideStrategy, ServerSideStrategy, FeatureFlag}; 