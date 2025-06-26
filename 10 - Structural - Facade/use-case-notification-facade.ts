import { exit } from 'process';

// Subsystem services
class EmailService { send(to:string,msg:string){console.log(`📧 Email to ${to}: ${msg}`);} }
class SmsService { send(to:string,msg:string){console.log(`📱 SMS to ${to}: ${msg}`);} }
class PushService { send(to:string,msg:string){console.log(`🔔 Push to ${to}: ${msg}`);} }

type Channel='email'|'sms'|'push';

// Facade
class NotificationFacade {
  private email=new EmailService();
  private sms=new SmsService();
  private push=new PushService();
  send(userId:string,message:string,channels:Channel[]=['email']){
    channels.forEach(c=>{
      switch(c){
        case 'email': this.email.send(userId,message); break;
        case 'sms': this.sms.send(userId,message); break;
        case 'push': this.push.send(userId,message); break;
      }
    });
  }
}

// Demo
const notifier=new NotificationFacade();
notifier.send('user1','Welcome!',['email','push']);
exit(0); 