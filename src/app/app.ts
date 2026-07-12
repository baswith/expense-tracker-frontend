import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToastComponent } from './components/toast/toast.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, SidebarComponent, ToastComponent, ProfileComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  isLoggedIn = false;
  sidebarOpen = true;
  profileOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoggedIn = this.auth.isLoggedIn();
      this.profileOpen = false;
    });
  }

  onToggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openProfile() {
    this.profileOpen = true;
  }

  closeProfile() {
    this.profileOpen = false;
  }
}
