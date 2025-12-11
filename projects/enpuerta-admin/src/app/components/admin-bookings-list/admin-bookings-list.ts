import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingService, FunctionService, EventService } from '@enpuerta/shared';
import { Booking } from '@enpuerta/shared';

@Component({
  selector: 'app-admin-bookings-list',
  standalone: false,
  templateUrl: './admin-bookings-list.html',
  styleUrl: './admin-bookings-list.scss',
})
export class AdminBookingsList implements OnInit {
  bookings$!: Observable<Booking[]>;
  filteredBookings$!: Observable<Booking[]>;
  eventId!: string;
  functionId!: string;
  eventName = '';
  functionDate = '';

  statusFilters = ['Todos', 'Pendientes', 'Pagados', 'Canceladas', 'Check-in'];
  selectedStatus = 'Todos';
  private filterSubject = new BehaviorSubject<string>('Todos');

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private functionService: FunctionService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || '';
    this.functionId = this.route.snapshot.paramMap.get('functionId') || '';

    // Get bookings for this function
    this.bookings$ = this.bookingService.getBookings(this.eventId, this.functionId);

    // Filter bookings by status
    this.filteredBookings$ = combineLatest([
      this.bookings$,
      this.filterSubject
    ]).pipe(
      map(([bookings, filter]) => {
        if (filter === 'Todos') return bookings;
        const statusMap: { [key: string]: string } = {
          'Pendientes': 'pending_payment',
          'Pagados': 'payment_received',
          'Canceladas': 'cancelled',
          'Check-in': 'checked_in'
        };
        return bookings.filter(b => b.status === statusMap[filter]);
      })
    );

    // Get function and event info
    this.functionService.getFunction(this.eventId, this.functionId).subscribe(func => {
      if (func) {
        const date = func.dateTime?.toDate ? func.dateTime.toDate() : func.dateTime;
        if (date instanceof Date) {
          this.functionDate = date.toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }

        // Get event name
        this.eventService.getEvent(func.eventId).subscribe(event => {
          if (event) this.eventName = event.nameInternal;
        });
      }
    });
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.filterSubject.next(status);
  }

  async markAsPaid(bookingId: string) {
    if (!confirm('¿Marcar esta reserva como pagada?')) return;
    try {
      await this.bookingService.updateStatus(this.eventId, this.functionId, bookingId, 'payment_received');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error al actualizar la reserva');
    }
  }

  async checkIn(bookingId: string) {
    if (!confirm('¿Realizar check-in de esta reserva?')) return;
    try {
      await this.bookingService.updateStatus(this.eventId, this.functionId, bookingId, 'checked_in');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error al realizar check-in');
    }
  }

  async cancelBooking(bookingId: string) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      await this.bookingService.updateStatus(this.eventId, this.functionId, bookingId, 'cancelled');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error al cancelar la reserva');
    }
  }
}
