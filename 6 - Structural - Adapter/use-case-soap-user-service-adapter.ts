// ============================================================================
// LEGACY SOAP USER SERVICE ADAPTER - Unified UserService API
// ============================================================================

import { exit } from 'process';
import { randomUUID } from 'crypto';

// -----------------------------------------------------------------------------
// 1. Target Interfaces
// -----------------------------------------------------------------------------

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
}

interface UpdateUserRequest extends Partial<CreateUserRequest> {}

interface UserService {
  getUser(id: string): Promise<User>;
  createUser(user: CreateUserRequest): Promise<User>;
  updateUser(id: string, user: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

// -----------------------------------------------------------------------------
// 2. Legacy SOAP client stub (Adaptee)
// -----------------------------------------------------------------------------

class SOAPClient {
  private endpoint: string;
  constructor(endpoint: string) { this.endpoint = endpoint; }
  // simulate SOAP request/response with fake data
  async send(xml: string): Promise<any> {
    // just echo back data in JS object structure
    const id = randomUUID();
    return {
      Body: [
        {
          Response: [
            {
              userId: [id],
              firstName: ['John'],
              lastName: ['Doe'],
              email: ['john.doe@example.com']
            }
          ]
        }
      ]
    };
  }
}

// -----------------------------------------------------------------------------
// 3. Adapter
// -----------------------------------------------------------------------------

class SOAPUserServiceAdapter implements UserService {
  private client: SOAPClient;
  constructor(private endpoint: string) {
    this.client = new SOAPClient(endpoint);
  }

  private buildSOAPRequest(op: string, data: Record<string,string>): string {
    return `<Envelope><Body><${op}>${Object.entries(data).map(([k,v])=>`<${k}>${v}</${k}>`).join('')}</${op}></Body></Envelope>`;
  }
  private soapToUser(resp: any): User {
    const u = resp.Body[0].Response[0];
    return { id: u.userId[0], firstName: u.firstName[0], lastName: u.lastName[0], email: u.email[0] };
  }

  async getUser(id: string): Promise<User> {
    const xml = this.buildSOAPRequest('GetUser', { userId: id });
    const resp = await this.client.send(xml);
    return this.soapToUser(resp);
  }
  async createUser(user: CreateUserRequest): Promise<User> {
    const xml = this.buildSOAPRequest('CreateUser', user as any);
    const resp = await this.client.send(xml);
    return this.soapToUser(resp);
  }
  async updateUser(id: string, user: UpdateUserRequest): Promise<User> {
    const xml = this.buildSOAPRequest('UpdateUser', { userId: id, ...user } as any);
    const resp = await this.client.send(xml);
    return this.soapToUser(resp);
  }
  async deleteUser(id: string): Promise<void> {
    const xml = this.buildSOAPRequest('DeleteUser', { userId: id });
    await this.client.send(xml);
  }
}

// -----------------------------------------------------------------------------
// 4. Demo
// -----------------------------------------------------------------------------

async function demo(): Promise<void> {
  console.log('=== SOAP USER SERVICE ADAPTER DEMO ===');
  const svc: UserService = new SOAPUserServiceAdapter('https://legacy.example.com/soap/user');
  const user = await svc.createUser({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' });
  console.log('Created:', user);
  const fetched = await svc.getUser(user.id);
  console.log('Fetched:', fetched);
  await svc.updateUser(user.id, { lastName: 'Smith' });
  console.log('Updated');
  await svc.deleteUser(user.id);
  console.log('Deleted');
}

(async () => {
  await demo();
  exit(0);
})();

export { SOAPUserServiceAdapter, UserService, User }; 