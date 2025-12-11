import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@enpuerta/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-topbar',
  standalone: false,
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.scss',
})
export class AdminTopbarComponent {
  @Input() pageTitle = '';

  userEmail$: Observable<string | null>;
  userName$: Observable<string | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.userEmail$ = this.authService.currentUser$.pipe(
      map(user => user?.email || null)
    );
    
    this.userName$ = this.authService.currentUser$.pipe(
      map(user => {
        if (!user?.email) return null;
        // Extract name from email (part before @)
        const name = user.email.split('@')[0];
        // Capitalize first letter
        return name.charAt(0).toUpperCase() + name.slice(1);
      })
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
