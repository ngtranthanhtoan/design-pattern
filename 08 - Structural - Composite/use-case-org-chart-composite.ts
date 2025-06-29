// ============================================================================
// ORG CHART COMPOSITE - Departments and Employees
// ============================================================================
import { exit } from 'process';

interface OrgComponent {
  getName(): string;
  getHeadcount(): number;
  getSalary(): number;
  render(indent?: string): void;
}

class Employee implements OrgComponent {
  constructor(private name: string, private salary: number) {}
  getName(){return this.name;}
  getHeadcount(){return 1;}
  getSalary(){return this.salary;}
  render(indent:string=''){console.log(`${indent}👤 ${this.name} ($${this.salary})`);} 
}

class Department implements OrgComponent {
  private members: OrgComponent[]=[];
  constructor(private name: string) {}
  add(member: OrgComponent){this.members.push(member);} 
  getName(){return this.name;}
  getHeadcount(){return this.members.reduce((c,m)=>c+m.getHeadcount(),0);} 
  getSalary(){return this.members.reduce((s,m)=>s+m.getSalary(),0);}  
  render(indent:string=''){
    console.log(`${indent}🏢 Dept[${this.name}] (${this.getHeadcount()} ppl, $${this.getSalary()})`);
    this.members.forEach(m=>m.render(indent+'  '));
  }
}

function demo(){
  console.log('=== ORG CHART COMPOSITE DEMO ===');
  const company = new Department('Company');
  const eng = new Department('Engineering');
  eng.add(new Employee('Alice', 120000));
  eng.add(new Employee('Bob', 110000));
  const qa = new Department('QA');
  qa.add(new Employee('Charlie', 90000));
  eng.add(qa);
  const hr = new Department('HR');
  hr.add(new Employee('Dana', 80000));
  company.add(eng); company.add(hr);

  company.render();
  console.log(`Total headcount: ${company.getHeadcount()}`);
  console.log(`Total payroll: $${company.getSalary()}`);
  exit(0);
}

demo();

export {OrgComponent, Employee, Department}; 