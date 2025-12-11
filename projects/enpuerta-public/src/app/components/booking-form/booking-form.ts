import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, FunctionService, BookingService, Event, Function, Booking } from '@enpuerta/shared';
import { combineLatest, switchMap, take, map, of } from 'rxjs';

@Component({
  selector: 'app-booking-form',
  standalone: false,
  templateUrl: './booking-form.html',
  styleUrl: './booking-form.scss',
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  event: Event | undefined;
  function: Function | undefined;
  loading = true;
  submitting = false;
  availableCapacity = 0;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private functionService: FunctionService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {
    this.bookingForm = this.fb.group({
      customerName: ['', Validators.required],
      customerPhone: [''],
      customerEmail: ['', [Validators.email]],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.contactInfoValidator });
  }

  contactInfoValidator(group: FormGroup): any {
    const phone = group.get('customerPhone')?.value;
    const email = group.get('customerEmail')?.value;
    return (phone || email) ? null : { contactRequired: true };
  }

  ngOnInit(): void {
    combineLatest([
      this.route.paramMap,
    ]).pipe(
      switchMap(([params]) => {
        const alias = params.get('alias');
        const functionId = params.get('functionId');

        if (!alias || !functionId) return of(null);

        // First get event, then use eventId for function and bookings
        return this.eventService.getEventByAlias(alias).pipe(
          switchMap(event => {
            if (!event) return of(null);
            return combineLatest([
              of(event),
              this.functionService.getFunction(event.eventId, functionId),
              this.bookingService.getBookings(event.eventId, functionId)
            ]);
          })
        );
      })
    ).subscribe((result) => {
      this.loading = false;
      if (!result) {
        this.cdr.detectChanges();
        return;
      }
      const [event, func, bookings] = result;

      if (!event || !func) {
        this.errorMessage = 'Evento o función no encontrados.';
        this.cdr.detectChanges();
        return;
      }

      this.event = event;
      this.function = func;

      const activeBookings = bookings?.filter((b: Booking) => b.status !== 'cancelled') || [];
      const sold = activeBookings.reduce((acc: number, curr: Booking) => acc + curr.quantity, 0);
      this.availableCapacity = func.capacity - sold;

      // Validations
      if (func.status !== 'open') {
        this.errorMessage = 'La venta para esta función está cerrada.';
        this.bookingForm.disable();
      } else if (this.availableCapacity <= 0) {
        this.errorMessage = 'Función agotada.';
        this.bookingForm.disable();
      } else {
        // Dynamic max validation based on capacity
        const maxQty = Math.min(10, this.availableCapacity);
        this.bookingForm.get('quantity')?.setValidators([Validators.required, Validators.min(1), Validators.max(maxQty)]);
        this.bookingForm.get('quantity')?.updateValueAndValidity();
      }

      this.cdr.detectChanges();
    });
  }

  async onSubmit(): Promise<void> {
    if (this.bookingForm.invalid) return;

    this.submitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      if (!this.event || !this.function) throw new Error('Datos incompletos');

      // Double check availability (simple check, ideal would be transaction)
      // We are trusting the optimized optimistic UI for now or we would re-fetch.
      // For this demo, let's proceed.

      const formVal = this.bookingForm.value;
      if (formVal.quantity > this.availableCapacity) {
        throw new Error('No hay suficientes cupos disponibles.');
      }

      const booking = {
        functionId: this.function.functionId,
        eventId: this.event.eventId,
        organizationId: this.event.organizationId,
        customerName: formVal.customerName,
        customerPhone: formVal.customerPhone || '',
        customerEmail: formVal.customerEmail || '',
        quantity: formVal.quantity,
        status: 'pending_payment' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCodeData: '' // Will be filled later or generated on fly
      };

      console.log('Creating booking...', booking);
      const docRef = await this.bookingService.createBooking(this.event.eventId, this.function.functionId, booking);
      console.log('Booking created with ID:', docRef.id);

      await this.router.navigate(['/booking', this.event.eventId, this.function.functionId, docRef.id, 'confirmed']);

    } catch (error: any) {
      console.error('Error creating booking', error);
      this.errorMessage = error.message || 'Error al procesar la reserva. Por favor intentá de nuevo.';
      this.cdr.detectChanges();
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }
}
