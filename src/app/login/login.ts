import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  }

  onLoginSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      const { username, email, password } = this.loginForm.value;
      console.log('Username:', username, 'Email:', email, 'Password:', password);

      const isStudent = this.students.some(s => s.email === email && s.password === password);
      const isInstructor = this.instructors.some(i => i.email === email && i.password === password);

      if (isStudent || isInstructor) {
        const matchedUser = this.newuserList.find(
          (user) => user.email === email && user.password === password
        );
        if (matchedUser) {
          this.userStore.setCurrentUser(matchedUser);
        }
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

