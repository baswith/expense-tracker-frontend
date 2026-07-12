import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackerService, TransactionPayload } from '../../services/tracker.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

type Mode = 'expense' | 'income' | 'edit';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.scss'
})
export class AddTransactionComponent implements OnInit {
  mode: Mode = 'expense';
  editId: string | null = null;
  loading = false;
  loadingData = false;
  customCategory = '';

  expenseCategories = [
    'Food', 'Transport', 'Shopping', 'Entertainment',
    'Health', 'Education', 'Utilities', 'Rent', 'Other'
  ];

  incomeCategories = [
    'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'
  ];

  form: TransactionPayload = {
    amount: 0,
    expenseType: 'EXPENSE',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tracker: TrackerService,
    private toast: ToastService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const paramMode = this.route.snapshot.paramMap.get('mode');
    const id = this.route.snapshot.paramMap.get('id');

    if (paramMode === 'income') {
      this.mode = 'income';
      this.form.expenseType = 'INCOME';
    } else if (paramMode === 'edit' && id) {
      this.mode = 'edit';
      this.editId = id;
      this.loadItem(id);
    } else {
      this.mode = 'expense';
      this.form.expenseType = 'EXPENSE';
    }
  }

  loadItem(id: string) {
    this.loadingData = true;
    this.tracker.getSingleItem(id).subscribe({
      next: (res) => {
        const d = res.data;
        const categories = d.expenseType === 'INCOME' ? this.incomeCategories : this.expenseCategories;
        const isKnownCategory = categories.includes(d.category);

        this.form = {
          amount: d.amount,
          expenseType: d.expenseType,
          category: isKnownCategory ? d.category : 'Other',
          description: d.description,
          date: new Date(d.date).toISOString().split('T')[0]
        };
        this.customCategory = isKnownCategory ? '' : d.category;
        this.mode = d.expenseType === 'INCOME' ? 'income' : 'expense';
        this.loadingData = false;
      },
      error: () => {
        this.toast.error('Could not load transaction.');
        this.loadingData = false;
      }
    });
  }

  get categories(): string[] {
    return this.form.expenseType === 'INCOME' ? this.incomeCategories : this.expenseCategories;
  }

  get pageTitle(): string {
    if (this.editId) return 'Edit Transaction';
    return this.form.expenseType === 'INCOME' ? 'Add Income' : 'Add Expense';
  }

  get usesCustomCategory(): boolean {
    return this.form.category === 'Other';
  }

  toggleType(type: 'INCOME' | 'EXPENSE') {
    this.form.expenseType = type;
    this.form.category = '';
    this.customCategory = '';
  }

  selectCategory(category: string) {
    this.form.category = category;
    if (category !== 'Other') {
      this.customCategory = '';
    }
  }

  onSubmit() {
    const category = this.usesCustomCategory ? this.customCategory.trim() : this.form.category;

    if (!this.form.amount || this.form.amount <= 0) {
      this.toast.error('Please enter a valid amount greater than 0.');
      return;
    }
    if (!this.form.category) {
      this.toast.error('Please select a category.');
      return;
    }
    if (!category) {
      this.toast.error('Please enter a category name.');
      return;
    }
    if (!this.form.date) {
      this.toast.error('Please select a date.');
      return;
    }

    this.loading = true;
    const payload: TransactionPayload = {
      ...this.form,
      category,
      date: new Date(this.form.date).toISOString()
    };

    const obs = this.editId
      ? this.tracker.updateItem(this.editId, payload)
      : this.form.expenseType === 'INCOME'
        ? this.tracker.addIncome(payload)
        : this.tracker.addExpense(payload);

    obs.subscribe({
      next: () => {
        this.loading = false;
        const msg = this.editId
          ? 'Transaction updated successfully!'
          : `${this.form.expenseType === 'INCOME' ? 'Income' : 'Expense'} added successfully!`;
        this.toast.success(msg);
        setTimeout(() => this.router.navigate(['/transactions']), 1000);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Something went wrong. Please try again.');
      }
    });
  }
}
