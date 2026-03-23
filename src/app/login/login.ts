import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  submit() {
    this.errorMessage = '';
    if (this.username === 'admin' && this.password === '1234567') {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid username or password. Please try again.';
    }
  }
}
