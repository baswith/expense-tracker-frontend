import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardData, TrackerService, Transaction } from '../../services/tracker.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboard: DashboardData = this.emptyDashboard();
  loading = true;
  selectedMonth = '';
  selectedYear = new Date().getFullYear();

  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  constructor(public auth: AuthService, private tracker: TrackerService) {}

  ngOnInit() {
    this.selectedMonth = this.months[new Date().getMonth()];
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.tracker.getDashboard(this.selectedMonth, this.selectedYear, 5).subscribe({
      next: (res) => {
        this.dashboard = res || this.emptyDashboard();
        this.loading = false;
      },
      error: () => {
        this.dashboard = this.emptyDashboard();
        this.loading = false;
      }
    });
  }

  onMonthChange() { this.loadData(); }

  get income(): Transaction[] {
    return this.dashboard.incomeTransactions || [];
  }

  get expenses(): Transaction[] {
    return this.dashboard.expenseTransactions || [];
  }

  get totalIncome(): number {
    return this.dashboard.totalIncome || 0;
  }

  get totalExpenses(): number {
    return this.dashboard.totalExpenses || 0;
  }

  get balance(): number {
    return this.dashboard.netBalance || 0;
  }

  get totalTransactions(): number {
    return this.dashboard.totalTransactions || 0;
  }

  get savingsRate(): number {
    if (this.totalIncome === 0) return 0;
    return Math.max(0, Math.round((this.balance / this.totalIncome) * 100));
  }

  get spendingPercent(): number {
    if (this.totalIncome === 0) return 0;
    return Math.min((this.totalExpenses / this.totalIncome) * 100, 100);
  }

  get recentTransactions(): Transaction[] {
    return this.dashboard.recentTransactions || [];
  }

  get userName(): string {
    return this.auth.getUser()?.split('@')[0] || 'there';
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  formatCurrency(amount: number): string {
    const currency = this.auth.getCurrency();
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private emptyDashboard(): DashboardData {
    return {
      netBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalTransactions: 0,
      incomeTransactions: [],
      expenseTransactions: [],
      recentTransactions: []
    };
  }
}



