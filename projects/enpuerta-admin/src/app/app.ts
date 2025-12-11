import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  showLayout = true;
  pageTitle = 'Admin';

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showLayout = !event.url.includes('/login');
      this.updatePageTitle(event.url);
    });
  }

  private updatePageTitle(url: string) {
    if (url.includes('/events') && !url.includes('/functions')) {
      this.pageTitle = 'Eventos';
    } else if (url.includes('/functions') && url.includes('/bookings')) {
      this.pageTitle = 'Reservas';
    } else if (url.includes('/functions') && url.includes('/live')) {
      this.pageTitle = 'Vista en Vivo';
    } else if (url.includes('/functions')) {
      this.pageTitle = 'Funciones';
    } else {
      this.pageTitle = 'Admin';
    }
  }
}
