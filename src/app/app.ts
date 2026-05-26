import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.services';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  currentUser = signal<string | null>(null);
  showSidebar = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Set initial state
    this.updateSidebarState();

    // Update sidebar on every navigation so it stays in sync
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateSidebarState());
  }

  private updateSidebarState(): void {
    const loggedIn = this.authService.isLoggedIn();
    this.showSidebar.set(loggedIn);
    if (loggedIn) {
      this.currentUser.set(localStorage.getItem('username'));
    }
  }

  logout(): void {
    this.authService.logout();
    this.showSidebar.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
