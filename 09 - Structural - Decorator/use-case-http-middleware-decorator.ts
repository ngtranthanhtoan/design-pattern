import { exit } from 'process';

type Request={url:string, headers:Record<string,string>};

interface Handler{ handle(req:Request): Promise<void>; }

class BaseHandler implements Handler {
  async handle(req:Request){console.log(`🎯 Handling ${req.url}`);} }

abstract class HandlerDecorator implements Handler {
  constructor(protected next: Handler){}
  abstract handle(req:Request): Promise<void>;
}

class LoggingDecorator extends HandlerDecorator {
  async handle(req:Request){console.log('📑 Logging',req.url); await this.next.handle(req);} }

class AuthDecorator extends HandlerDecorator {
  async handle(req:Request){if(!req.headers['auth']){console.log('⛔ Unauthorized');return;} await this.next.handle(req);} }

// build chain
const handler=new AuthDecorator(new LoggingDecorator(new BaseHandler()));

(async()=>{console.log('=== HTTP MIDDLEWARE DECORATOR DEMO ==='); await handler.handle({url:'/api/data',headers:{auth:'token'}}); await handler.handle({url:'/api/data',headers:{}}); exit(0);})(); 