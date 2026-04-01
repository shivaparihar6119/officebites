import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { FoodItem } from '../../../core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Recommended For You ✨</h1>
        <p>Food curated based on your health goal</p>
      </div>

      <div class="info-banner" *ngIf="!loading && !recommendedItems.length && !hasGoal()">
        <span class="banner-icon">💡</span>
        <div>
          <strong>No personal recommendations yet!</strong>
          <p>Set your health goal first to get personalized food picks.</p>
          <a mat-raised-button routerLink="/employee/health-goal" class="btn-primary-gradient" style="margin-top:12px">Set Health Goal</a>
        </div>
      </div>

      <h2 *ngIf="recommendedItems.length" style="color: #f1f5f9; margin-bottom: 16px;">Top Picks for You</h2>
      <div class="food-grid" *ngIf="recommendedItems.length">
        <div class="food-card rec-card" *ngFor="let item of recommendedItems">
          <div class="rec-badge">✨ Recommended</div>
          <div class="food-name">{{ item.name }}</div>
          <div class="food-description">{{ item.description }}</div>
          <div class="food-price">₹{{ item.price }}</div>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <div class="n-value">{{ item.calories | number:'1.0-2' }}</div>
              <div class="n-label">Calories</div>
            </div>
            <div class="nutrition-item">
              <div class="n-value">{{ item.protein | number:'1.0-2' }}g</div>
              <div class="n-label">Protein</div>
            </div>
            <div class="nutrition-item">
              <div class="n-value">{{ item.carbohydrates | number:'1.0-2' }}g</div>
              <div class="n-label">Carbs</div>
            </div>
            <div class="nutrition-item">
              <div class="n-value">{{ item.fats | number:'1.0-2' }}g</div>
              <div class="n-label">Fats</div>
            </div>
          </div>
          <div class="vendor-tag" *ngIf="item.vendor">
            🏪 {{ item.vendor.fullName || item.vendor.username }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-banner {
      display: flex; align-items: flex-start; gap: 20px;
      background: rgba(245,145,26,0.1); border: 1px solid rgba(245,145,26,0.3);
      border-radius: 16px; padding: 28px;
      .banner-icon { font-size: 36px; flex-shrink: 0; }
      strong { font-size: 16px; font-weight: 600; color: #f1f5f9; }
      p { color: #94a3b8; font-size: 14px; margin-top: 4px; }
    }
    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .rec-card { position: relative; border-color: rgba(245,145,26,0.4) !important; }
    .rec-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; background: linear-gradient(135deg,rgba(245,145,26,0.2),rgba(255,107,0,0.2));
      border: 1px solid rgba(245,145,26,0.4); border-radius: 20px;
      font-size: 11px; font-weight: 600; color: #F5911A; margin-bottom: 10px;
    }
    .vendor-tag { font-size: 12px; color: #64748b; margin-top: 12px; }
  `]
})
export class RecommendationsComponent implements OnInit {
  recommendedItems: FoodItem[] = [];
  otherItems: FoodItem[] = [];
  loading = true;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    forkJoin({
      recommendations: this.employeeService.getRecommendations(),
      all: this.employeeService.getAllActiveFoodItems()
    }).subscribe({
      next: (res) => {
        this.recommendedItems = res.recommendations || [];
        // Filter out recommended from all
        const recIds = new Set(this.recommendedItems.map(i => i.id));
        this.otherItems = (res.all || []).filter(i => !recIds.has(i.id));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  hasGoal() { return false; /* Handled effectively by checking endpoint but logic can be improved */ }
}
