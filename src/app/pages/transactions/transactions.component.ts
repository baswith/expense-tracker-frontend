import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrackerService, Transaction } from '../../services/tracker.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

type Tab = 'all' | 'income' | 'expense';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  income: Transaction[] = [];
  expenses: Transaction[] = [];
  loading = true;
  deleting: string | null = null;
  transactionToDelete: Transaction | null = null;
  activeTab: Tab = 'all';
  selectedMonth = '';

  months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  constructor(private tracker: TrackerService, private toast: ToastService, private auth: AuthService) {}

  ngOnInit() {
    this.selectedMonth = this.months[new Date().getMonth()];
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.tracker.getIncome(this.selectedMonth).subscribe({
      next: (res) => {
        this.income = res.data || [];
        this.tracker.getExpenses(this.selectedMonth).subscribe({
          next: (res2) => {
            this.expenses = res2.data || [];
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  onMonthChange() { this.loadData(); }

  setTab(tab: Tab) { this.activeTab = tab; }

  get filteredTransactions(): Transaction[] {
    let list: Transaction[] = [];
    if (this.activeTab === 'all') list = [...this.income, ...this.expenses];
    else if (this.activeTab === 'income') list = this.income;
    else list = this.expenses;
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get totalIncome(): number { return this.income.reduce((s, t) => s + t.amount, 0); }
  get totalExpenses(): number { return this.expenses.reduce((s, t) => s + t.amount, 0); }

  openDeleteModal(transaction: Transaction) {
    this.transactionToDelete = transaction;
  }

  closeDeleteModal() {
    if (this.deleting) return;
    this.transactionToDelete = null;
  }

  confirmDelete() {
    if (!this.transactionToDelete) return;

    const id = this.transactionToDelete._id;
    this.deleting = id;
    this.tracker.deleteItem(id).subscribe({
      next: () => {
        this.income = this.income.filter(t => t._id !== id);
        this.expenses = this.expenses.filter(t => t._id !== id);
        this.deleting = null;
        this.transactionToDelete = null;
        this.toast.success('Transaction deleted.');
      },
      error: () => {
        this.deleting = null;
        this.toast.error('Failed to delete transaction.');
      }
    });
  }

  formatCurrency(amount: number): string {
    const currency = this.auth.getCurrency();
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
}



