import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../core/services/admin.service';
import { AdminStats } from '../../../core/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your canteen system from one place</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(99,102,241,0.15)">👥</div>
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(245,158,11,0.15)">🏪</div>
          <div class="stat-value">{{ stats.totalVendors }}</div>
          <div class="stat-label">Vendors</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(16,185,129,0.15)">👤</div>
          <div class="stat-value">{{ stats.totalEmployees }}</div>
          <div class="stat-label">Employees</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(6,182,212,0.15)">🍽️</div>
          <div class="stat-value">{{ stats.activeFoodItems }}<span>/{{ stats.totalFoodItems }}</span></div>
          <div class="stat-label">Active / Total Food Items</div>
        </div>
      </div>

      <!-- Quick Create Vendor -->
      <div class="section-card">
        <h3>Create Vendor Account</h3>
        <form [formGroup]="vendorForm" (ngSubmit)="createVendor()" class="vendor-form">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName">
            <mat-error *ngIf="vendorForm.get('fullName')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="vendorForm.get('fullName')?.hasError('pattern')">Letters & spaces (2-50)</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email">
            <mat-error *ngIf="vendorForm.get('email')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="vendorForm.get('email')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username">
            <mat-error *ngIf="vendorForm.get('username')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="vendorForm.get('username')?.hasError('pattern')">Alphanumeric (3-20)</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password">
            <mat-error *ngIf="vendorForm.get('password')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="vendorForm.get('password')?.hasError('pattern')">Strong pwd req</mat-error>
          </mat-form-field>
          <button mat-raised-button type="submit" class="btn-primary-gradient"
                  [disabled]="vendorForm.invalid">
            Create Vendor
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-value span { font-size: 16px; color: #64748b; }
    .section-card {
      background: #1e293b;
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 16px;
      padding: 24px;
      h3 { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: #f1f5f9; }
    }
    .vendor-form {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
      align-items: start;
      button { height: 56px; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  vendorForm: FormGroup;
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  constructor(private adminService: AdminService, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.vendorForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]{2,50}$/)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,50}$/)]]
    });
  }

  ngOnInit() {
    this.adminService.getStats().subscribe(s => this.stats = s);
  }

  createVendor() {
    if (this.vendorForm.invalid) return;
    this.adminService.createVendor(this.vendorForm.value).subscribe({
      next: () => {
        this.snackBar.open('Vendor created successfully!', 'OK', { duration: 3000, panelClass: 'snack-success' });
        if (this.formDirective) this.formDirective.resetForm();
        this.vendorForm.reset();
        this.adminService.getStats().subscribe(s => this.stats = s);
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Error creating vendor', 'OK', { duration: 3000, panelClass: 'snack-error' })
    });
  }
}
