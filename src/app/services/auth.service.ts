import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const API = 'http://localhost:3000/api';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { email: string; password: string; name?: string; currency?: string; }

export interface AuthResponse {
  message: string;
  user?: string;
  token?: string;
  id?: string;
  currency?: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/login`, payload).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', res.user || '');
          localStorage.setItem('userId', res.id || '');
          localStorage.setItem('currency', res.currency || 'USD');
          localStorage.setItem('name', res.name || '');
        }
      })
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/register`, payload);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('currency');
    localStorage.removeItem('name');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): string | null {
    return localStorage.getItem('user');
  }

  getName(): string {
    return localStorage.getItem('name') || '';
  }

  getCurrency(): string {
    return localStorage.getItem('currency') || 'USD';
  }

  fetchProfile(): Observable<{ email: string; name: string; currency: string }> {
    const headers = { 'Authorization': `Bearer ${this.getToken()}` };
    return this.http.get<{ email: string; name: string; currency: string }>(`${API}/profile`, { headers }).pipe(
      tap(res => {
        localStorage.setItem('currency', res.currency);
        localStorage.setItem('name', res.name);
      })
    );
  }

  updateProfile(profile: { name: string; currency: string }): Observable<any> {
    const headers = { 'Authorization': `Bearer ${this.getToken()}` };
    return this.http.put<{ name: string; currency: string }>(`${API}/profile`, profile, { headers }).pipe(
      tap((res: { name: string; currency: string }) => {
        localStorage.setItem('currency', res.currency);
        localStorage.setItem('name', res.name);
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
