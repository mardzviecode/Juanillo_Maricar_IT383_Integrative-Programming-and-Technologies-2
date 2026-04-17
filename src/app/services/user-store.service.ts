import { Injectable } from '@angular/core';
import { usersModel } from '../Models/usersModel';

const STORAGE_KEY = 'registeredUsers';
const CURRENT_USER_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private read(): usersModel[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as usersModel[]) : [];
    } catch {
      return [];
    }
  }

  private write(users: usersModel[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  getUsers(): usersModel[] {
    return this.read();
  }

  addUser(user: usersModel): { ok: true } | { ok: false; error: string } {
    const users = this.read();
    const usernameTaken = users.some(
      (u) => u.username.trim().toLowerCase() === user.username.trim().toLowerCase()
    );
    const emailTaken = users.some(
      (u) => u.email.trim().toLowerCase() === user.email.trim().toLowerCase()
    );
    if (usernameTaken) return { ok: false, error: 'Username already exists.' };
    if (emailTaken) return { ok: false, error: 'Email already exists.' };

    users.push(user);
    this.write(users);
    return { ok: true };
  }

  setCurrentUser(user: usersModel): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): usersModel | null {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as usersModel;
    } catch {
      return null;
    }
  }

  clearCurrentUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  validate(email: string, password: string): boolean {
    const e = email.trim().toLowerCase();
    return this.read().some(
      (x) => x.email.trim().toLowerCase() === e && x.password === password
    );
  }
}

