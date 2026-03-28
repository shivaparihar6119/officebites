import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, StreakData } from '../../../core/models/models';

@Component({
  selector: 'app-employee-orders',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1>My Orders 🍔</h1>
          <p>Track your eating habits and health goals</p>
        </div>
        <div class="streak-badge" *ngIf="streak !== undefined">
          🔥 {{ streak }} Day Streak
        </div>
      </div>

      <div *ngIf="loading" class="empty">
        <p>Loading your orders...</p>
      </div>

      <div class="orders-list" *ngIf="!loading && orders.length > 0">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <h3>{{ order.foodItem.name }}</h3>
            <span class="status-badge" [ngClass]="order.status.toLowerCase()">
              {{ order.status }}
            </span>
          </div>
          
          <div class="order-details">
            <p><strong>Order Date:</strong> {{ order.orderDate | date:'medium' }}</p>
            <p *ngIf="order.deliveryDate"><strong>Delivered:</strong> {{ order.deliveryDate | date:'medium' }}</p>
            <p *ngIf="order.status === 'PENDING'"><strong>One Time Code:</strong> <span class="otc-text">{{ order.oneTimeCode }}</span></p>
            <div class="nutrition-summary">
              <span>{{ order.foodItem.calories }} kcal</span> • 
              <span>{{ order.foodItem.protein }}g protein</span>
            </div>
          </div>
          <div class="vendor-info">
             🏪 {{ order.foodItem.vendor?.fullName || 'Vendor' }}
          </div>

          <!-- Rating Section (Only if not already rated) -->
          <div class="rating-section" *ngIf="order.status === 'DELIVERED' && !order.rating">
            <div class="rating-header">Rate your meal:</div>
            <div class="stars">
              <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                        (click)="setRating(order, star)"
                        [class.active]="star <= (ratings[order.id!] || 0)">
                star
              </mat-icon>
            </div>
            <div class="rating-input" *ngIf="ratings[order.id!] !== undefined">
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <input matInput [(ngModel)]="comments[order.id!]" placeholder="Add a comment (optional)">
              </mat-form-field>
              <button mat-flat-button color="accent" size="small" (click)="submitRating(order)">Submit</button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty" *ngIf="!loading && orders.length === 0">
        <span style="font-size:48px">📦</span>
        <p style="color:#64748b;margin-top:12px">You haven't placed any orders yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .streak-badge { background: #ff9800; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .orders-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .order-card { background: #1e293b; border: 1px solid rgba(99,102,241,0.2); border-radius: 16px; padding: 20px; }
    .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .order-header h3 { margin: 0; color: #f1f5f9; font-size: 18px; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .status-badge.pending { background: rgba(234, 179, 8, 0.2); color: #facc15; }
    .status-badge.delivered { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .order-details p { color: #94a3b8; font-size: 14px; margin: 4px 0; }
    .otc-text { font-family: monospace; font-size: 18px; color: #fff; background: #334155; padding: 2px 6px; border-radius: 4px; letter-spacing: 2px; }
    .nutrition-summary { margin-top: 12px; padding-top: 12px; border-top: 1px solid #334155; font-size: 13px; color: #cbd5e1; }
    .empty { text-align: center; padding: 80px 0; }
    .vendor-info { margin-top: 12px; font-size: 12px; color: #64748b; margin-bottom: 12px; }
    .rating-section { margin-top: 16px; padding-top: 16px; border-top: 1px dashed rgba(255,255,255,0.1); }
    .rating-header { font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-weight: 500; }
    .stars { display: flex; gap: 4px; margin-bottom: 12px; }
    .stars mat-icon { color: #334155; cursor: pointer; transition: transform 0.2s; }
    .stars mat-icon.active { color: #facc15; }
    .stars mat-icon:hover { transform: scale(1.2); }
    .rating-input { display: flex; gap: 8px; align-items: center; }
    .rating-input mat-form-field { flex: 1; }
    ::ng-deep .rating-input .mat-mdc-form-field-flex { height: 40px !important; align-items: center !important; }
  `]
})
export class EmployeeOrdersComponent implements OnInit {
  orders: Order[] = [];
  streak?: number;
  loading = true;
  ratings: { [orderId: number]: number } = {};
  comments: { [orderId: number]: string } = {};

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.currentUser;
    if (!user) return;

    this.employeeService.getMyOrders(user.userId).subscribe({
      next: (orders: Order[]) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.employeeService.getMyStreak(user.userId).subscribe({
      next: (data: StreakData) => {
        this.streak = data.streak;
      }
    });
  }

  setRating(order: any, star: number) {
    this.ratings[order.id] = star;
  }

  submitRating(order: any) {
    const rating = this.ratings[order.id];
    if (!rating) return;

    this.employeeService.rateFoodItem({
      foodItemId: order.foodItem.id,
      orderId: order.id,
      rating: rating,
      comment: this.comments[order.id]
    }).subscribe({
      next: (savedRating: any) => {
        this.snackBar.open('Thank you for your rating!', 'OK', { duration: 3000, panelClass: 'snack-success' });
        // Update local order to reflect it's now rated
        order.rating = savedRating;
        // Clear temp state
        delete this.ratings[order.id];
        delete this.comments[order.id];
      },
      error: () => {
        this.snackBar.open('Error submitting rating.', 'OK', { duration: 3000, panelClass: 'snack-error' });
      }
    });
  }
}
