import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @Input() drawerMode = false;
  @Output() closeProfile = new EventEmitter<void>();

  loading = false;
  loadingData = true;

  email = '';
  name = '';
  currency = 'USD';

  currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'];

  constructor(private auth: AuthService, private toast: ToastService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loadingData = true;
    this.auth.fetchProfile().subscribe({
      next: (res) => {
        this.email = res.email;
        this.name = res.name;
        this.currency = res.currency;
        this.loadingData = false;
      },
      error: () => {
        this.toast.error('Failed to load profile data.');
        this.loadingData = false;
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.auth.updateProfile({ name: this.name, currency: this.currency }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Profile updated successfully!');
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Failed to update profile.');
      }
    });
  }

  onCancel() {
    this.closeProfile.emit();
  }
}

