// ============================================================================
// MESSAGING BRIDGE - Alerts & Reports across multiple channels
// ============================================================================

import { exit } from 'process';

// -----------------------------------------------------------------------------
// 1. Implementation Hierarchy (MessageChannels)
// -----------------------------------------------------------------------------

interface MessageChannel {
  sendMessage(subject: string, body: string): Promise<void>;
  name(): string;
}

class EmailChannel implements MessageChannel {
  async sendMessage(subject: string, body: string): Promise<void> {
    console.log(`📧 [EMAIL] Subject: ${subject}\n${body}`);
  }
  name(): string { return 'email'; }
}

class SmsChannel implements MessageChannel {
  async sendMessage(subject: string, body: string): Promise<void> {
    console.log(`📱 [SMS] ${subject}: ${body.substring(0, 120)}`);
  }
  name(): string { return 'sms'; }
}

class SlackChannel implements MessageChannel {
  async sendMessage(subject: string, body: string): Promise<void> {
    console.log(`💬 [SLACK] *${subject}* -> ${body}`);
  }
  name(): string { return 'slack'; }
}

// -----------------------------------------------------------------------------
// 2. Abstraction Hierarchy (Message types)
// -----------------------------------------------------------------------------

abstract class Message {
  protected channel: MessageChannel;
  constructor(channel: MessageChannel) { this.channel = channel; }
  abstract send(content: string): Promise<void>;
}

class AlertMessage extends Message {
  async send(content: string): Promise<void> {
    const subject = '🚨 ALERT';
    await this.channel.sendMessage(subject, content);
  }
}

class ReportMessage extends Message {
  async send(content: string): Promise<void> {
    const subject = '📊 REPORT';
    await this.channel.sendMessage(subject, content);
  }
}

// -----------------------------------------------------------------------------
// 3. Demonstration & Tests
// -----------------------------------------------------------------------------

async function demo(): Promise<void> {
  console.log('=== MESSAGING BRIDGE DEMO ===');
  const channels: MessageChannel[] = [new EmailChannel(), new SmsChannel(), new SlackChannel()];

  for (const channel of channels) {
    console.log(`\n--- Using ${channel.name().toUpperCase()} channel ---`);

    const alert = new AlertMessage(channel);
    await alert.send('CPU usage exceeded 90% on server-01');

    const report = new ReportMessage(channel);
    await report.send('Daily sales: $12,340; New sign-ups: 230');
  }
}

(async () => {
  await demo();
  exit(0);
})();

export { MessageChannel, Message, AlertMessage, ReportMessage, EmailChannel, SmsChannel, SlackChannel }; 