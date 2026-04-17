import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStoreService } from '../services/user-store.service';
import { usersModel } from '../Models/usersModel';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  isMaricarAccount = false;
  loggedInUser: usersModel | null = null;
  currentUsername = '';
  currentEmail = '';

  constructor(
    private router: Router,
    private userStore: UserStoreService
  ) {
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return;

      const currentUser = JSON.parse(raw) as { username?: string; email?: string };
      this.currentUsername = (currentUser.username ?? '').trim();
      this.currentEmail = (currentUser.email ?? '').trim().toLowerCase();
      this.isMaricarAccount = this.currentUsername.toLowerCase() === 'maricar';

      const users = this.userStore.getUsers();
      this.loggedInUser =
        users.find((u) => u.email.trim().toLowerCase() === this.currentEmail) ?? null;
    } catch {
      this.isMaricarAccount = false;
      this.loggedInUser = null;
      this.currentUsername = '';
      this.currentEmail = '';
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
