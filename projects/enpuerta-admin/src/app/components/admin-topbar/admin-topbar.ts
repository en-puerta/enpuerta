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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.userEmail$ = this.authService.currentUser$.pipe(
      map(user => user?.email || null)
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
