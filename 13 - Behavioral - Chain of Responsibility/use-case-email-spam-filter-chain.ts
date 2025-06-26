import { exit } from 'process';

// Email message
interface Email {
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
}

// Handler interface
abstract class SpamFilter {
  protected next?: SpamFilter;
  protected name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  setNext(filter: SpamFilter): SpamFilter {
    this.next = filter;
    return filter;
  }
  
  handle(email: Email): boolean {
    if (this.isSpam(email)) {
      console.log(`🚫 ${this.name} detected spam: ${email.subject}`);
      return true; // Stop chain, email is spam
    }
    
    if (this.next) {
      return this.next.handle(email);
    }
    
    console.log(`✅ Email passed all filters: ${email.subject}`);
    return false; // Not spam
  }
  
  protected abstract isSpam(email: Email): boolean;
}

// Keyword filter
class KeywordFilter extends SpamFilter {
  private spamKeywords = ['free money', 'lottery winner', 'viagra', 'click here'];
  
  constructor() { super('Keyword Filter'); }
  
  protected isSpam(email: Email): boolean {
    const content = `${email.subject} ${email.body}`.toLowerCase();
    return this.spamKeywords.some(keyword => content.includes(keyword));
  }
}

// Sender reputation filter
class ReputationFilter extends SpamFilter {
  private blacklistedDomains = ['spammer.com', 'suspicious.net'];
  
  constructor() { super('Reputation Filter'); }
  
  protected isSpam(email: Email): boolean {
    const domain = email.from.split('@')[1];
    return this.blacklistedDomains.includes(domain);
  }
}

// Content analysis filter
class ContentFilter extends SpamFilter {
  constructor() { super('Content Filter'); }
  
  protected isSpam(email: Email): boolean {
    // Check for excessive capitalization
    const capsRatio = (email.subject.match(/[A-Z]/g) || []).length / email.subject.length;
    return capsRatio > 0.7; // More than 70% caps
  }
}

// Machine learning filter
class MLFilter extends SpamFilter {
  constructor() { super('ML Filter'); }
  
  protected isSpam(email: Email): boolean {
    // Simulate ML scoring (random for demo)
    const score = Math.random();
    return score > 0.8; // 20% chance of being marked as spam
  }
}

// Demo
const keywordFilter = new KeywordFilter();
const reputationFilter = new ReputationFilter();
const contentFilter = new ContentFilter();
const mlFilter = new MLFilter();

// Build chain: Keyword → Reputation → Content → ML
keywordFilter.setNext(reputationFilter).setNext(contentFilter).setNext(mlFilter);

console.log('=== EMAIL SPAM FILTER CHAIN DEMO ===');

// Test different emails
const emails: Email[] = [
  {
    from: 'legitimate@company.com',
    to: 'user@example.com',
    subject: 'Meeting tomorrow',
    body: 'Hi, let\'s meet tomorrow at 2 PM.',
    timestamp: new Date()
  },
  {
    from: 'spammer@spammer.com',
    to: 'user@example.com',
    subject: 'FREE MONEY NOW!!!',
    body: 'You won the lottery! Click here to claim your prize.',
    timestamp: new Date()
  },
  {
    from: 'marketing@company.com',
    to: 'user@example.com',
    subject: 'SPECIAL OFFER TODAY ONLY',
    body: 'Limited time offer on our products.',
    timestamp: new Date()
  }
];

emails.forEach((email, index) => {
  console.log(`\n--- Processing email ${index + 1} ---`);
  keywordFilter.handle(email);
});

exit(0); 