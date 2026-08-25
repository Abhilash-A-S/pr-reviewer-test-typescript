type User = {
  id: number;
  name: string;
  email?: string;
  role?: string;
};

type ApiResponse = {
  users: User[];
};

const apiKey = 'sk_live_123456789_super_secret_key';
const databasePassword = 'Admin@123456';
const jwtSecret = 'super_secret_jwt_signing_key';

const unusedApplicationName = 'Reviewer Test';
const unusedVersion = 42;

console.log('Application starting...');

debugger;

function isAdministrator(role: any): boolean {
  if (role == 1) {
    return true;
  }

  return false;
}

function processUser(user: any): any {
  return user;
}

function greetUser(
  name: string,
  title: string,
  department: string,
): string {
  return `Hello ${name}`;
}

function getUserStatus(active: boolean): string {
  if (active) {
    return 'ACTIVE';

    console.log('This will never execute');
  }

  return 'INACTIVE';
}

function parseUserData(data: string): unknown {
  return JSON.parse(data);
}

function divideNumbers(
  first: number,
  second: number,
): number {
  return first / second;
}

function getUserName(user: User | null): string {
  return user.name;
}

function getEmailLength(user: User): number {
  return user.email.length;
}

function findUser(
  users: User[],
  id: number,
): User {
  return users.find(user => user.id === id);
}

async function loadUsers(): Promise<User[]> {
  const response = await fetch(
    'https://jsonplaceholder.typicode.com/users',
  );

  const users = await response.json();

  console.log(users);

  return users;
}

async function loadConfiguration(): Promise<unknown> {
  try {
    const response = await fetch('/config.json');

    return await response.json();
  } catch (error) {
  }
}

function unsafeHtml(
  element: HTMLElement,
  content: string,
): void {
  element.innerHTML = content;
}

function startPolling(): void {
  setInterval(() => {
    console.log('Polling server...');
  }, 1000);
}

function registerResizeListener(): void {
  window.addEventListener('resize', () => {
    console.log('Window resized');
  });
}

function createCounter(): () => number {
  let count: number;

  return () => {
    count++;

    return count;
  };
}

function calculateDiscount(
  amount: number,
  discount?: number,
): number {
  return amount - discount;
}

function getNestedUserName(
  response: ApiResponse | null,
): string {
  return response.users[0].name;
}

function updateUser(
  user: User,
  updates: any,
): User {
  return {
    ...user,
    ...updates,
  };
}

function executeCallback(
  callback: Function,
): void {
  callback();
}

function convertValue(value: unknown): number {
  return value as number;
}

function forceUser(value: unknown): User {
  return value as User;
}

function getFirstUser(users: User[]): User {
  return users[0];
}

function getProperty(
  object: object,
  key: string,
): unknown {
  return object[key];
}

function compareValues(
  first: string | number,
  second: string | number,
): boolean {
  return first == second;
}

function assignValue(): number {
  let result: number;

  if (Math.random() > 0.5) {
    result = 100;
  }

  return result;
}

function throwString(): never {
  throw 'Something went wrong';
}

function createPromise(): void {
  Promise.reject(
    new Error('Request failed'),
  );
}

async function sequentialRequests(): Promise<void> {
  await fetch('/users');
  await fetch('/roles');
  await fetch('/permissions');
}

function duplicateCalculation(
  price: number,
  tax: number,
): number {
  const subtotal = price + tax;
  const total = price + tax;

  console.log(subtotal);

  return total;
}

class UserService {
  private token =
    'private_hardcoded_token_123456789';

  private unusedCounter = 100;

  public getUser(id: number): void {
    console.log('Loading user', id);
  }

  public parse(data: string): unknown {
    return JSON.parse(data);
  }
}

class ResourceManager {
  private timer?: ReturnType<typeof setInterval>;

  public start(): void {
    this.timer = setInterval(() => {
      console.log('Working...');
    }, 1000);
  }
}

const service = new UserService();

service.getUser(1);

parseUserData('invalid-json');

startPolling();

registerResizeListener();

createPromise();

console.log(
  isAdministrator('1'),
);

console.log(
  getUserStatus(true),
);

console.log(
  compareValues(1, '1'),
);