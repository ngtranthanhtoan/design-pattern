import { exit } from 'process';

// User & context
interface User { id: string; roles: string[]; }
const currentUser: User = { id: '42', roles: ['USER'] }; // toggle ROLE_ADMIN to test

// Subject interface
interface AdminService {
  dropDatabase(): void;
  viewLogs(): void;
}

// Real subject
class RealAdminService implements AdminService {
  dropDatabase() { console.log('☢️  Database dropped!'); }
  viewLogs() { console.log('📜 Logs: ...'); }
}

class ForbiddenError extends Error {}

// Proxy adding RBAC check
class SecurityProxy implements AdminService {
  constructor(private real: AdminService, private user: User) {}
  private assertAdmin() {
    if (!this.user.roles.includes('ROLE_ADMIN')) throw new ForbiddenError('Access denied');
  }
  dropDatabase() { this.assertAdmin(); this.real.dropDatabase(); }
  viewLogs() { this.assertAdmin(); this.real.viewLogs(); }
}

// Demo
try {
  const svc: AdminService = new SecurityProxy(new RealAdminService(), currentUser);
  svc.viewLogs();
} catch (e) {
  console.error('❌', (e as Error).message);
}

// escalate privileges and retry
currentUser.roles.push('ROLE_ADMIN');
const adminSvc: AdminService = new SecurityProxy(new RealAdminService(), currentUser);
adminSvc.viewLogs();
exit(0); 