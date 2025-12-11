import { Component, Input } from '@angular/core';
import { Booking, Event, Function } from '@enpuerta/shared';

@Component({
  selector: 'app-booking-summary',
  standalone: false,
  templateUrl: './booking-summary.html',
  styleUrl: './booking-summary.scss'
})
export class BookingSummaryComponent {
  @Input() booking!: Booking;
  @Input() event!: Event;
  @Input() function!: Function;
}
