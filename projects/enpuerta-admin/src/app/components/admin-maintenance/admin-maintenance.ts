import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-maintenance',
    standalone: false,
    templateUrl: './admin-maintenance.html',
    styleUrl: './admin-maintenance.scss'
})
export class AdminMaintenance {
    // Estimated time when maintenance will be complete
    estimatedTime = 'pronto';
}
