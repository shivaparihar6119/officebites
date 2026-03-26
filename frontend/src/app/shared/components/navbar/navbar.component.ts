import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatMenuModule, MatIconModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="nav-icon">🍽️</span>
        <span class="nav-title">OfficeBites</span>
      </div>

      <div class="nav-links" *ngIf="role">
        <!-- Admin links -->
        <ng-container *ngIf="role === 'ADMIN'">
          <a routerLink="/admin/dashboard" class="nav-link">Dashboard</a>
          <a routerLink="/admin/users" class="nav-link">Users</a>
          <a routerLink="/admin/food-items" class="nav-link">Food Items</a>
        </ng-container>

        <!-- Vendor links -->
        <ng-container *ngIf="role === 'VENDOR'">
          <a routerLink="/vendor/dashboard" class="nav-link">Dashboard</a>
          <a routerLink="/vendor/food-items" class="nav-link">My Food Items</a>
          <a routerLink="/vendor/orders" class="nav-link">Pending Orders</a>
        </ng-container>

        <!-- Employee links -->
        <ng-container *ngIf="role === 'EMPLOYEE'">
          <a routerLink="/employee/dashboard" class="nav-link">Dashboard</a>
          <a routerLink="/employee/menu" class="nav-link">Menu</a>
          <a routerLink="/employee/cart" class="nav-link">Cart 🛒</a>
          <a routerLink="/employee/orders" class="nav-link">My Orders</a>
          <a routerLink="/employee/recommendations" class="nav-link">For Me</a>
          <a routerLink="/employee/health-goal" class="nav-link">Health Goal</a>
        </ng-container>
      </div>

      <div class="nav-user" *ngIf="user">
        <span class="role-badge" [class]="'role-' + role?.toLowerCase()">
          {{ role }}
        </span>
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <div class="avatar">{{ userInitial }}</div>
        </button>
        <mat-menu #menu="matMenu" class="user-menu">
          <div class="menu-header">
            <strong>{{ user.fullName || user.username }}</strong>
            <span>{{ user.email }}</span>
          </div>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-menu>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 64px;
      background: rgba(15,13,10,0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(245,145,26,0.25);
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 24px;
      z-index: 1000;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      .nav-icon { font-size: 24px; }
      .nav-title {
        font-size: 18px;
        font-weight: 800;
        background: linear-gradient(135deg, #F5911A, #FF6B00);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    .nav-link {
      padding: 6px 16px;
      border-radius: 8px;
      color: #A89880;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s, background 0.2s;
      &:hover { color: #F5F0E8; background: rgba(245,145,26,0.12); }
    }
    .nav-user {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-left: auto;
    }
    .role-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      &.role-admin    { background: rgba(239,68,68,0.15);    color: #ef4444; }
      &.role-vendor   { background: rgba(245,145,26,0.15);   color: #F5911A; }
      &.role-employee { background: rgba(34,197,94,0.15);    color: #22c55e; }
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F5911A, #FF6B00);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: white;
      cursor: pointer;
    }
    .menu-header {
      padding: 12px 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-bottom: 1px solid rgba(245,145,26,0.15);
      margin-bottom: 4px;
      strong { font-size: 14px; color: #F5F0E8; }
      span { font-size: 12px; color: #A89880; }
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  get user() { return this.auth.currentUser; }
  get role() { return this.auth.role; }
  get userInitial(): string {
    const name = this.user?.fullName || this.user?.username || '';
    return name.charAt(0).toUpperCase();
  }

  logout() { this.auth.logout(); }
}
