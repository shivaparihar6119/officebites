import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatProgressSpinnerModule],
  template: `
    <div class="auth-card">
      <h2>Create Account ✨</h2>
      <p class="subtitle">Register as a new employee</p>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">

        <div class="field-group">
          <label class="field-label" for="fullName">Full Name</label>
          <input id="fullName" class="field-input" type="text"
                 formControlName="fullName" placeholder="Your full name">
          <div class="field-error" *ngIf="registerForm.get('fullName')?.invalid && (registerForm.get('fullName')?.touched || registerForm.get('fullName')?.dirty)">
            <span *ngIf="registerForm.get('fullName')?.errors?.['required']">Full name is required</span>
            <span *ngIf="registerForm.get('fullName')?.errors?.['pattern']">Letters and spaces only (2-50 chars)</span>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="email">Email</label>
          <input id="email" class="field-input" type="email"
                 formControlName="email" placeholder="you@company.com">
          <div class="field-error" *ngIf="registerForm.get('email')?.invalid && (registerForm.get('email')?.touched || registerForm.get('email')?.dirty)">
            <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="registerForm.get('email')?.errors?.['email']">Missing '&#64;' or invalid format</span>
            <span *ngIf="registerForm.get('email')?.errors?.['pattern']">Missing domain (e.g., .com, .org)</span>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="reg-username">Username</label>
          <input id="reg-username" class="field-input" type="text"
                 formControlName="username" placeholder="Choose a username">
          <div class="field-error" *ngIf="registerForm.get('username')?.invalid && (registerForm.get('username')?.touched || registerForm.get('username')?.dirty)">
            <span *ngIf="registerForm.get('username')?.errors?.['required']">Username is required</span>
            <span *ngIf="registerForm.get('username')?.errors?.['pattern']">Use only letters, numbers, underscores (3-20 chars)</span>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="reg-password">Password</label>
          <input id="reg-password" class="field-input" type="password"
                 formControlName="password" placeholder="Min 8 chars, 1 uppercase, 1 special">
          <div class="field-error" *ngIf="registerForm.get('password')?.invalid && (registerForm.get('password')?.touched || registerForm.get('password')?.dirty)">
            <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="registerForm.get('password')?.errors?.['pattern']">Require: 8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special (&#64;#$%^&+=!)</span>
          </div>
        </div>

        <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>

        <button type="submit" class="submit-btn" [disabled]="registerForm.invalid || loading">
          <mat-spinner diameter="18" *ngIf="loading"></mat-spinner>
          <span *ngIf="!loading">Create Account</span>
        </button>
      </form>

      <p class="auth-link">Already have an account? <a routerLink="/auth/login">Sign in</a></p>
    </div>
  `,
  styles: [`
    .auth-card {
      background: rgba(28,22,18,0.95);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(245,145,26,0.25);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
    }
    h2 { font-size: 24px; font-weight: 700; color: #F5F0E8; margin-bottom: 4px; }
    .subtitle { color: #A89880; font-size: 14px; margin-bottom: 28px; }

    .auth-form { display: flex; flex-direction: column; gap: 18px; }

    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label {
      font-size: 13px;
      font-weight: 600;
      color: #A89880;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .field-input {
      width: 100%;
      height: 48px;
      padding: 0 16px;
      background: rgba(245,145,26,0.06);
      border: 1.5px solid rgba(245,145,26,0.25);
      border-radius: 10px;
      color: #F5F0E8;
      font-size: 15px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
      &::placeholder { color: #5a4535; }
      &:focus {
        border-color: #F5911A;
        box-shadow: 0 0 0 3px rgba(245,145,26,0.15);
      }
    }

    .field-error {
      color: #ef4444; font-size: 11px; margin-top: 2px; padding-left: 4px;
      line-height: 1.3;
    }

    .error-msg {
      background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3);
      color: #fca5a5; padding: 10px 14px; border-radius: 8px; font-size: 13px;
    }
    .success-msg {
      background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3);
      color: #86efac; padding: 10px 14px; border-radius: 8px; font-size: 13px;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #F5911A, #FF6B00);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      margin-top: 4px;
      &:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(245,145,26,0.4); transform: translateY(-1px); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .auth-link {
      text-align: center; margin-top: 20px; color: #A89880; font-size: 14px;
      a { color: #F5911A; text-decoration: none; font-weight: 600; }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]{2,50}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{3,20}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,50}$/)]],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.auth.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error || 'Registration failed. Try again.';
      }
    });
  }
}
