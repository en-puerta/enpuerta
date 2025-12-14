import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-not-found',
    standalone: false,
    templateUrl: './admin-not-found.html',
    styleUrl: './admin-not-found.scss'
})
export class AdminNotFound {
    constructor(private router: Router) { }

    goHome() {
        this.router.navigate(['/events']);
    }
}
