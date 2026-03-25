import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';
import { GoalType } from '../../../core/models/models';

@Component({
  selector: 'app-health-goal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Set Health Goal 🎯</h1>
        <p>Configure your daily nutrition targets to get personalized food recommendations</p>
      </div>

      <!-- Goal Form -->
      <div class="form-panel">
        <h3>Your Details & Goal</h3>
        <p class="subtitle" style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">
          We'll automatically calculate your daily calories and protein based on your profile!
        </p>
        <form [formGroup]="goalForm" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>Goal Type</mat-label>
            <mat-select formControlName="goalType">
              <mat-option value="WEIGHT_LOSS">⚖️ Weight Loss</mat-option>
              <mat-option value="MUSCLE_GAIN">💪 Muscle Gain</mat-option>
              <mat-option value="MAINTENANCE">✅ Maintenance</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="input-row">
            <mat-form-field appearance="outline">
              <mat-label>Gender</mat-label>
              <mat-select formControlName="gender">
                <mat-option value="MALE">Male</mat-option>
                <mat-option value="FEMALE">Female</mat-option>
                <mat-option value="OTHER">Other</mat-option>
              </mat-select>
              <mat-error *ngIf="goalForm.get('gender')?.hasError('required')">Required</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Age (years)</mat-label>
              <input matInput type="number" formControlName="age">
              <mat-error *ngIf="goalForm.get('age')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="goalForm.get('age')?.hasError('min') || goalForm.get('age')?.hasError('max')">10 - 120 years</mat-error>
            </mat-form-field>
          </div>

          <div class="input-row">
            <mat-form-field appearance="outline">
              <mat-label>Height (cm)</mat-label>
              <input matInput type="number" step="0.1" formControlName="height">
              <mat-error *ngIf="goalForm.get('height')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="goalForm.get('height')?.hasError('min') || goalForm.get('height')?.hasError('max')">50 - 300 cm</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Current Weight (kg)</mat-label>
              <input matInput type="number" step="0.1" formControlName="currentWeight">
              <mat-error *ngIf="goalForm.get('currentWeight')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="goalForm.get('currentWeight')?.hasError('min') || goalForm.get('currentWeight')?.hasError('max')">20 - 300 kg</mat-error>
            </mat-form-field>
          </div>
          
          <div class="input-row">
            <mat-form-field appearance="outline">
              <mat-label>Target Weight (kg) — optional</mat-label>
              <input matInput type="number" step="0.1" formControlName="targetWeight">
              <mat-error *ngIf="goalForm.get('targetWeight')?.hasError('min') || goalForm.get('targetWeight')?.hasError('max')">20 - 300 kg</mat-error>
              <mat-error *ngIf="goalForm.get('targetWeight')?.hasError('targetWeightTooHigh')">Weight loss: Target must be less than current weight.</mat-error>
              <mat-error *ngIf="goalForm.get('targetWeight')?.hasError('targetWeightTooLow')">Muscle gain: Target must be greater than current weight.</mat-error>
            </mat-form-field>
          </div>

          <div class="success-msg" *ngIf="saved">
            ✅ Health goal saved! Food recommendations are now personalized for you.
          </div>

          <button mat-raised-button type="submit" class="btn-primary-gradient save-btn" [disabled]="goalForm.invalid">
            Save Goal
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .goal-layout { display: flex; justify-content: center; max-width: 600px; margin: 0 auto; }
    .form-panel { background: #1C1612; border: 1px solid rgba(245,145,26,0.2); border-radius: 16px; padding: 24px; width: 100%; }
    h3 { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .save-btn { width: 100%; height: 48px; margin-top: 8px; }
    .success-msg { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.3); color: #86efac; padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 12px; }
    @media(max-width: 768px) { .goal-layout { grid-template-columns: 1fr; } .input-row { grid-template-columns: 1fr; } }
  `]
})
export class HealthGoalComponent implements OnInit {
  goalForm: FormGroup;
  saved = false;

  constructor(private fb: FormBuilder, private employeeService: EmployeeService, private snackBar: MatSnackBar) {
    this.goalForm = this.fb.group({
      goalType: ['', Validators.required],
      gender: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(10), Validators.max(120)]],
      height: [null, [Validators.required, Validators.min(50), Validators.max(300)]],
      currentWeight: [null, [Validators.required, Validators.min(20), Validators.max(300)]],
      targetWeight: [null, [Validators.min(20), Validators.max(300)]]
    }, { validators: this.weightGoalValidator });
  }

  weightGoalValidator(group: FormGroup): { [key: string]: any } | null {
    const goalType = group.get('goalType')?.value;
    const currentWeight = group.get('currentWeight')?.value;
    const targetWeightControl = group.get('targetWeight');
    const targetWeight = targetWeightControl?.value;

    if (!goalType || !currentWeight || !targetWeight) {
      if (targetWeightControl?.hasError('targetWeightTooHigh') || targetWeightControl?.hasError('targetWeightTooLow')) {
        const { targetWeightTooHigh, targetWeightTooLow, ...otherErrors } = targetWeightControl.errors || {};
        targetWeightControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
      return null;
    }

    if (goalType === 'WEIGHT_LOSS' && targetWeight >= currentWeight) {
      targetWeightControl.setErrors({ ...targetWeightControl.errors, targetWeightTooHigh: true });
      return { targetWeightTooHigh: true };
    }
    
    if (goalType === 'MUSCLE_GAIN' && targetWeight <= currentWeight) {
      targetWeightControl.setErrors({ ...targetWeightControl.errors, targetWeightTooLow: true });
      return { targetWeightTooLow: true };
    }

    // Clear custom errors if valid
    if (targetWeightControl?.hasError('targetWeightTooHigh') || targetWeightControl?.hasError('targetWeightTooLow')) {
      const { targetWeightTooHigh, targetWeightTooLow, ...otherErrors } = targetWeightControl.errors || {};
      targetWeightControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }

    return null;
  }

  ngOnInit() {
    this.employeeService.getMyHealthGoal().subscribe({
      next: (goal) => this.goalForm.patchValue(goal),
      error: () => {}
    });
  }

  save() {
    if (this.goalForm.invalid) return;
    this.employeeService.setHealthGoal(this.goalForm.value).subscribe({
      next: () => {
        this.saved = true;
        this.snackBar.open('Health goal saved!', 'OK', { duration: 3000, panelClass: 'snack-success' });
      },
      error: (err) => {
        const errorMsg = typeof err.error === 'string' ? err.error : 'Error saving goal';
        this.snackBar.open(errorMsg, 'OK', { duration: 4000, panelClass: 'snack-error' });
      }
    });
  }
}
