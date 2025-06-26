import { exit } from 'process';
import { setTimeout } from 'timers/promises';

// Lightweight mock fetch for demo purposes
async function fetch(url:string,options?:{method?:string;body?:string}): Promise<{ ok: boolean; status: number; json: () => Promise<any>; }> {
  // Simulate network latency
  await setTimeout(200);
  if(url.endsWith('/users')){
    return { ok: true, status:200, json: async()=>[{id:1,name:'User1'}] };
  }
  return { ok:false, status:404, json: async()=>({}) };
}

// Simplified Http Layer
async function http(method:'GET'|'POST',url:string,body?:unknown){
  const res=await fetch(url);
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Facade
class ApiClientFacade {
  constructor(private baseUrl:string){}
  getUsers(){ return http('GET',`${this.baseUrl}/users`); }
  createOrder(order:{item:string;qty:number}){ return http('POST',`${this.baseUrl}/orders`,order); }
}

// Demo (mock URLs)
(async()=>{
  const api=new ApiClientFacade('https://api.example.com');
  const users=await api.getUsers();
  console.log('👥 Users length:',users.length);
  try{ await api.createOrder({item:'Book',qty:2}); }catch(e){ console.log('Expected 404 for demo:',(e as Error).message);} 
  exit(0);
})();