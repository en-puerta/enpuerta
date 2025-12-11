import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService, FunctionService, Booking, Function } from '@enpuerta/shared';
import { Observable, map } from 'rxjs';

interface Stats {
  totalReservas: number;
  pagosConfirmados: number;
  presentes: number;
  faltantes: number;
}

@Component({
  selector: 'app-checkin-summary',
  standalone: false,
  templateUrl: './checkin-summary.html',
  styleUrl: './checkin-summary.scss',
})
export class CheckinSummary implements OnInit {
  functionId: string | null = null;
  function: Function | undefined;
  event: any;
  bookings$: Observable<Booking[]> | undefined;
  stats$: Observable<Stats> | undefined;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private functionService: FunctionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.functionId = params.get('functionId');
      if (this.functionId) {
        this.loadData(this.functionId);
      }
    });
  }

  loadData(id: string): void {
    this.functionService.getFunction(id).subscribe(f => this.function = f);

    this.bookings$ = this.bookingService.getBookings(id);

    this.stats$ = this.bookings$.pipe(
      map(bookings => {
        const active = bookings.filter(b => b.status !== 'cancelled');
        const confirmed = active.filter(b => b.status === 'payment_received' || b.status === 'checked_in');
        const checkedIn = active.filter(b => b.status === 'checked_in');

        const totalPax = active.reduce((acc, b) => acc + b.quantity, 0);
        const confirmedPax = confirmed.reduce((acc, b) => acc + b.quantity, 0);
        const presentPax = checkedIn.reduce((acc, b) => acc + b.quantity, 0);

        return {
          totalReservas: totalPax,
          pagosConfirmados: confirmedPax,
          presentes: presentPax,
          faltantes: confirmedPax - presentPax
        };
      })
    );
  }
}
