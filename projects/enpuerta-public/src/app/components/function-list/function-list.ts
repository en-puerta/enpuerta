import { Component, Input } from '@angular/core';
import { Function, FunctionService, Event } from '@enpuerta/shared';

@Component({
  selector: 'app-function-list',
  standalone: false,
  templateUrl: './function-list.html',
  styleUrl: './function-list.scss',
})
export class FunctionListComponent {
  @Input() functions: Function[] = [];
  @Input() eventAlias: string = '';
  @Input() event: Event | undefined; // Need full event for WhatsApp

  constructor(private functionService: FunctionService) { }

  isClosedForBooking(func: Function): boolean {
    return this.functionService.isClosedForBooking(func);
  }

  getClosedMessage(func: Function): string {
    return this.functionService.getClosedMessage(func);
  }

  getWhatsAppLink(func: Function): string {
    if (!this.event || !this.event.contactInfo?.contactPhone) {
      return '';
    }

    const phone = this.event.contactInfo.contactPhone.replace(/\D/g, '');
    const message = `Hola, no llegué a reservar pero voy a estar yendo al evento "${this.event.aliasPublic}"`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}
