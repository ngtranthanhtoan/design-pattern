import { exit } from 'process';

// 1. Types & Interfaces
interface Entity {
  id: string;
  [key: string]: unknown;
}

interface Repository<T extends Entity> {
  save(entity: T): T;
  findById(id: string): T | undefined;
}

// 2. Concrete repository - naive in-memory
class InMemoryRepository<T extends Entity> implements Repository<T> {
  private store = new Map<string, T>();
  save(entity: T): T {
    this.store.set(entity.id, entity);
    return entity;
  }
  findById(id: string): T | undefined {
    return this.store.get(id);
  }
}

// 3. Base decorator implementing same interface
abstract class RepositoryDecorator<T extends Entity> implements Repository<T> {
  constructor(protected repo: Repository<T>) {}
  abstract save(entity: T): T;
  findById(id: string): T | undefined {
    return this.repo.findById(id);
  }
}

// 4. Validation decorator
class ValidationRepositoryDecorator<T extends Entity> extends RepositoryDecorator<T> {
  constructor(repo: Repository<T>, private validate: (e: T) => void) {
    super(repo);
  }
  save(entity: T): T {
    // perform validation before delegating
    this.validate(entity);
    return this.repo.save(entity);
  }
}

// 5. Example usage with User entity
interface User extends Entity {
  name: string;
  email: string;
}

const userRepo: Repository<User> = new ValidationRepositoryDecorator(
  new InMemoryRepository<User>(),
  (u) => {
    if (!/^[\w.-]+@\w+\.\w+$/.test(u.email)) {
      throw new Error('Invalid email');
    }
    if (u.name.length < 3) {
      throw new Error('Name too short');
    }
  }
);

console.log('--- REPOSITORY VALIDATION DECORATOR DEMO ---');
userRepo.save({ id: '1', name: 'Alice', email: 'alice@example.com' });
try {
  userRepo.save({ id: '2', name: 'Bo', email: 'invalid' });
} catch (e) {
  console.error('Validation error caught as expected:', (e as Error).message);
}

console.log('Find by id 1:', userRepo.findById('1'));
exit(0); 