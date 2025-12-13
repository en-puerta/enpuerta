import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService, FunctionService, Booking, Function } from '@enpuerta/shared';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-checkin-scanner',
  standalone: false,
  templateUrl: './checkin-scanner.html',
  styleUrl: './checkin-scanner.scss',
})
export class CheckinScanner implements OnInit {
  eventId: string | null = null;
  functionId: string | null = null;
  function: Function | undefined;
  event: any;

  allowedFormats = [BarcodeFormat.QR_CODE];

  scanResult: string | null = null;
  foundBooking: Booking | null = null;
  searchStatus: 'idle' | 'searching' | 'found' | 'not_found' | 'error' = 'idle';
  feedbackMessage = '';

  enableScanner = true;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private functionService: FunctionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('eventId');
      this.functionId = params.get('functionId');
      if (this.eventId && this.functionId) {
        this.loadFunction(this.eventId, this.functionId);
      }
    });
  }

  loadFunction(eventId: string, functionId: string): void {
    this.functionService.getFunction(eventId, functionId).subscribe(f => this.function = f);
  }

  onCodeResult(resultString: string): void {
    if (this.searchStatus === 'searching' || this.scanResult === resultString) return;

    this.scanResult = resultString;
    this.enableScanner = false; // Pause scanner
    this.searchBooking(resultString);
  }

  searchBooking(qrCode: string): void {
    if (!this.eventId || !this.functionId) return;

    this.searchStatus = 'searching';
    this.feedbackMessage = '';
    this.foundBooking = null;

    this.bookingService.getBookingByQr(this.eventId, this.functionId, qrCode).subscribe({
      next: (booking) => {
        if (booking) {
          this.foundBooking = booking;
          this.searchStatus = 'found';
        } else {
          this.searchStatus = 'not_found';
        }
      },
      error: (err) => {
        console.error(err);
        this.searchStatus = 'error';
      }
    });
  }

  resetScan(): void {
    this.scanResult = null;
    this.foundBooking = null;
    this.searchStatus = 'idle';
    this.feedbackMessage = '';
    this.enableScanner = true;
  }

  async checkIn(): Promise<void> {
    if (this.foundBooking && this.foundBooking.bookingId && this.eventId && this.functionId) {
      try {
        await this.bookingService.updateStatus(this.eventId, this.functionId, this.foundBooking.bookingId, 'checked_in');
        this.foundBooking.status = 'checked_in'; // Optimistic update
        this.feedbackMessage = 'Ingreso registrado correctamente.';
      } catch (err) {
        console.error(err);
        alert('Error al registrar ingreso');
      }
    }
  }
}
