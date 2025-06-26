import { exit } from 'process';

interface Logger{ log(level:string,msg:string):void; }
class ConsoleLogger implements Logger{ log(level:string,msg:string){console.log(`${level.toUpperCase()}: ${msg}`);} }
abstract class LoggerDecorator implements Logger{ constructor(protected next:Logger){} abstract log(level:string,msg:string):void; }
class TimestampDecorator extends LoggerDecorator{ log(l:string,m:string){const ts=new Date().toISOString(); this.next.log(l,`[${ts}] ${m}`);} }
class LevelFilterDecorator extends LoggerDecorator{ constructor(next:Logger,private min:string){super(next);} private order(level:string){return['debug','info','warn','error'].indexOf(level);} log(l:string,m:string){ if(this.order(l)>=this.order(this.min)) this.next.log(l,m);} }

const logger=new TimestampDecorator(new LevelFilterDecorator(new ConsoleLogger(),'info'));
console.log('=== LOGGER DECORATOR DEMO ===');
logger.log('debug','This is debug');
logger.log('info','User logged in');
logger.log('error','Unhandled exception');
exit(0); 