import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatCardModule, MatDividerModule, MatRadioModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Your Food Cart 🛒</h1>
        <p *ngIf="items.length > 0">You have {{ items.length }} unique items in your cart</p>
      </div>

      <div class="cart-layout" *ngIf="items.length > 0; else emptyCart">
        <!-- Cart Items List -->
        <div class="cart-items">
          <mat-card class="item-card" *ngFor="let item of items">
            <div class="item-info">
              <div class="item-details">
                <div class="item-name">{{ item.foodItem.name }}</div>
                <div class="item-vendor">by {{ item.foodItem.vendor?.fullName || item.foodItem.vendor?.username || 'Unknown Vendor' }}</div>
              </div>
              <div class="item-price">₹{{ item.foodItem.price }} each</div>
            </div>
            
            <div class="item-actions">
              <div class="qty-control">
                <button mat-icon-button (click)="updateQty(item, item.quantity - 1)" [disabled]="item.quantity <= 1">
                  <mat-icon>remove_circle_outline</mat-icon>
                </button>
                <span class="qty">{{ item.quantity }}</span>
                <button mat-icon-button (click)="updateQty(item, item.quantity + 1)">
                  <mat-icon>add_circle_outline</mat-icon>
                </button>
              </div>
              <div class="total-price">₹{{ item.foodItem.price * item.quantity | number:'1.2-2' }}</div>
              <button mat-icon-button color="warn" (click)="removeItem(item)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-card>
        </div>

        <!-- Checkout Section -->
        <div class="checkout-section">
          <mat-card class="summary-card">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₹{{ subtotal | number:'1.2-2' }}</span>
            </div>
            <mat-divider style="margin: 16px 0"></mat-divider>
            <div class="summary-row total">
              <span>Total Amount</span>
              <span>₹{{ subtotal | number:'1.2-2' }}</span>
            </div>

            <div class="payment-gateway">
              <h3>Secure Payment Gateway 💳</h3>
              <p>Select your payment method:</p>
              <mat-radio-group [(ngModel)]="paymentMethod" class="payment-options">
                <mat-radio-button value="UPI">UPI / GPay / PhonePe</mat-radio-button>
                <mat-radio-button value="CARD">Credit / Debit Card</mat-radio-button>
                <mat-radio-button value="WALLET">Canteen Wallet</mat-radio-button>
              </mat-radio-group>
            </div>

            <button mat-raised-button color="primary" class="checkout-btn" 
                    [disabled]="!paymentMethod || processing" (click)="checkout()">
              {{ processing ? 'Processing...' : 'Pay & Place Order' }}
            </button>
          </mat-card>
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="empty-state">
          <mat-icon class="huge-icon">shopping_cart</mat-icon>
          <h2>Your cart is empty</h2>
          <p>Go back to the menu and add some delicious food!</p>
          <button mat-raised-button color="primary" (click)="goToMenu()" style="margin-top: 24px">
            Explore Menu
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .cart-layout { display: grid; grid-template-columns: 1fr 350px; gap: 24px; }
    .cart-items { display: flex; flex-direction: column; gap: 16px; }
    .item-card { padding: 16px; background: #1e293b; border: 1px solid rgba(99,102,241,0.1); }
    .item-info { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .item-name { font-size: 18px; font-weight: 600; color: #f1f5f9; }
    .item-vendor { font-size: 14px; color: #94a3b8; }
    .item-price { font-weight: 500; color: #818cf8; }
    .item-actions { display: flex; justify-content: space-between; align-items: center; }
    .qty-control { display: flex; align-items: center; gap: 12px; background: #0f172a; border-radius: 8px; padding: 4px; }
    .qty { font-weight: 600; min-width: 24px; text-align: center; }
    .total-price { font-size: 18px; font-weight: 700; color: #10b981; }
    
    .checkout-section { position: sticky; top: 24px; }
    .summary-card { padding: 24px; background: #1e293b; border: 1px solid rgba(99,102,241,0.2); }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #94a3b8; }
    .total { color: #f1f5f9; font-size: 20px; font-weight: 700; }
    .payment-gateway { margin-top: 24px; padding: 16px; background: #0f172a; border-radius: 12px; border: 1px dashed #6366f1; }
    .payment-gateway h3 { color: #818cf8; font-size: 16px; margin-bottom: 12px; }
    .payment-options { display: flex; flex-direction: column; gap: 8px; }
    .checkout-btn { width: 100%; margin-top: 24px; height: 48px; font-size: 16px; font-weight: 600; }
    
    .empty-state { text-align: center; padding: 80px 0; color: #64748b; }
    .huge-icon { font-size: 80px; width: 80px; height: 80px; margin-bottom: 24px; color: #334155; }
    
    @media (max-width: 768px) {
      .cart-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  paymentMethod: string = '';
  processing = false;

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (items) => this.items = items,
      error: () => this.snack('Error loading cart')
    });
  }

  get subtotal() {
    return this.items.reduce((acc, item) => acc + (item.foodItem.price * item.quantity), 0);
  }

  updateQty(item: CartItem, newQty: number) {
    if (newQty < 1) return;
    this.cartService.updateQuantity(item.foodItem.id!, newQty).subscribe({
      next: () => this.loadCart(),
      error: () => this.snack('Error updating quantity')
    });
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.foodItem.id!).subscribe({
      next: () => this.loadCart(),
      error: () => this.snack('Error removing item')
    });
  }

  checkout() {
    if (!this.paymentMethod) return;
    this.processing = true;
    
    // Simulate payment delay
    setTimeout(() => {
      this.cartService.checkout(this.paymentMethod).subscribe({
        next: (resp) => {
          this.processing = false;
          this.snackBar.open('Payment Successful! Orders placed.', 'View Orders', { duration: 5000 })
            .onAction().subscribe(() => this.router.navigate(['/employee/orders']));
          this.router.navigate(['/employee/orders']);
        },
        error: (err) => {
          this.processing = false;
          this.snack(err.error || 'Payment failed. Please try again.');
        }
      });
    }, 1500);
  }

  goToMenu() {
    this.router.navigate(['/employee/menu']);
  }

  private snack(msg: string) {
    this.snackBar.open(msg, 'OK', { duration: 3000 });
  }
}
