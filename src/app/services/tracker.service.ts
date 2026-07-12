import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

const API = 'http://localhost:3000/api';

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  expenseType: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  date: string;
  createdAt?: string;
}

export interface TransactionPayload {
  amount: number;
  expenseType: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  date: string;
}

export interface DashboardData {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransactions: number;
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
  recentTransactions: Transaction[];
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class TrackerService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  addExpense(payload: TransactionPayload): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(
      `${API}/add-expense`,
      payload,
      { headers: this.headers() }
    );
  }

  addIncome(payload: TransactionPayload): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(
      `${API}/add-income`,
      payload,
      { headers: this.headers() }
    );
  }

  getExpenses(month?: string, category?: string): Observable<ApiResponse<Transaction[]>> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<Transaction[]>>(
      `${API}/get-expenses`,
      { headers: this.headers(), params }
    );
  }

  getIncome(month?: string, category?: string): Observable<ApiResponse<Transaction[]>> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (category) params = params.set('category', category);
    return this.http.get<ApiResponse<Transaction[]>>(
      `${API}/get-income`,
      { headers: this.headers(), params }
    );
  }

  getDashboard(month: string, year: number, limit = 5): Observable<DashboardData> {
    let params = new HttpParams()
      .set('year', year)
      .set('limit', limit);

    if (month) params = params.set('month', month);

    return this.http.get<ApiResponse<DashboardData> | DashboardData>(
      `${API}/dashboard`,
      { headers: this.headers(), params }
    ).pipe(
      map((res) => 'data' in res ? res.data : res)
    );
  }

  updateItem(id: string, payload: TransactionPayload): Observable<ApiResponse<Transaction>> {
    return this.http.put<ApiResponse<Transaction>>(
      `${API}/update-item/${id}`,
      payload,
      { headers: this.headers() }
    );
  }

  deleteItem(id: string): Observable<ApiResponse<Transaction>> {
    return this.http.delete<ApiResponse<Transaction>>(
      `${API}/delete-item/${id}`,
      { headers: this.headers() }
    );
  }

  getSingleItem(id: string): Observable<ApiResponse<Transaction>> {
    return this.http.get<ApiResponse<Transaction>>(
      `${API}/item/${id}`,
      { headers: this.headers() }
    );
  }
}

