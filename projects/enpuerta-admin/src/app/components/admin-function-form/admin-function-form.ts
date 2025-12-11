import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FunctionService, EventService, AuthService } from '@enpuerta/shared';
import { take } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-function-form',
  standalone: false,
  templateUrl: './admin-function-form.html',
  styleUrl: './admin-function-form.scss',
})
export class AdminFunctionForm implements OnInit {
  functionForm: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  functionId: string | null = null;
  organizationId: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private functionService: FunctionService,
    private eventService: EventService,
    private authService: AuthService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.functionForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      capacity: [100, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      autoCloseMinutesBefore: [60, Validators.required],
      status: ['open', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.currentOrganizationId$.pipe(take(1)).subscribe(orgId => {
      this.organizationId = orgId;
    });

    this.route.paramMap.subscribe(params => {
      const eId = params.get('eventId');
      const fId = params.get('functionId');

      console.log('Route params:', { eId, fId });

      if (eId) {
        this.eventId = eId;
        console.log('Set eventId to:', this.eventId);
      }

      if (fId) {
        this.isEditMode = true;
        this.functionId = fId;
        console.log('Loading function with eventId:', this.eventId);
        this.loadFunction(fId);
      } else {
        this.isEditMode = false;
        // Load event to pre-fill capacity with defaultCapacity
        if (eId) {
          this.loadEventForDefaults(eId);
        }
      }
    });
  }

  loadEventForDefaults(eventId: string): void {
    this.eventService.getEvent(eventId).subscribe(event => {
      if (event) {
        const updates: any = {};
        if (event.defaultCapacity) {
          updates.capacity = event.defaultCapacity;
        }
        if (event.defaultPrice !== undefined) {
          updates.price = event.defaultPrice;
        }
        this.functionForm.patchValue(updates);
      }
    });
  }

  loadFunction(id: string): void {
    this.loading = true;

    // Ensure eventId is set before loading
    if (!this.eventId) {
      console.error('eventId is required to load function');
      this.loading = false;
      return;
    }

    this.functionService.getFunction(this.eventId, id).subscribe(func => {
      if (func) {
        this.eventId = func.eventId;

        let dateObj: Date | undefined;
        if (func.dateTime && typeof (func.dateTime as any).toDate === 'function') {
          dateObj = (func.dateTime as any).toDate();
        } else if (func.dateTime instanceof Date) {
          dateObj = func.dateTime;
        }

        let dateStr = '';
        let timeStr = '';

        if (dateObj) {
          dateStr = dateObj.toISOString().split('T')[0];
          // Manual time extraction to avoid timezone issues with simple split if local/UTC mismatch
          // For simplicity in this demo, standard ISO string split might be offset.
          // Better to use local time for inputs.
          const year = dateObj.getFullYear();
          const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
          const day = ('0' + dateObj.getDate()).slice(-2);
          dateStr = `${year}-${month}-${day}`;

          const hours = ('0' + dateObj.getHours()).slice(-2);
          const minutes = ('0' + dateObj.getMinutes()).slice(-2);
          timeStr = `${hours}:${minutes}`;
        }

        this.functionForm.patchValue({
          capacity: func.capacity,
          price: func.price,
          autoCloseMinutesBefore: func.autoCloseMinutesBefore,
          status: func.status,
          date: dateStr,
          time: timeStr
        });
      }
      this.loading = false;
    });
  }

  async onSubmit(): Promise<void> {
    if (this.functionForm.invalid) return;
    if (!this.eventId || !this.organizationId) {
      alert('Error: Missing event or organization ID');
      return;
    }

    this.loading = true;
    try {
      const formValue = this.functionForm.value;
      const dateTime = new Date(`${formValue.date}T${formValue.time}`);

      const functionData = {
        eventId: this.eventId,
        dateTime,
        capacity: formValue.capacity,
        price: formValue.price,
        autoCloseMinutes: formValue.autoCloseMinutesBefore || 30, // Changed from autoCloseMinutes to autoCloseMinutesBefore
        status: formValue.status,
        organizationId: this.organizationId // Added organizationId for create
      };

      if (this.isEditMode && this.functionId) {
        await this.functionService.updateFunction(this.eventId!, this.functionId, functionData);
      } else {
        await this.functionService.createFunction(this.eventId!, functionData);
      }

      this.goBack();
    } catch (error) {
      console.error('Error saving function:', error);
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    if (this.eventId) {
      this.router.navigate(['/events', this.eventId, 'functions']);
    } else {
      this.router.navigate(['/events']);
    }
  }
}
