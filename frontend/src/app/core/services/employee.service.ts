import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoodItem, HealthGoal } from '../models/models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private base = 'http://localhost:8080/api/employee';
  private publicBase = 'http://localhost:8080/api/public';

  constructor(private http: HttpClient) {}

  getMyHealthGoal(): Observable<HealthGoal> {
    return this.http.get<HealthGoal>(`${this.base}/health-goal`);
  }

  setHealthGoal(goal: HealthGoal): Observable<HealthGoal> {
    return this.http.post<HealthGoal>(`${this.base}/health-goal`, goal);
  }

  getRecommendations(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.base}/recommendations`);
  }

  getAllActiveFoodItems(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.publicBase}/food-items`);
  }

  placeOrder(employeeId: number, foodItemId: number): Observable<any> {
    return this.http.post(`${this.base}/${employeeId}/order/${foodItemId}`, {});
  }

  getMyOrders(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${employeeId}/orders`);
  }

  getMyStreak(employeeId: number): Observable<{ streak: number }> {
    return this.http.get<{ streak: number }>(`${this.base}/${employeeId}/streak`);
  }

  rateFoodItem(data: { foodItemId: number; orderId: number; rating: number; comment?: string }): Observable<any> {
    return this.http.post(`${this.base}/rate`, data);
  }
}
