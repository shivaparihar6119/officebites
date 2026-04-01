import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { FoodItem } from '../../../core/models/models';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Canteen Menu 📋</h1>
        <p *ngIf="!selectedVendor">Select a vendor to view their delicious offerings</p>
        <p *ngIf="selectedVendor">Viewing menu for {{ selectedVendor.fullName || selectedVendor.username }}</p>
      </div>

      <!-- Floating Cart Button -->
      <button mat-fab color="accent" class="cart-fab" (click)="goToCart()">
        <mat-icon>shopping_cart</mat-icon>
      </button>

      <!-- Vendor List View -->
      <div *ngIf="!selectedVendor">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input [(ngModel)]="vendorSearchTerm" placeholder="Search vendors..." (input)="filterVendors()">
        </div>

        <div class="food-grid" *ngIf="filteredVendors.length">
          <div class="vendor-card" *ngFor="let vendor of filteredVendors" (click)="selectVendor(vendor)">
            <div class="vendor-icon">🏪</div>
            <div class="vendor-name">{{ vendor.fullName || vendor.username }}</div>
            <button mat-flat-button color="primary" class="mt-3">View Menu</button>
          </div>
        </div>

        <div class="empty" *ngIf="!filteredVendors.length && !loading">
          <span style="font-size:48px">🏪</span>
          <p style="color:#64748b;margin-top:12px">{{ vendorSearchTerm ? 'No vendors match your search' : 'No vendors available yet' }}</p>
        </div>
      </div>

      <!-- Menu Items View (Selected Vendor) -->
      <div *ngIf="selectedVendor">
        <button mat-button (click)="clearVendorSelection()" class="back-btn"><mat-icon>arrow_back</mat-icon> Back to Vendors</button>
        
        <div class="search-box" style="margin-top: 16px;">
          <mat-icon>search</mat-icon>
          <input [(ngModel)]="itemSearchTerm" placeholder="Search dishes..." (input)="filterItems()">
        </div>

        <!-- Recommended Items -->
        <div *ngIf="filteredRecommendedItems.length > 0">
          <h2 class="section-title">🌟 Recommended for You</h2>
          <div class="food-grid">
            <div class="food-card recommended-card" *ngFor="let item of filteredRecommendedItems">
              <div class="recommended-badge">Recommended</div>
              <div class="food-name">{{ item.name }}</div>
              <div class="rating-badge" *ngIf="item.averageRating && item.averageRating > 0">
                <mat-icon>star</mat-icon>
                <span>{{ item.averageRating | number:'1.1-1' }}</span>
              </div>
              <div class="food-description">{{ item.description }}</div>
              <div class="food-price">₹{{ item.price }}</div>
              <div class="nutrition-grid">
                <div class="nutrition-item"><div class="n-value">{{ item.calories | number:'1.0-2' }}</div><div class="n-label">Calories</div></div>
                <div class="nutrition-item"><div class="n-value">{{ item.protein | number:'1.0-2' }}g</div><div class="n-label">Protein</div></div>
                <div class="nutrition-item"><div class="n-value">{{ item.carbohydrates | number:'1.0-2' }}g</div><div class="n-label">Carbs</div></div>
                <div class="nutrition-item"><div class="n-value">{{ item.fats | number:'1.0-2' }}g</div><div class="n-label">Fats</div></div>
              </div>
              
              <div class="cart-controls" style="margin-top: 16px;">
                <button *ngIf="!getQuantity(item.id!)" mat-raised-button color="primary" style="width: 100%" (click)="addToCart(item)">
                  <mat-icon style="margin-right: 8px">add_shopping_cart</mat-icon> Add to Cart
                </button>
                <div *ngIf="getQuantity(item.id!)" class="qty-control-row">
                  <button mat-icon-button (click)="updateQuantity(item, getQuantity(item.id!) - 1)">
                    <mat-icon>remove_circle_outline</mat-icon>
                  </button>
                  <span class="qty">{{ getQuantity(item.id!) }}</span>
                  <button mat-icon-button (click)="updateQuantity(item, getQuantity(item.id!) + 1)">
                    <mat-icon>add_circle_outline</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Items -->
        <div *ngIf="filteredOtherItems.length > 0" [ngStyle]="{'margin-top': filteredRecommendedItems.length > 0 ? '32px' : '0'}">
          <h2 class="section-title" *ngIf="filteredRecommendedItems.length > 0">🍽️ Other Menu Items</h2>
          <div class="food-grid">
            <div class="food-card" *ngFor="let item of filteredOtherItems">
              <div class="food-name">{{ item.name }}</div>
              <div class="rating-badge" *ngIf="item.averageRating && item.averageRating > 0">
                <mat-icon>star</mat-icon>
                <span>{{ item.averageRating | number:'1.1-1' }}</span>
              </div>
              <div class="food-description">{{ item.description }}</div>
              <div class="food-price">₹{{ item.price }}</div>
              <div class="nutrition-grid">
                <div class="nutrition-item"><div class="n-value">{{ item.calories | number:'1.0-2' }}</div><div class="n-label">Calories</div></div>
                <div class="nutrition-item"><div class="n-value">{{ item.protein | number:'1.0-2' }}g</div><div class="n-label">Protein</div></div>
                <div class="nutrition-item"><div class="n-value">{{ item.carbohydrates | number:'1.0-2' }}g</div><div class="n-label">Carbs</div></div>
                <div class="nutrition-item"><div class="n-value">{{ item.fats | number:'1.0-2' }}g</div><div class="n-label">Fats</div></div>
              </div>

              <div class="cart-controls" style="margin-top: 16px;">
                <button *ngIf="!getQuantity(item.id!)" mat-raised-button color="primary" style="width: 100%" (click)="addToCart(item)">
                  <mat-icon style="margin-right: 8px">add_shopping_cart</mat-icon> Add to Cart
                </button>
                <div *ngIf="getQuantity(item.id!)" class="qty-control-row">
                  <button mat-icon-button (click)="updateQuantity(item, getQuantity(item.id!) - 1)">
                    <mat-icon>remove_circle_outline</mat-icon>
                  </button>
                  <span class="qty">{{ getQuantity(item.id!) }}</span>
                  <button mat-icon-button (click)="updateQuantity(item, getQuantity(item.id!) + 1)">
                    <mat-icon>add_circle_outline</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="empty" *ngIf="!filteredRecommendedItems.length && !filteredOtherItems.length && !loading">
          <span style="font-size:48px">🍽️</span>
          <p style="color:#64748b;margin-top:12px">{{ itemSearchTerm ? 'No dishes match your search' : 'No food items available for this vendor' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-box {
      display: flex; align-items: center; gap: 12px;
      background: #1e293b; border: 1px solid rgba(99,102,241,0.2);
      border-radius: 12px; padding: 12px 16px; margin-bottom: 24px;
      mat-icon { color: #64748b; }
      input { background: none; border: none; outline: none; color: #f1f5f9; font-size: 15px; width: 100%; flex: 1; }
    }
    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .vendor-card { 
      background: #1e293b; border-radius: 16px; padding: 24px; text-align: center; 
      cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid transparent;
    }
    .vendor-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); border-color: rgba(99,102,241,0.5); }
    .vendor-icon { font-size: 48px; margin-bottom: 16px; }
    .vendor-name { font-size: 20px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
    .mt-3 { margin-top: 12px; }
    .section-title { font-size: 20px; font-weight: 600; color: #f1f5f9; margin-bottom: 16px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
    .back-btn { color: #818cf8; margin-bottom: 8px; margin-left: -16px; }
    .recommended-card { border: 1px solid #eab308; position: relative; overflow: hidden; }
    .recommended-badge { 
      position: absolute; top: 12px; right: -28px; background: #eab308; color: #422006; 
      font-size: 10px; font-weight: bold; padding: 4px 32px; transform: rotate(45deg); 
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .empty { text-align: center; padding: 80px 0; }
    .cart-fab { position: fixed; bottom: 32px; right: 32px; z-index: 100; box-shadow: 0 8px 32px rgba(99,102,241,0.5); }
    
    .qty-control-row {
      display: flex; align-items: center; justify-content: space-between;
      background: #0f172a; border-radius: 12px; padding: 4px 8px; 
      border: 1px solid rgba(99,102,241,0.3);
    }
    .qty { font-weight: 700; color: #818cf8; font-size: 16px; }
    .rating-badge { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
    .rating-badge mat-icon { font-size: 16px; width: 16px; height: 16px; color: #facc15; }
    .rating-badge span { font-size: 13px; font-weight: 600; color: #facc15; }
  `]
})
export class MenuComponent implements OnInit {
  allItems: FoodItem[] = [];
  recommendedItemIds: Set<number> = new Set();
  cartQuantities: Map<number, number> = new Map();
  
  vendors: any[] = [];
  filteredVendors: any[] = [];
  vendorSearchTerm = '';
  
  selectedVendor: any = null;
  recommendedVendorItems: FoodItem[] = [];
  otherVendorItems: FoodItem[] = [];
  filteredRecommendedItems: FoodItem[] = [];
  filteredOtherItems: FoodItem[] = [];
  itemSearchTerm = '';
  
  loading = true;

  constructor(
    private employeeService: EmployeeService, 
    private cartService: CartService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.refreshCart();
    
    forkJoin({
      allItems: this.employeeService.getAllActiveFoodItems(),
      recommendedItems: this.employeeService.getRecommendations()
    }).subscribe({
      next: (result) => {
        this.allItems = result.allItems || [];
        this.recommendedItemIds = new Set((result.recommendedItems || []).map(item => item.id!));
        
        const vendorMap = new Map();
        this.allItems.forEach(item => {
          if (item.vendor && item.vendor.id) {
            if (!vendorMap.has(item.vendor.id)) {
              vendorMap.set(item.vendor.id, item.vendor);
            }
          }
        });
        this.vendors = Array.from(vendorMap.values());
        this.filteredVendors = [...this.vendors];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error loading menu data.', 'OK', { duration: 3000, panelClass: 'snack-error' });
      }
    });
  }

  refreshCart() {
    this.cartService.getCart().subscribe({
      next: (items) => {
        this.cartQuantities.clear();
        items.forEach(i => this.cartQuantities.set(i.foodItem.id!, i.quantity));
      }
    });
  }

  getQuantity(itemId: number): number {
    return this.cartQuantities.get(itemId) || 0;
  }

  updateQuantity(item: FoodItem, quantity: number) {
    if (quantity <= 0) {
      this.cartService.removeFromCart(item.id!).subscribe(() => this.refreshCart());
    } else {
      this.cartService.updateQuantity(item.id!, quantity).subscribe(() => this.refreshCart());
    }
  }

  filterVendors() {
    const term = this.vendorSearchTerm.toLowerCase();
    this.filteredVendors = this.vendors.filter(v =>
      (v.fullName && v.fullName.toLowerCase().includes(term)) ||
      (v.username && v.username.toLowerCase().includes(term))
    );
  }

  selectVendor(vendor: any) {
    this.selectedVendor = vendor;
    this.itemSearchTerm = '';
    
    const vendorItems = this.allItems.filter(item => item.vendor && item.vendor.id === vendor.id);
    
    this.recommendedVendorItems = vendorItems.filter(item => this.recommendedItemIds.has(item.id!));
    this.otherVendorItems = vendorItems.filter(item => !this.recommendedItemIds.has(item.id!));
    
    this.filteredRecommendedItems = [...this.recommendedVendorItems];
    this.filteredOtherItems = [...this.otherVendorItems];
  }

  clearVendorSelection() {
    this.selectedVendor = null;
    this.itemSearchTerm = '';
  }

  filterItems() {
    const term = this.itemSearchTerm.toLowerCase();
    
    this.filteredRecommendedItems = this.recommendedVendorItems.filter(i =>
      i.name.toLowerCase().includes(term) || (i.description && i.description.toLowerCase().includes(term))
    );
    
    this.filteredOtherItems = this.otherVendorItems.filter(i =>
      i.name.toLowerCase().includes(term) || (i.description && i.description.toLowerCase().includes(term))
    );
  }

  addToCart(item: FoodItem) {
    this.cartService.addToCart(item.id!).subscribe({
      next: () => {
        this.refreshCart();
        this.snackBar.open(`${item.name} added to cart!`, 'View Cart', { duration: 4000 })
          .onAction().subscribe(() => this.router.navigate(['/employee/cart']));
      },
      error: () => {
        this.snackBar.open('Error adding to cart.', 'OK', { duration: 3000, panelClass: 'snack-error' });
      }
    });
  }

  goToCart() {
    this.router.navigate(['/employee/cart']);
  }
}
