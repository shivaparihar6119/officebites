import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { HealthGoal } from '../../../core/models/models';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Welcome, {{ user?.fullName || user?.username }}! 👋</h1>
        <p>Your personal health & canteen hub</p>
      </div>

      <div class="dashboard-grid">
        <!-- Health Goal Card -->
        <div class="goal-card" *ngIf="healthGoal">
          <div class="goal-header">
            <span class="goal-icon">🎯</span>
            <div>
              <h3>Your Health Goal</h3>
              <span class="badge badge-primary">{{ goalLabels[healthGoal.goalType] }}</span>
            </div>
          </div>
          <div class="goal-details">
            <div class="detail-item" *ngIf="healthGoal.targetDailyCalories">
              <span class="d-label">Daily Calories</span>
              <span class="d-value">{{ healthGoal.targetDailyCalories }} kcal</span>
            </div>
            <div class="detail-item" *ngIf="healthGoal.targetDailyProtein">
              <span class="d-label">Daily Protein</span>
              <span class="d-value">{{ healthGoal.targetDailyProtein | number:'1.0-2' }}g</span>
            </div>
            <div class="detail-item" *ngIf="healthGoal.currentWeight">
              <span class="d-label">Current Weight</span>
              <span class="d-value">{{ healthGoal.currentWeight }} kg</span>
            </div>
            <div class="detail-item" *ngIf="healthGoal.targetWeight">
              <span class="d-label">Target Weight</span>
              <span class="d-value">{{ healthGoal.targetWeight }} kg</span>
            </div>
          </div>
          <a mat-stroked-button routerLink="/employee/health-goal" style="margin-top:16px;color:#6366f1">Update Goal</a>
        </div>

        <!-- No goal yet -->
        <div class="goal-card no-goal" *ngIf="!healthGoal">
          <span class="goal-icon">🎯</span>
          <h3>Set Your Health Goal</h3>
          <p>Tell us if you want to lose weight, gain muscle, or maintain your current health — and we'll recommend the best meals for you.</p>
          <a mat-raised-button routerLink="/employee/health-goal" class="btn-primary-gradient" style="margin-top:16px">Set Goal Now</a>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-grid">
            <a routerLink="/employee/recommendations" class="action-card">
              <span class="action-icon">✨</span>
              <span class="action-title">My Picks</span>
              <span class="action-desc">Food recommended for your goal</span>
            </a>
            <a routerLink="/employee/menu" class="action-card">
              <span class="action-icon">📋</span>
              <span class="action-title">Full Menu</span>
              <span class="action-desc">Browse all available dishes</span>
            </a>
            <a routerLink="/employee/health-goal" class="action-card">
              <span class="action-icon">🏋️</span>
              <span class="action-title">Health Goal</span>
              <span class="action-desc">Update your health targets</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
    .goal-card {
      background: linear-gradient(135deg, rgba(245,145,26,0.1), rgba(255,107,0,0.1));
      border: 1px solid rgba(245,145,26,0.3);
      border-radius: 20px; padding: 28px; display: flex; flex-direction: column;
      &.no-goal { align-items: center; text-align: center; }
      h3 { font-size: 16px; font-weight: 600; color: #f1f5f9; }
      p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 8px; }
    }
    .goal-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .goal-icon { font-size: 40px; }
    .goal-details { display: flex; flex-direction: column; gap: 12px; flex: 1; }
    .detail-item { display: flex; justify-content: space-between; padding: 10px 14px; background: rgba(245,145,26,0.06); border-radius: 10px; }
    .d-label { color: #94a3b8; font-size: 13px; }
    .d-value { color: #f1f5f9; font-weight: 600; font-size: 14px; }
    .quick-actions { h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #f1f5f9; } }
    .action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .action-card {
      background: #1C1612; border: 1px solid rgba(245,145,26,0.2);
      border-radius: 16px; padding: 24px; text-decoration: none;
      display: flex; flex-direction: column; gap: 6px; transition: all 0.2s;
      &:hover { border-color: rgba(245,145,26,0.5); transform: translateY(-4px); box-shadow: 0 12px 30px rgba(245,145,26,0.2); }
    }
    .action-icon { font-size: 32px; }
    .action-title { font-size: 15px; font-weight: 600; color: #f1f5f9; }
    .action-desc { font-size: 13px; color: #64748b; }
    @media(max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } .action-grid { grid-template-columns: 1fr; } }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  healthGoal: HealthGoal | null = null;
  goalLabels: Record<string, string> = {
    WEIGHT_LOSS: '⚖️ Weight Loss',
    MUSCLE_GAIN: '💪 Muscle Gain',
    MAINTENANCE: '✅ Maintenance'
  };

  constructor(public auth: AuthService, private employeeService: EmployeeService) {}

  get user() { return this.auth.currentUser; }

  ngOnInit() {
    this.employeeService.getMyHealthGoal().subscribe({
      next: (goal) => this.healthGoal = goal,
      error: () => this.healthGoal = null
    });
  }
}
