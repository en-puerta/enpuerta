import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService, EventService, FunctionService, OrganizationService, Booking, Event, Function, Organization } from '@enpuerta/shared';
import { switchMap, of, forkJoin, map, catchError } from 'rxjs';

@Component({
  selector: 'app-booking-confirmed',
  standalone: false,
  templateUrl: './booking-confirmed.html',
  styleUrl: './booking-confirmed.scss',
})
export class BookingConfirmedComponent implements OnInit {
  loading = true;
  error = false;

  booking: Booking | undefined;
  event: Event | undefined;
  function: Function | undefined;
  organization: Organization | undefined;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private eventService: EventService,
    private functionService: FunctionService,
    private organizationService: OrganizationService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const bookingId = params.get('bookingId');
        const eventId = params.get('eventId');
        const functionId = params.get('functionId');

        if (!bookingId || !eventId || !functionId) throw new Error('Missing parameters');

        return this.bookingService.getBookingById(eventId, functionId, bookingId).pipe(
          switchMap(booking => {
            if (!booking) return of(null);

            return forkJoin({
              booking: of(booking),
              event: this.eventService.getEvent(eventId),
              function: this.functionService.getFunction(eventId, functionId),
              organization: this.organizationService.getOrganization(booking.organizationId)
            });
          })
        );
      }),
      catchError(err => {
        console.error(err);
        this.error = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        this.booking = data.booking;
        this.event = data.event;
        this.function = data.function;
        this.organization = data.organization;
      } else {
        this.error = true;
      }
      this.loading = false;
    });
  }
}
