import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, FunctionService, BookingService, Event, Function, Booking } from '@enpuerta/shared';
import { combineLatest, switchMap, take, map, of } from 'rxjs';
import { RecaptchaService } from '../../services/recaptcha.service';

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
    private cdr: ChangeDetectorRef,
    private recaptchaService: RecaptchaService
  ) {
    this.bookingForm = this.fb.group({
      customerName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/) // Solo letras y espacios
      ]],
      customerPhone: ['', [this.phoneValidator]],
      customerEmail: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i) // Email más estricto
      ]],
      quantity: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(5) // Máximo 5 entradas (reducido de 10 para prevenir spam)
      ]],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.contactInfoValidator });
  }

  phoneValidator(control: any): any {
    if (!control.value) return null; // Optional field

    const phone = control.value.replace(/\s/g, ''); // Remove spaces

    // Accept formats: 3512345678, 543512345678, +543512345678
    const phoneRegex = /^(\+?54)?[1-9]\d{9,10}$/;

    return phoneRegex.test(phone) ? null : { invalidPhone: true };
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

  async onSubmit() {
    if (this.bookingForm.invalid || this.submitting) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      // Validate with reCAPTCHA v3 (invisible)
      const recaptchaToken = await this.recaptchaService.execute('booking');
      if (!recaptchaToken) {
        throw new Error('Error de verificación de seguridad. Por favor intentá de nuevo.');
      }

      if (!this.event || !this.function) {
        throw new Error('Datos incompletos');
      }

      // Re-fetch bookings to get real-time capacity (prevent race conditions)
      const currentBookings = await this.bookingService.getBookings(this.event.eventId, this.function.functionId)
        .pipe(take(1))
        .toPromise();

      const bookedSeats = currentBookings?.reduce((sum, b) => {
        return b.status !== 'cancelled' ? sum + b.quantity : sum;
      }, 0) || 0;

      const realTimeAvailableCapacity = this.function.capacity - bookedSeats;

      const formVal = this.bookingForm.value;

      // Validate against real-time capacity
      if (formVal.quantity > realTimeAvailableCapacity) {
        throw new Error(`Lo sentimos, solo quedan ${realTimeAvailableCapacity} lugares disponibles. Por favor ajustá la cantidad.`);
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

      // Reset submitting BEFORE navigation to prevent infinite loading
      this.submitting = false;
      this.cdr.detectChanges();

      // Navigate to confirmation page
      console.log('Navigating to confirmation...');
      try {
        const navigationResult = await this.router.navigate(['/booking', this.event.eventId, this.function.functionId, docRef.id, 'confirmed']);
        console.log('Navigation result:', navigationResult);

        if (!navigationResult) {
          console.error('Navigation failed!');
          this.errorMessage = 'Reserva creada pero hubo un error al mostrar la confirmación. Revisá tu email.';
        }
      } catch (navError) {
        console.error('Navigation error:', navError);
        this.errorMessage = 'Reserva creada pero hubo un error al mostrar la confirmación. Revisá tu email.';
      }

    } catch (error: any) {
      console.error('Error creating booking', error);
      this.errorMessage = error.message || 'Error al procesar la reserva. Por favor intentá de nuevo.';
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }
}
