import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoodItem } from '../models/models';

export interface CartItem {
  id: number;
  foodItem: FoodItem;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private base = 'http://localhost:8080/api/employee/cart';

  constructor(private http: HttpClient) {}

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.base);
  }

  addToCart(foodId: number): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.base}/add/${foodId}`, {});
  }

  updateQuantity(foodId: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.base}/update/${foodId}?quantity=${quantity}`, {});
  }

  removeFromCart(foodId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/remove/${foodId}`);
  }

  checkout(paymentMethod: string): Observable<any> {
    return this.http.post(`${this.base}/checkout`, { paymentMethod });
  }
}
