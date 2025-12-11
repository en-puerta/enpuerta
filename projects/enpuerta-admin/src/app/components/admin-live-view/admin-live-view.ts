import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingService } from '@enpuerta/shared';
import { Booking } from '@enpuerta/shared';

@Component({
  selector: 'app-admin-live-view',
  standalone: false,
  templateUrl: './admin-live-view.html',
  styleUrl: './admin-live-view.scss',
})
export class AdminLiveView implements OnInit {
  bookings$!: Observable<Booking[]>;
  eventId!: string;
  functionId!: string;

  totalBookings = 0;
  paidBookings = 0;
  checkedInCount = 0;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || '';
    this.functionId = this.route.snapshot.paramMap.get('functionId') || '';

    // Get bookings and calculate metrics
    this.bookings$ = this.bookingService.getBookings(this.eventId, this.functionId);

    this.bookings$.subscribe(bookings => {
      this.totalBookings = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
      this.paidBookings = bookings
        .filter(b => b.status === 'payment_received' || b.status === 'checked_in')
        .reduce((sum, b) => sum + (b.quantity || 0), 0);
      this.checkedInCount = bookings
        .filter(b => b.status === 'checked_in')
        .reduce((sum, b) => sum + (b.quantity || 0), 0);
    });
  }
}
