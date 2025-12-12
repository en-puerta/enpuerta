import { Component } from '@angular/core';

@Component({
    selector: 'app-maintenance',
    standalone: false,
    templateUrl: './maintenance.html',
    styleUrl: './maintenance.scss'
})
export class MaintenanceComponent {
    // Estimated time when maintenance will be complete
    estimatedTime = 'pronto';
}
