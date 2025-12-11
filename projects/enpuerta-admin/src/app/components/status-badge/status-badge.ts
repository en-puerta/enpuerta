import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: false,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get badgeClasses(): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (this.status.toLowerCase()) {
      case 'active':
      case 'open':
      case 'payment_received':
      case 'checked_in':
        return `${baseClasses} bg-green-100 text-green-800`;

      case 'pending_payment':
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;

      case 'inactive':
      case 'closed':
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;

      case 'soldout':
        return `${baseClasses} bg-red-100 text-red-800`;

      default:
        return `${baseClasses} bg-slate-100 text-slate-800`;
    }
  }

  get displayText(): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'open': 'Abierta',
      'closed': 'Cerrada',
      'soldout': 'Agotada',
      'pending_payment': 'Pendiente',
      'payment_received': 'Pagado',
      'cancelled': 'Cancelada',
      'checked_in': 'Presente'
    };

    return statusMap[this.status.toLowerCase()] || this.status;
  }
}
