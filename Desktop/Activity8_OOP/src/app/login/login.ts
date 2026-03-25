import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { usersModel } from '../Models/usersModel';
import { UserStoreService } from '../services/user-store.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  isLoginForm = true;
  loginMessage = '';
  registerMessage = '';
  newuserList: usersModel[] = [];
  /** Original email when editing a row from the users table */
  editingOriginalEmail: string | null = null;
  tableSearchCtrl = new FormControl('', { nonNullable: true });

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userStore: UserStoreService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(8)]]
    });

    this.registerForm = this.fb.group({
      regEmail: ['', [Validators.required, Validators.email]],
      usernameReg: ['', Validators.required],
      regPassword: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(8)]],
      role: ['Student', Validators.required]
    });

    this.newuserList = this.userStore.getUsers();
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

  get filteredRegisterUsers(): usersModel[] {
    const q = this.normalizeSearch(this.tableSearchCtrl.value);
    if (!q) return this.newuserList;
    return this.newuserList.filter(
      (u) =>
        this.normalizeSearch(u.username).includes(q) ||
        this.normalizeSearch(u.email).includes(q) ||
        this.normalizeSearch(u.role).includes(q)
    );
  }

  onTableSearchIconClick(): void {
    // Re-validate/refresh so the filter updates immediately.
    this.tableSearchCtrl.updateValueAndValidity({ emitEvent: true });
    const el = document.getElementById('login-table-search') as HTMLInputElement | null;
    el?.focus();
  }

  get students(): usersModel[] {
    return this.newuserList.filter(u => u.role === 'Student');
  }

  get instructors(): usersModel[] {
    return this.newuserList.filter(u => u.role === 'Instructor');
  }

  switchForm() {
    this.isLoginForm = !this.isLoginForm;
    this.loginMessage = '';
    this.registerMessage = '';
    if (this.isLoginForm) {
      this.cancelRegisterEdit();
    }
  }

  cancelRegisterEdit() {
    this.editingOriginalEmail = null;
    this.registerForm.reset();
    this.registerForm.patchValue({ role: 'Student' });
  }

  startRegisterEdit(u: usersModel) {
    this.registerMessage = '';
    this.editingOriginalEmail = u.email;
    this.registerForm.patchValue({
      regEmail: u.email,
      usernameReg: u.username,
      regPassword: u.password,
      role: u.role
    });
  }

  deleteRegisterUser(u: usersModel) {
    this.registerMessage = '';
    if (!confirm(`Remove ${u.username} (${u.email})?`)) return;
    const ok = this.userStore.deleteUser(u.email);
    if (!ok) {
      this.registerMessage = 'Could not delete user.';
      return;
    }
    if (
      this.editingOriginalEmail &&
      this.editingOriginalEmail.trim().toLowerCase() === u.email.trim().toLowerCase()
    ) {
      this.cancelRegisterEdit();
    }
    this.newuserList = this.userStore.getUsers();
    this.registerMessage = 'User removed.';
  }

  newRegisterUser() {
    this.registerMessage = '';
    this.cancelRegisterEdit();
  }

  onLoginSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      const { username, email, password } = this.loginForm.value;
      console.log('Username:', username, 'Email:', email, 'Password:', password);

      const isStudent = this.students.some(s => s.email === email && s.password === password);
      const isInstructor = this.instructors.some(i => i.email === email && i.password === password);

      if (isStudent || isInstructor) {
        this.loginMessage = 'Login successful!';
        this.router.navigate(['/dashboard']);
      } else {
        this.loginMessage = 'Invalid login credentials.';
      }
    }
  }

  onRegisterSubmit() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      const { regEmail, usernameReg, regPassword, role } = this.registerForm.value;
      const user: usersModel = {
        email: regEmail,
        username: usernameReg,
        password: regPassword,
        role: role
      };

      if (this.editingOriginalEmail) {
        const result = this.userStore.updateUser(this.editingOriginalEmail, user);
        if (result.ok) {
          this.newuserList = this.userStore.getUsers();
          this.registerMessage = 'User updated.';
          this.cancelRegisterEdit();
        } else {
          this.registerMessage = result.error;
        }
        return;
      }

      const result = this.userStore.addUser(user);
      if (result.ok) {
        this.newuserList = this.userStore.getUsers();
        this.registerMessage = 'Registration successful!';
        this.registerForm.reset();
        this.registerForm.patchValue({ role: 'Student' });
      } else {
        this.registerMessage = result.error;
      }
    }
  }
}

