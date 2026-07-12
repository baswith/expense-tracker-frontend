import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';
  loading = false;

  loginForm = { email: '', password: '' };
  registerForm = { email: '', password: '', confirmPassword: '', name: '', currency: 'USD' };

  currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'];

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
  }

  onLogin() {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.toast.error('Please fill in all fields.');
      return;
    }
    this.loading = true;
    this.auth.login(this.loginForm).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }

  onRegister() {
    if (!this.registerForm.email || !this.registerForm.password) {
      this.toast.error('Please fill in all fields.');
      return;
    }
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.toast.error('Passwords do not match.');
      return;
    }
    if (this.registerForm.password.length < 6) {
      this.toast.error('Password must be at least 6 characters.');
      return;
    }
    this.loading = true;
    this.auth.register({ 
      email: this.registerForm.email, 
      password: this.registerForm.password,
      name: this.registerForm.name,
      currency: this.registerForm.currency
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success(res.message + ' — You can now log in.');
        this.activeTab = 'login';
        this.loginForm.email = this.registerForm.email;
        this.registerForm = { email: '', password: '', confirmPassword: '', name: '', currency: 'USD' };
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Registration failed.');
      }
    });
  }
}
