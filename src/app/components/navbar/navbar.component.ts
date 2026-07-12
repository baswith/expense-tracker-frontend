import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openProfile = new EventEmitter<void>();

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.auth.fetchProfile().subscribe();
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get userInitial(): string {
    const user = this.auth.getUser();
    return user ? user.charAt(0).toUpperCase() : 'U';
  }

  get userEmail(): string {
    return this.auth.getUser() || 'User';
  }
}
