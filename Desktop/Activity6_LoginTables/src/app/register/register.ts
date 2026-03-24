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
  errorMessage = '';
  users: usersModel[] = [];
  registrationSuccess = false;

  constructor(
    private router: Router,
    private userStore: UserStoreService
  ) {
    this.users = this.userStore.getUsers();
  }

  submit() {
    this.errorMessage = '';
    this.registrationSuccess = false;

    const user: usersModel = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: 'Student'
    };

    const result = this.userStore.addUser(user);
    if (!result.ok) {
      this.errorMessage = result.error;
      return;
    }

    this.users = this.userStore.getUsers();
    this.registrationSuccess = true;
  }

  backToLogin() {
    this.router.navigate(['/']);
  }
}

