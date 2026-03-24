import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { usersModel } from '../Models/usersModel';
import { UserStoreService } from '../services/user-store.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  email = '';
  // Registration table preview
  newuserList: usersModel[] = [];
  hasValidated = false;

  constructor(
    private router: Router,
    private userStore: UserStoreService
  ) {
    this.newuserList = this.userStore.getUsers();
    this.hasValidated = this.newuserList.length > 0;
  }

  submit() {
    this.errorMessage = '';

    // Admin shortcut
    if (this.username === 'admin' && this.password === '1234567') {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Registered user login
    const ok = this.userStore.validate(this.username, this.password);
    if (ok) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.errorMessage = 'Invalid username or password. Please try again.';
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

