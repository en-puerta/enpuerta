import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, OrganizationService, FunctionService, Event, AuthService } from '@enpuerta/shared';
import { take } from 'rxjs';

@Component({
  selector: 'app-admin-event-form',
  standalone: false,
  templateUrl: './admin-event-form.html',
  styleUrl: './admin-event-form.scss',
})
export class AdminEventForm implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  loading = false;
  organizationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private functionService: FunctionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.eventForm = this.fb.group({
      nameInternal: ['', Validators.required],
      aliasPublic: ['', Validators.required],
      descriptionShort: [''],
      descriptionLong: [''],
      eventType: ['teatro', Validators.required],
      coverImageUrl: [''],
      iconUrl: [''],
      locationAddress: [''],
      locationMapUrl: [''],
      defaultCapacity: [100, [Validators.required, Validators.min(1)]],
      primaryColor: ['#000000'],
      secondaryColor: ['#ffffff'],
      isSponsored: [false],
      sponsoredLevel: [0],
      status: ['active', Validators.required],
      functionType: ['multiple', Validators.required],
      pricingType: ['free', Validators.required], // 'fixed', 'pay-what-you-want', or 'free'
      defaultPrice: [0],
      suggestedPrice: [0],
      paymentMethod: ['contact'], // 'platform' or 'contact'
      contactInfo: this.fb.group({
        contactName: [''],
        contactPhone: ['']
      }),
      bankInfo: this.fb.group({
        alias: [''],
        cbu: [''],
        titular: [''],
        telefonoComprobantes: ['']
      }),
      // Single function fields (conditional)
      functionDate: [''],
      functionTime: [''],
      functionCapacity: [100],
      functionPrice: [0],
      functionAutoClose: [30]
    });
  }

  ngOnInit(): void {
    this.authService.currentOrganizationId$.pipe(take(1)).subscribe((orgId: string | null) => {
      if (!orgId) {
        console.error('No organization ID found for user');
        alert('No tenés una organización asignada. Contactá al administrador.');
        this.router.navigate(['/events']);
        return;
      }
      this.organizationId = orgId;
      console.log('Organization ID:', this.organizationId);
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('eventId');
      if (id) {
        this.isEditMode = true;
        this.eventId = id;
        this.loadEvent(id);
      }
    });
  }

  loadEvent(id: string): void {
    this.loading = true;
    this.eventService.getEvent(id).subscribe(event => {
      if (event) {
        this.eventForm.patchValue(event);
      }
      this.loading = false;
    });
  }

  async onSubmit(): Promise<void> {
    if (this.eventForm.invalid) return;

    this.loading = true;
    try {
      if (this.isEditMode && this.eventId) {
        await this.eventService.updateEvent(this.eventId, this.eventForm.value);
      } else {
        if (!this.organizationId) throw new Error('No organization ID');
        const formValue = this.eventForm.value;
        const newEvent = {
          ...formValue,
          organizationId: this.organizationId
        };

        // Create event first
        const eventRef = await this.eventService.createEvent(newEvent);

        // If single function, create function automatically
        if (formValue.functionType === 'single') {
          const functionData = {
            dateTime: this.combineDateAndTime(formValue.functionDate, formValue.functionTime),
            capacity: formValue.defaultCapacity || 100,
            price: formValue.defaultPrice || 0,
            autoCloseMinutesBefore: formValue.functionAutoClose || 30,
            status: 'open' as const,
            organizationId: this.organizationId
          };
          await this.functionService.createFunction(eventRef.id, functionData);
        }
      }
      this.router.navigate(['/events']);
    } catch (error) {
      console.error('Error saving event', error);
      // Handle error notification
    } finally {
      this.loading = false;
    }
  }

  // Helper to combine date and time strings into Date object
  combineDateAndTime(dateStr: string, timeStr: string): Date {
    if (!dateStr || !timeStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }
}
