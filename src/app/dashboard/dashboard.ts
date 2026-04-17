import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { usersModel } from '../Models/usersModel';
import { UserStoreService } from '../services/user-store.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  loggedInUsername = '';
  currentUser: usersModel | null = null;
  isProfilePage = false;

  constructor(
    private router: Router,
    private userStore: UserStoreService
  ) {
    this.currentUser = this.userStore.getCurrentUser();
    this.loggedInUsername = this.currentUser?.username?.trim().toLowerCase() ?? '';
  }

  get isMaricarProfile(): boolean {
    return this.loggedInUsername === 'maricar';
  }

  get showRegisteredProfile(): boolean {
    return !!this.currentUser && !this.isMaricarProfile;
  }

  showProfilePage(): void {
    this.isProfilePage = true;
  }

  showShopPage(): void {
    this.isProfilePage = false;
  }

  logout() {
    this.userStore.clearCurrentUser();
    this.router.navigate(['/']);
  }
}
