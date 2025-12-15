import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService, EventService, FunctionService, OrganizationService, Booking, Event, Function as EventFunction, Organization } from '@enpuerta/shared';
import { switchMap, of, forkJoin, map, catchError, take } from 'rxjs';

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
  function: EventFunction | undefined;
  organization: Organization | undefined;
  encodeURIComponent = encodeURIComponent; // Make available in template

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private eventService: EventService,
    private functionService: FunctionService,
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef
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
              event: this.eventService.getEvent(eventId).pipe(
                take(1)
              ),
              function: this.functionService.getFunction(eventId, functionId).pipe(
                take(1)
              ),
              organization: this.organizationService.getOrganization(booking.organizationId).pipe(
                take(1)
              )
            });
          })
        );
      }),
      catchError(err => {
        console.error('BookingConfirmed: error', err);
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

      // Force change detection
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    });
  }

  addToCalendar(): void {
    if (!this.event || !this.function) return;

    const eventDate = (this.function.dateTime as any).toDate ? (this.function.dateTime as any).toDate() : new Date(this.function.dateTime);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EnPuerta//Booking//ES',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(eventDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${this.event.aliasPublic}`,
      `DESCRIPTION:${this.event.descriptionShort || ''}`,
      `LOCATION:${this.event.locationAddress}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${this.event.aliasPublic.replace(/\s+/g, '_')}.ics`;
    link.click();
  }

  // Payment method detection
  get isDirectContact(): boolean {
    return !this.event?.bankInfo;
  }

  get paymentContactPhone(): string {
    // For direct contact, use contactInfo.contactPhone
    // For bank transfer, use bankInfo.telefonoComprobantes
    const phone = this.isDirectContact
      ? this.event?.contactInfo?.contactPhone
      : this.event?.bankInfo?.telefonoComprobantes;

    if (!phone) {
      return '';
    }

    // Format for WhatsApp international format
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different Argentine phone formats
    // Expected final format: 54 + area code (without 0) + number (without 15)

    // If already has 54 at start
    if (cleaned.startsWith('54')) {
      // Remove any leading 00 or +
      cleaned = cleaned.replace(/^(00)?54/, '54');
    }
    // If starts with 0 (national format with area code)
    // Example: 0351 1234567 -> 54351 1234567
    else if (cleaned.startsWith('0')) {
      cleaned = '54' + cleaned.substring(1);
    }
    // If it's just the number without country/area code
    else {
      cleaned = '54' + cleaned;
    }

    // Remove the 15 after area code if present (mobile indicator in Argentina)
    // Example: 5435115123456 -> 543515123456
    cleaned = cleaned.replace(/^(54\d{2,4})15/, '$1');

    return cleaned;
  }

  getWhatsAppMessage(): string {
    const quantity = this.booking?.quantity || 0;
    const total = (this.function?.price || 0) * quantity;
    const eventName = this.event?.nameInternal || '';

    // Format with dot as thousand separator (not comma)
    const formatPrice = (price: number) => {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    if (this.isDirectContact) {
      // Direct contact message with quantity and total
      return `Hola! Quiero hacer el pago por ${quantity} entrada${quantity > 1 ? 's' : ''} para ${eventName}. El total es de $${formatPrice(total)}`;
    } else {
      // Bank transfer message (existing)
      return `Hola, envío comprobante de reserva para ${eventName} a nombre de ${this.booking?.customerName}`;
    }
  }
}
