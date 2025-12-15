import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, OrganizationService, FunctionService, Event, AuthService } from '@enpuerta/shared';
import { PlacesService } from '../../services/places.service';
import { ImageService } from '../../services/image.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-admin-event-form',
  standalone: false,
  templateUrl: './admin-event-form.html',
  styleUrl: './admin-event-form.scss',
})
export class AdminEventForm implements OnInit, AfterViewInit {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  loading = false;
  organizationId: string | null = null;

  // Wizard state
  currentStep = 1;
  totalSteps = 3;

  // Image upload
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  uploadProgress: number = 0;
  imageError: string | null = null;

  // Google Places Autocomplete
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private functionService: FunctionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private placesService: PlacesService,
    private imageService: ImageService
  ) {
    this.eventForm = this.fb.group({
      nameInternal: ['', Validators.required],
      aliasPublic: ['', Validators.required],
      description: ['', Validators.required],
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
        contactPhone: ['', [
          Validators.pattern(/^(\+?54\s?9?\s?)?\d{6,10}$/) // Formato argentino más flexible
        ]]
      }),
      bankInfo: this.fb.group({
        alias: [''],
        cbu: ['', [
          Validators.pattern(/^\d{22}$/) // CBU debe ser 22 dígitos
        ]],
        titular: [''],
        telefonoComprobantes: ['', [
          Validators.pattern(/^\+?54\s?9?\s?\d{2,4}\s?\d{6,8}$/) // Formato argentino
        ]]
      }),
      // Single function fields (conditional)
      functionDate: [''],
      functionTime: [''],
      functionCapacity: [100],
      functionPrice: [0],
      functionAutoClose: [30]
    });

    // Listen to pricingType changes to update validators
    this.eventForm.get('pricingType')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });

    // Listen to contactInfo changes to update form validity
    this.eventForm.get('contactInfo.contactName')?.valueChanges.subscribe(() => {
      this.eventForm.updateValueAndValidity();
      console.log('ContactName changed, form valid:', this.eventForm.valid);
      console.log('All errors:', this.getFormValidationErrors());
    });
    this.eventForm.get('contactInfo.contactPhone')?.valueChanges.subscribe(() => {
      this.eventForm.updateValueAndValidity();
      console.log('ContactPhone changed, form valid:', this.eventForm.valid);
      console.log('All errors:', this.getFormValidationErrors());
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

    // Set initial validators based on current pricingType
    const initialType = this.eventForm.get('pricingType')?.value;
    if (initialType) {
      this.updateValidators(initialType);
    }
  }

  ngAfterViewInit(): void {
    // Initialize Google Places Autocomplete after view is ready
    if (this.locationInput) {
      this.placesService.initAutocomplete(
        this.locationInput.nativeElement,
        (place) => {
          // Update form with selected address
          const address = this.placesService.getFormattedAddress(place);
          this.eventForm.patchValue({
            locationAddress: address
          });
          this.cdr.detectChanges();
        }
      );
    }
  }

  updateValidators(pricingType: string): void {
    const contactName = this.eventForm.get('contactInfo.contactName');
    const contactPhone = this.eventForm.get('contactInfo.contactPhone');
    const defaultPrice = this.eventForm.get('defaultPrice');

    // Clear all validators first
    contactName?.clearValidators();
    contactPhone?.clearValidators();
    defaultPrice?.clearValidators();

    if (pricingType === 'free' || pricingType === 'pay-what-you-want') {
      // Contact info required for free and gorra events
      contactName?.setValidators([Validators.required]);
      contactPhone?.setValidators([
        Validators.required,
        Validators.pattern(/^(\+?54\s?9?\s?)?\d{6,10}$/)
      ]);
    } else {
      // For fixed price, contact phone pattern only
      contactPhone?.setValidators([
        Validators.pattern(/^(\+?54\s?9?\s?)?\d{6,10}$/)
      ]);
    }

    if (pricingType === 'fixed') {
      // Default price required for fixed pricing
      defaultPrice?.setValidators([Validators.required, Validators.min(1)]);
    }

    // Update validity
    contactName?.updateValueAndValidity();
    contactPhone?.updateValueAndValidity();
    defaultPrice?.updateValueAndValidity();

    // Update form validity
    this.eventForm.updateValueAndValidity();

    // Debug logs
    console.log('=== Form Validation Debug ===');
    console.log('Pricing Type:', pricingType);
    console.log('Form Valid:', this.eventForm.valid);
    console.log('Form Errors:', this.getFormValidationErrors());
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      if (control && control.invalid) {
        if (control instanceof FormGroup) {
          // For FormGroups, show nested errors
          const nestedErrors: any = {};
          Object.keys(control.controls).forEach(nestedKey => {
            const nestedControl = control.get(nestedKey);
            if (nestedControl && nestedControl.invalid) {
              nestedErrors[nestedKey] = nestedControl.errors;
            }
          });
          errors[key] = nestedErrors;
        } else {
          errors[key] = control.errors;
        }
      }
    });
    return errors;
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

  // Wizard navigation methods
  nextStep(): void {
    if (this.canProceedToNextStep()) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      // Only allow going to previous steps or if current step is valid
      if (step < this.currentStep || this.canProceedToNextStep()) {
        this.currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        // Step 1: Basic Information
        return (this.eventForm.get('nameInternal')?.valid ?? false) &&
          (this.eventForm.get('aliasPublic')?.valid ?? false) &&
          (this.eventForm.get('eventType')?.valid ?? false) &&
          (this.eventForm.get('defaultCapacity')?.valid ?? false) &&
          (this.eventForm.get('status')?.valid ?? false);
      case 2:
        // Step 2: Functions & Pricing
        const functionTypeValid = this.eventForm.get('functionType')?.valid ?? false;
        const pricingTypeValid = this.eventForm.get('pricingType')?.valid ?? false;

        // If single function, validate date and time
        if (this.eventForm.get('functionType')?.value === 'single') {
          return functionTypeValid && pricingTypeValid &&
            !!this.eventForm.get('functionDate')?.value &&
            !!this.eventForm.get('functionTime')?.value;
        }

        return functionTypeValid && pricingTypeValid;
      case 3:
        // Step 3: Payment - always valid (fields are optional based on selection)
        return true;
      default:
        return false;
    }
  }

  isStepComplete(step: number): boolean {
    if (step > this.currentStep) return false;
    if (step === this.currentStep) return this.canProceedToNextStep();
    return true; // Previous steps are considered complete
  }

  // Helper to combine date and time strings into Date object
  combineDateAndTime(dateStr: string, timeStr: string): Date {
    if (!dateStr || !timeStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  // Image upload methods
  onImageSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.imageError = null;

    // Validate image
    const validation = this.imageService.validateImage(file);
    if (!validation.valid) {
      this.imageError = validation.error || 'Error al validar imagen';
      return;
    }

    // Set selected image
    this.selectedImage = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview = e.target?.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.uploadProgress = 0;
    this.imageError = null;

    // Clear form value
    this.eventForm.patchValue({ coverImageUrl: '' });
  }

  async onSubmit(): Promise<void> {
    if (this.eventForm.invalid) return;

    this.loading = true;
    try {
      let imageUrl = this.eventForm.value.coverImageUrl;

      // Upload image if selected
      if (this.selectedImage) {
        // Create temporary event ID for new events
        const tempEventId = this.eventId || `temp_${Date.now()}`;

        imageUrl = await this.imageService.uploadEventImage(
          this.selectedImage,
          tempEventId,
          (progress) => {
            this.uploadProgress = progress;
            this.cdr.detectChanges();
          }
        );

        // Update form with new image URL
        this.eventForm.patchValue({ coverImageUrl: imageUrl });
      }

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
          const functionDateTime = this.combineDateAndTime(
            formValue.functionDate,
            formValue.functionTime
          );

          const functionData = {
            dateTime: functionDateTime,
            capacity: formValue.defaultCapacity || 100,
            price: formValue.defaultPrice || 0,
            autoCloseMinutesBefore: formValue.functionAutoClose || 15,
            status: 'open' as const,
            organizationId: this.organizationId
          };
          await this.functionService.createFunction(eventRef.id, functionData);
        }
      }
      this.router.navigate(['/events']);
    } catch (error) {
      console.error('Error saving event', error);
      this.imageError = 'Error al guardar el evento. Por favor intentá de nuevo.';
    } finally {
      this.loading = false;
      this.uploadProgress = 0;
    }
  }
}
