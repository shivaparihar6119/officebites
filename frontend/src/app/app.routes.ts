import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Auth Layout (login/register)
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    canActivate: [publicOnlyGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [roleGuard('ADMIN')],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'food-items', loadComponent: () => import('./features/admin/food-items/admin-food-items.component').then(m => m.AdminFoodItemsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Vendor Routes
  {
    path: 'vendor',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [roleGuard('VENDOR')],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/vendor/dashboard/vendor-dashboard.component').then(m => m.VendorDashboardComponent) },
      { path: 'food-items', loadComponent: () => import('./features/vendor/food-items/vendor-food-items.component').then(m => m.VendorFoodItemsComponent) },
      { path: 'orders', loadComponent: () => import('./features/vendor/orders/vendor-orders.component').then(m => m.VendorOrdersComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Employee Routes
  {
    path: 'employee',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [roleGuard('EMPLOYEE')],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/employee/dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent) },
      { path: 'health-goal', loadComponent: () => import('./features/employee/health-goal/health-goal.component').then(m => m.HealthGoalComponent) },
      { path: 'recommendations', loadComponent: () => import('./features/employee/recommendations/recommendations.component').then(m => m.RecommendationsComponent) },
      { path: 'menu', loadComponent: () => import('./features/employee/menu/menu.component').then(m => m.MenuComponent) },
      { path: 'cart', loadComponent: () => import('./features/employee/cart/cart.component').then(m => m.CartComponent) },
      { path: 'orders', loadComponent: () => import('./features/employee/orders/employee-orders.component').then(m => m.EmployeeOrdersComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/auth/login' }
];
