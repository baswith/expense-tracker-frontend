import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrackerService, Transaction } from '../../services/tracker.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

type Tab = 'all' | 'income' | 'expense';

interface TransactionDateGroup {
  dateKey: string;
  dateLabel: string;
  transactions: Transaction[];
}

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
  selectedCategory = '';

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

  onCategoryChange() {}

  get categoryOptions(): string[] {
    const categories = [...this.income, ...this.expenses]
      .map(t => t.category)
      .filter(Boolean);
    return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b));
  }

  setTab(tab: Tab) { this.activeTab = tab; }

  get filteredTransactions(): Transaction[] {
    return this.getTransactionsForTab(this.activeTab)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  get filteredIncome(): Transaction[] {
    return this.filterByCategory(this.income);
  }

  get filteredExpenses(): Transaction[] {
    return this.filterByCategory(this.expenses);
  }

  get totalFilteredIncome(): number {
    return this.filteredIncome.reduce((s, t) => s + t.amount, 0);
  }

  get totalFilteredExpenses(): number {
    return this.filteredExpenses.reduce((s, t) => s + t.amount, 0);
  }

  countForTab(tab: Tab): number {
    return this.getTransactionsForTab(tab).length;
  }

  private getTransactionsForTab(tab: Tab): Transaction[] {
    if (tab === 'all') return this.filterByCategory([...this.income, ...this.expenses]);
    if (tab === 'income') return this.filterByCategory(this.income);
    return this.filterByCategory(this.expenses);
  }

  private filterByCategory(transactions: Transaction[]): Transaction[] {
    if (!this.selectedCategory) return [...transactions];
    return transactions.filter(t => t.category === this.selectedCategory);
  }

  get groupedTransactions(): TransactionDateGroup[] {
    const groups = new Map<string, Transaction[]>();

    for (const transaction of this.filteredTransactions) {
      const date = new Date(transaction.date);
      const dateKey = date.toDateString();
      const transactions = groups.get(dateKey) || [];
      transactions.push(transaction);
      groups.set(dateKey, transactions);
    }

    return Array.from(groups.entries()).map(([dateKey, transactions]) => ({
      dateKey,
      dateLabel: this.formatDateGroup(transactions[0].date),
      transactions
    }));
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
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatDateGroup(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}







