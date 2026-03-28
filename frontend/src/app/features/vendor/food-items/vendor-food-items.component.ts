import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { VendorService } from '../../../core/services/vendor.service';
import { FoodItem } from '../../../core/models/models';

@Component({
  selector: 'app-vendor-food-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatIconModule, MatSlideToggleModule, MatDialogModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>My Food Items</h1>
        <p>Add and manage your menu with nutritional values</p>
      </div>

      <!-- Add Food Item Form -->
      <div class="section-card" style="margin-bottom:32px">
        <h3>{{ editing ? 'Edit Food Item' : 'Add New Food Item' }}</h3>
        <form [formGroup]="foodForm" (ngSubmit)="save()" class="food-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Food Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Grilled Chicken Rice">
              <mat-error *ngIf="foodForm.get('name')?.hasError('required')">Name is required</mat-error>
              <mat-error *ngIf="foodForm.get('name')?.hasError('minlength') || foodForm.get('name')?.hasError('maxlength')">3-100 chars</mat-error>
              <mat-error *ngIf="foodForm.get('name')?.hasError('pattern')">Letters, numbers, spaces, - _ , & ( ) . ' / only</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Price (₹)</mat-label>
              <input matInput type="number" formControlName="price">
              <mat-error *ngIf="foodForm.get('price')?.hasError('required')">Price is required</mat-error>
              <mat-error *ngIf="foodForm.get('price')?.hasError('min')">Must be > 0</mat-error>
              <mat-error *ngIf="foodForm.get('price')?.hasError('max')">Max ₹9999</mat-error>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput rows="2" formControlName="description" placeholder="Describe your dish..."></textarea>
            <mat-error *ngIf="foodForm.get('description')?.hasError('maxlength')">Max 500 characters</mat-error>
          </mat-form-field>
          <p class="section-label">Nutritional Values (per serving)</p>
          <div class="form-row four">
            <mat-form-field appearance="outline">
              <mat-label>Calories (kcal)</mat-label>
              <input matInput type="number" formControlName="calories">
              <mat-error *ngIf="foodForm.get('calories')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="foodForm.get('calories')?.hasError('min') || foodForm.get('calories')?.hasError('max')">1-5000</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Protein (g)</mat-label>
              <input matInput type="number" step="0.1" formControlName="protein">
              <mat-error *ngIf="foodForm.get('protein')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="foodForm.get('protein')?.hasError('min') || foodForm.get('protein')?.hasError('max')">0-500</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Carbohydrates (g)</mat-label>
              <input matInput type="number" step="0.1" formControlName="carbohydrates">
              <mat-error *ngIf="foodForm.get('carbohydrates')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="foodForm.get('carbohydrates')?.hasError('min') || foodForm.get('carbohydrates')?.hasError('max')">0-500</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fats (g)</mat-label>
              <input matInput type="number" step="0.1" formControlName="fats">
              <mat-error *ngIf="foodForm.get('fats')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="foodForm.get('fats')?.hasError('min') || foodForm.get('fats')?.hasError('max')">0-500</mat-error>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <mat-slide-toggle formControlName="isActive" class="status-toggle" style="margin-right:auto">
              {{ foodForm.get('isActive')?.value ? 'Active' : 'Hidden' }}
            </mat-slide-toggle>
            <button mat-raised-button type="submit" class="btn-primary-gradient" [disabled]="foodForm.invalid">
              {{ editing ? 'Update Item' : 'Add Food Item' }}
            </button>
            <button mat-stroked-button type="button" *ngIf="editing" (click)="cancelEdit()">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Food Items Grid -->
      <div class="food-grid" *ngIf="items.length">
        <div class="food-card" *ngFor="let item of items">
          <div class="card-top">
            <div>
              <div class="food-name">{{ item.name }}</div>
              <div class="food-description">{{ item.description }}</div>
            </div>
            <span class="badge" [class.badge-success]="item.isActive" [class.badge-danger]="!item.isActive">
              {{ item.isActive ? 'Active' : 'Hidden' }}
            </span>
          </div>
          <div class="food-price">₹{{ item.price }}</div>
          <div class="nutrition-grid">
            <div class="nutrition-item"><div class="n-value">{{ item.calories }}</div><div class="n-label">Cal</div></div>
            <div class="nutrition-item"><div class="n-value">{{ item.protein }}g</div><div class="n-label">Protein</div></div>
            <div class="nutrition-item"><div class="n-value">{{ item.carbohydrates }}g</div><div class="n-label">Carbs</div></div>
            <div class="nutrition-item"><div class="n-value">{{ item.fats }}g</div><div class="n-label">Fats</div></div>
          </div>
          <div class="card-actions">
            <button mat-icon-button (click)="edit(item)" title="Edit"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="delete(item)" title="Delete"><mat-icon>delete</mat-icon></button>
          </div>
        </div>
      </div>
      <p *ngIf="!items.length" class="empty">No food items yet. Add your first item above!</p>
    </div>
  `,
  styles: [`
    .section-card { background: #1C1612; border: 1px solid rgba(245,145,26,0.2); border-radius: 16px; padding: 24px; }
    h3 { font-size: 16px; font-weight: 600; color: #F5F0E8; margin-bottom: 20px; }
    .section-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0 8px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; &.four { grid-template-columns: repeat(4, 1fr); } }
    .form-actions { display: flex; gap: 12px; align-items: center; margin-top: 4px; }
    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px; }
    .card-actions { display: flex; gap: 4px; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; }
    .status-toggle { color: #94a3b8; font-size: 13px; font-weight: 500; }
    .empty { color: #64748b; text-align: center; padding: 64px; }
  `]
})
export class VendorFoodItemsComponent implements OnInit {
  items: FoodItem[] = [];
  foodForm: FormGroup;
  editing: FoodItem | null = null;
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  constructor(private vendorService: VendorService, private fb: FormBuilder, 
              private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.foodForm = this.createForm();
  }

  createForm(item?: FoodItem): FormGroup {
    return this.fb.group({
      name: [item?.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9\s\-_,&().'/]+$/)]],
      description: [item?.description || '', [Validators.maxLength(500)]],
      price: [item?.price || '', [Validators.required, Validators.min(0.01), Validators.max(9999.99)]],
      calories: [item?.calories || '', [Validators.required, Validators.min(1), Validators.max(5000)]],
      protein: [item?.protein || '', [Validators.required, Validators.min(0), Validators.max(500)]],
      carbohydrates: [item?.carbohydrates || '', [Validators.required, Validators.min(0), Validators.max(500)]],
      fats: [item?.fats || '', [Validators.required, Validators.min(0), Validators.max(500)]],
      isActive: [item?.isActive ?? true]
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.vendorService.getMyFoodItems().subscribe({
      next: (i) => this.items = i,
      error: (err) => this.handleError(err, 'Error loading food items')
    });
  }

  handleError(err: any, defaultMsg: string) {
    let msg = defaultMsg;
    if (err.error) {
      if (typeof err.error === 'string') msg = err.error;
      else if (err.error.error) msg = err.error.error;
      else if (typeof err.error === 'object') {
        msg = Object.values(err.error).join('; ');
      }
    }
    this.snackBar.open(msg, 'OK', { duration: 5000, panelClass: 'snack-error' });
  }

  save() {
    if (this.foodForm.invalid) return;
    const value = this.foodForm.value;
    const call = this.editing
      ? this.vendorService.updateFoodItem(this.editing.id!, value)
      : this.vendorService.addFoodItem(value);
    call.subscribe({
      next: () => {
        this.snackBar.open(this.editing ? 'Item updated!' : 'Item added!', 'OK', { duration: 3000, panelClass: 'snack-success' });
        this.resetForm();
        this.load();
      },
      error: (err) => this.handleError(err, 'Error saving item')
    });
  }

  edit(item: FoodItem) {
    this.editing = item;
    this.foodForm = this.createForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() { this.resetForm(); }

  resetForm() {
    this.editing = null;
    if (this.formDirective) {
      this.formDirective.resetForm();
    }
    this.foodForm = this.createForm();
  }

  delete(item: FoodItem) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { 
        title: 'Delete Food Item', 
        message: `Are you sure you want to delete "${item.name}" from your menu?`,
        confirmText: 'Delete Forever'
      },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vendorService.deleteFoodItem(item.id!).subscribe({
          next: () => { 
            this.snackBar.open('Deleted!', 'OK', { duration: 2000, panelClass: 'snack-success' }); 
            this.load(); 
          },
          error: () => this.snackBar.open('Error deleting', 'OK', { duration: 2000, panelClass: 'snack-error' })
        });
      }
    });
  }
}
