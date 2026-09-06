/*
 * INTENTIONAL PR REVIEW REGRESSION FIXTURE
 * This file contains deliberately unsafe code and matching safe controls.
 * Do not copy the unsafe functions into production code.
 */

type Role = 'admin' | 'editor' | 'viewer';

interface User {
  id: number;
  name: string;
  email?: string;
  role: Role;
}

interface ApiUser {
  id: unknown;
  name: unknown;
  email?: unknown;
  role: unknown;
}

interface SearchResponse {
  users: User[];
  nextPage?: string;
}

const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    (candidate.email === undefined || typeof candidate.email === 'string') &&
    ['admin', 'editor', 'viewer'].includes(String(candidate.role))
  );
};

// ---------------------------------------------------------------------------
// 1. Nullability, optional values, array access and definite assignment
// ---------------------------------------------------------------------------

function unsafeDisplayName(user: User | null): string {
  return user.name; // UNSAFE: nullable dereference
}

function safeDisplayName(user: User | null): string {
  return user?.name ?? 'Anonymous';
}

function unsafeEmailDomain(user: User): string {
  return user.email.split('@')[1]; // UNSAFE: optional property and array access
}

function safeEmailDomain(user: User): string | undefined {
  const email = user.email;
  if (!email) return undefined;
  return email.split('@').at(1);
}

function unsafeFindUser(users: User[], id: number): User {
  return users.find((user) => user.id === id); // UNSAFE: find may be undefined
}

function safeFindUser(users: User[], id: number): User | undefined {
  return users.find((user) => user.id === id);
}

function unsafeFirstUser(users: User[]): User {
  return users[0]; // UNSAFE: empty array
}

function safeFirstUser(users: readonly [User, ...User[]]): User {
  return users[0];
}

function unsafeAssignment(enabled: boolean): number {
  let result: number;
  if (enabled) result = 100;
  return result; // UNSAFE: not assigned on every path
}

function safeAssignment(enabled: boolean): number {
  const result = enabled ? 100 : 0;
  return result;
}

function unsafeOptionalMath(amount: number, discount?: number): number {
  return amount - discount; // UNSAFE: optional operand
}

function safeOptionalMath(amount: number, discount = 0): number {
  return amount - discount;
}

// ---------------------------------------------------------------------------
// 2. Runtime data validation and type-system escapes
// ---------------------------------------------------------------------------

function unsafeParseUser(payload: string): User {
  return JSON.parse(payload) as User; // UNSAFE: parse plus unchecked assertion
}

function safeParseUser(payload: string): User {
  const parsed: unknown = JSON.parse(payload);
  if (!isUser(parsed)) throw new Error('Invalid user payload');
  return parsed;
}

function unsafeConvert(value: unknown): number {
  return value as number; // UNSAFE: assertion without validation
}

function safeConvert(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError('Expected a finite number');
  }
  return value;
}

function unsafeProperty(object: object, key: string): unknown {
  return object[key]; // UNSAFE: dynamic access without index signature
}

function safeProperty<T extends object, K extends keyof T>(object: T, key: K): T[K] {
  return object[key];
}

function unsafeCallback(callback: Function): void {
  callback(); // UNSAFE: broad Function type
}

function safeCallback(callback: () => void): void {
  callback();
}

function unsafeApiMapping(apiUser: ApiUser): User {
  return apiUser as unknown as User; // UNSAFE: double assertion
}

function safeApiMapping(apiUser: ApiUser): User {
  if (!isUser(apiUser)) throw new TypeError('Invalid API user');
  return apiUser;
}

// ---------------------------------------------------------------------------
// 3. Async failures, HTTP reliability, cancellation and concurrency
// ---------------------------------------------------------------------------

async function unsafeLoadUsers(): Promise<User[]> {
  const response = await fetch('/api/users'); // UNSAFE: no timeout/status check
  return response.json(); // UNSAFE: unvalidated external data
}

async function safeLoadUsers(signal: AbortSignal): Promise<User[]> {
  const response = await fetch('/api/users', { signal });
  if (!response.ok) throw new Error(`Users request failed: ${response.status}`);
  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || !payload.every(isUser)) {
    throw new TypeError('Invalid users response');
  }
  return payload;
}

async function unsafeSearch(): Promise<SearchResponse | undefined> {
  try {
    const response = await fetch('/api/search');
    return await response.json();
  } catch (error) {
    // UNSAFE: swallowed failure
  }
}

async function safeSearch(signal: AbortSignal): Promise<SearchResponse> {
  try {
    const response = await fetch('/api/search', { signal });
    if (!response.ok) throw new Error(`Search failed: ${response.status}`);
    return (await response.json()) as SearchResponse;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('Unable to search', { cause: error });
  }
}

function unsafeDetachedPromise(): void {
  Promise.reject(new Error('Background failure')); // UNSAFE: unobserved rejection
}

function safeDetachedPromise(reportError: (error: unknown) => void): void {
  void Promise.reject(new Error('Background failure')).catch(reportError);
}

async function unsafeSequential(ids: number[]): Promise<User[]> {
  const users: User[] = [];
  for (const id of ids) {
    const response = await fetch(`/api/users/${id}`); // UNSAFE: serial independent I/O
    users.push(await response.json());
  }
  return users;
}

async function safeConcurrent(ids: number[], signal: AbortSignal): Promise<User[]> {
  return Promise.all(
    ids.map(async (id) => {
      const response = await fetch(`/api/users/${id}`, { signal });
      if (!response.ok) throw new Error(`User ${id} failed: ${response.status}`);
      const payload: unknown = await response.json();
      if (!isUser(payload)) throw new TypeError(`Invalid user ${id}`);
      return payload;
    }),
  );
}

function unsafeThrow(): never {
  throw 'Request failed'; // UNSAFE: non-Error throw
}

function safeThrow(): never {
  throw new Error('Request failed');
}

// ---------------------------------------------------------------------------
// 4. Resource ownership and cleanup
// ---------------------------------------------------------------------------

class UnsafeLiveUpdates {
  private timer?: ReturnType<typeof setInterval>;

  start(): void {
    this.timer = setInterval(() => console.log('refresh'), 1_000);
    window.addEventListener('resize', () => console.log('resized'));
    // UNSAFE: retained timer and listener have no cleanup path
  }
}

class SafeLiveUpdates {
  private timer?: ReturnType<typeof setInterval>;
  private readonly onResize = (): void => console.log('resized');

  start(): void {
    this.stop();
    this.timer = setInterval(() => console.log('refresh'), 1_000);
    window.addEventListener('resize', this.onResize);
  }

  stop(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    window.removeEventListener('resize', this.onResize);
  }
}

function unsafeObserver(element: Element): MutationObserver {
  const observer = new MutationObserver(() => console.log('changed'));
  observer.observe(element, { childList: true });
  return observer; // UNSAFE: ownership contract does not expose cleanup
}

function safeObserver(element: Element): () => void {
  const observer = new MutationObserver(() => console.log('changed'));
  observer.observe(element, { childList: true });
  return () => observer.disconnect();
}

// ---------------------------------------------------------------------------
// 5. Browser security boundaries
// ---------------------------------------------------------------------------

function unsafeRender(element: HTMLElement, content: string): void {
  element.innerHTML = content; // UNSAFE: injection sink
}

function safeRender(element: HTMLElement, content: string): void {
  element.textContent = content;
}

function unsafeRedirect(next: string): void {
  window.location.href = next; // UNSAFE: unvalidated redirect target
}

function safeRedirect(next: string): void {
  const target = new URL(next, window.location.origin);
  if (target.origin !== window.location.origin) throw new Error('External redirect blocked');
  window.location.assign(target.href);
}

function unsafeStoreToken(token: string): void {
  localStorage.setItem('access_token', token); // UNSAFE: long-lived script-readable token
}

function safeStorePreference(theme: 'light' | 'dark'): void {
  localStorage.setItem('theme', theme); // SAFE CONTROL: non-sensitive preference
}

function unsafePrototypeWrite(key: string, value: unknown): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  output[key] = value; // UNSAFE: attacker-controlled prototype key
  return output;
}

function safeDictionaryWrite(key: string, value: unknown): Record<string, unknown> {
  if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
    throw new Error('Unsafe key');
  }
  const output: Record<string, unknown> = Object.create(null);
  output[key] = value;
  return output;
}

// ---------------------------------------------------------------------------
// 6. Control-flow and authorization semantics
// ---------------------------------------------------------------------------

function unsafeCanDelete(role: Role): boolean {
  if (role === 'admin' || 'editor') return true; // UNSAFE: always truthy condition
  return false;
}

function safeCanDelete(role: Role): boolean {
  return role === 'admin' || role === 'editor';
}

function unsafeRoleLabel(role: Role): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'editor':
      return 'Editor';
  }
  return 'Unknown'; // UNSAFE: viewer silently falls into fallback
}

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

function safeRoleLabel(role: Role): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'editor':
      return 'Editor';
    case 'viewer':
      return 'Viewer';
    default:
      return assertNever(role);
  }
}

export {
  SafeLiveUpdates,
  UnsafeLiveUpdates,
  safeApiMapping,
  safeAssignment,
  safeCallback,
  safeCanDelete,
  safeConcurrent,
  safeConvert,
  safeDictionaryWrite,
  safeDisplayName,
  safeEmailDomain,
  safeFindUser,
  safeFirstUser,
  safeLoadUsers,
  safeObserver,
  safeOptionalMath,
  safeParseUser,
  safeProperty,
  safeRedirect,
  safeRender,
  safeRoleLabel,
  safeSearch,
  safeStorePreference,
  safeThrow,
  unsafeApiMapping,
  unsafeAssignment,
  unsafeCallback,
  unsafeCanDelete,
  unsafeConvert,
  unsafeDetachedPromise,
  unsafeDisplayName,
  unsafeEmailDomain,
  unsafeFindUser,
  unsafeFirstUser,
  unsafeLoadUsers,
  unsafeObserver,
  unsafeOptionalMath,
  unsafeParseUser,
  unsafeProperty,
  unsafeRedirect,
  unsafeRender,
  unsafeRoleLabel,
  unsafeSearch,
  unsafeSequential,
  unsafeStoreToken,
  unsafeThrow,
};
