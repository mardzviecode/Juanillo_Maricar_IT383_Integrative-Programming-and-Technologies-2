import { Injectable } from '@angular/core';
import { usersModel } from '../Models/usersModel';

const STORAGE_KEY = 'registeredUsers';

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
    if (usernameTaken) return { ok: false, error: 'Username already exists.' };

    users.push(user);
    this.write(users);
    return { ok: true };
  }

  validate(username: string, password: string): boolean {
    const u = username.trim().toLowerCase();
    return this.read().some(
      (x) => x.username.trim().toLowerCase() === u && x.password === password
    );
  }
}

