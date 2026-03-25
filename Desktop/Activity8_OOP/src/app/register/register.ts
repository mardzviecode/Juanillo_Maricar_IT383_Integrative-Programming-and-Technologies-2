import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { usersModel } from '../Models/usersModel';
import { UserStoreService } from '../services/user-store.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  role: usersModel['role'] = 'Student';
  errorMessage = '';
  successMessage = '';
  users: usersModel[] = [];
  /** Filters the users table (username, email, role) */
  tableSearch = '';
  /** When set, the form saves updates for this user’s original email */
  editingOriginalEmail: string | null = null;

  constructor(
    private router: Router,
    private userStore: UserStoreService
  ) {
    this.users = this.userStore.getUsers();
  }

  /**
   * Normalize text for searching:
   * - trim
   * - case-insensitive
   * - diacritic-insensitive (e.g., "José" matches "Jose")
   */
  private normalizeSearch(value: unknown): string {
    return (value ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  get filteredUsers(): usersModel[] {
    const q = this.normalizeSearch(this.tableSearch);
    if (!q) return this.users;
    return this.users.filter(
      (u) =>
        this.normalizeSearch(u.username).includes(q) ||
        this.normalizeSearch(u.email).includes(q) ||
        this.normalizeSearch(u.role).includes(q)
    );
  }

  onTableSearchIconClick(): void {
    // Force focus back to the input and ensure change detection runs.
    const el = document.getElementById('table-search') as HTMLInputElement | null;
    el?.focus();
  }

  private clearFeedback() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private resetForm() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.role = 'Student';
    this.editingOriginalEmail = null;
  }

  submit() {
    this.clearFeedback();

    const user: usersModel = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    };

    if (this.editingOriginalEmail) {
      const result = this.userStore.updateUser(this.editingOriginalEmail, user);
      if (!result.ok) {
        this.errorMessage = result.error;
        return;
      }
      this.users = this.userStore.getUsers();
      this.successMessage = 'User updated.';
      this.resetForm();
      return;
    }

    const result = this.userStore.addUser(user);
    if (!result.ok) {
      this.errorMessage = result.error;
      return;
    }

    this.users = this.userStore.getUsers();
    this.successMessage = 'Registration successful.';
    this.resetForm();
  }

  startEdit(u: usersModel) {
    this.clearFeedback();
    this.editingOriginalEmail = u.email;
    this.username = u.username;
    this.email = u.email;
    this.password = u.password;
    this.role = u.role;
  }

  cancelEdit() {
    this.clearFeedback();
    this.resetForm();
  }

  deleteUser(u: usersModel) {
    this.clearFeedback();
    if (!confirm(`Remove ${u.username} (${u.email})?`)) return;
    const ok = this.userStore.deleteUser(u.email);
    if (!ok) {
      this.errorMessage = 'Could not delete user.';
      return;
    }
    if (
      this.editingOriginalEmail &&
      this.editingOriginalEmail.trim().toLowerCase() === u.email.trim().toLowerCase()
    ) {
      this.resetForm();
    }
    this.users = this.userStore.getUsers();
    this.successMessage = 'User removed.';
  }

  /** Clears edit mode so the form adds a new user (table toolbar). */
  newUserMode() {
    this.clearFeedback();
    this.resetForm();
  }

  backToLogin() {
    this.router.navigate(['/']);
  }
}
