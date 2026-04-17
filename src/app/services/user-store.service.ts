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
    const emailTaken = users.some(
      (u) => u.email.trim().toLowerCase() === user.email.trim().toLowerCase()
    );
    if (usernameTaken) return { ok: false, error: 'Username already exists.' };
    if (emailTaken) return { ok: false, error: 'Email already exists.' };

    users.push(user);
    this.write(users);
    return { ok: true };
  }

  updateUser(
    originalEmail: string,
    updated: usersModel
  ): { ok: true } | { ok: false; error: string } {
    const users = this.read();
    const original = originalEmail.trim().toLowerCase();
    const idx = users.findIndex((u) => u.email.trim().toLowerCase() === original);
    if (idx === -1) return { ok: false, error: 'User not found.' };

    const newEmail = updated.email.trim().toLowerCase();
    const newUsername = updated.username.trim().toLowerCase();
    const emailTaken = users.some(
      (u, i) => i !== idx && u.email.trim().toLowerCase() === newEmail
    );
    const usernameTaken = users.some(
      (u, i) => i !== idx && u.username.trim().toLowerCase() === newUsername
    );
    if (emailTaken) return { ok: false, error: 'Email already exists.' };
    if (usernameTaken) return { ok: false, error: 'Username already exists.' };

    users[idx] = {
      ...updated,
      email: updated.email.trim(),
      username: updated.username.trim(),
    };
    this.write(users);
    return { ok: true };
  }

  deleteUser(email: string): boolean {
    const key = email.trim().toLowerCase();
    const users = this.read();
    const next = users.filter((u) => u.email.trim().toLowerCase() !== key);
    if (next.length === users.length) return false;
    this.write(next);
    return true;
  }

  validate(email: string, password: string): boolean {
    const e = email.trim().toLowerCase();
    return this.read().some(
      (x) => x.email.trim().toLowerCase() === e && x.password === password
    );
  }
}

