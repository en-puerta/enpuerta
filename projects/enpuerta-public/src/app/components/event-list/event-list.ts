import { Component, Input, OnInit, OnChanges, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Event, Function, FunctionService, BookingService } from '@enpuerta/shared';
import { combineLatest, map, shareReplay, Subscription } from 'rxjs';

@Component({
  selector: 'app-event-list',
  standalone: false,
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss'
})
export class EventListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() events: Event[] = [];
  @Input() carousel: boolean = false;

  eventFunctions: Map<string, { nextFunction: Function | null, count: number, isSoldOut: boolean }> = new Map();
  private subscriptions: Subscription[] = [];

  constructor(
    private functionService: FunctionService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadFunctionsForEvents();
  }

  ngOnChanges(changes: any): void {
    if (changes['events'] && !changes['events'].firstChange) {
      this.loadFunctionsForEvents();
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadFunctionsForEvents(): void {
    // Unsubscribe from previous subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.eventFunctions.clear();

    // Load functions for each event
    this.events.forEach(event => {
      const sub = this.functionService.getFunctions(event.eventId).pipe(
        shareReplay(1) // Share the subscription and replay last value
      ).subscribe(functions => {
        const sortedFunctions = functions
          .filter(f => f.status === 'open')
          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

        if (sortedFunctions.length === 0) {
          this.eventFunctions.set(event.eventId, {
            nextFunction: null,
            count: 0,
            isSoldOut: false
          });
          this.cdr.detectChanges();
          return;
        }

        // Check if next function is sold out
        const nextFunc = sortedFunctions[0];
        const bookingSub = this.bookingService.getBookings(event.eventId, nextFunc.functionId).pipe(
          map(bookings => {
            const activeBookings = bookings.filter(b => b.status !== 'cancelled');
            const sold = activeBookings.reduce((acc, curr) => acc + curr.quantity, 0);
            return sold >= nextFunc.capacity;
          }),
          shareReplay(1) // Share the subscription and replay last value
        ).subscribe(isSoldOut => {
          this.eventFunctions.set(event.eventId, {
            nextFunction: nextFunc,
            count: sortedFunctions.length,
            isSoldOut
          });
          this.cdr.detectChanges();
        });

        this.subscriptions.push(bookingSub);
      });

      this.subscriptions.push(sub);
    });
  }

  getFunctionData(eventId: string) {
    return this.eventFunctions.get(eventId) ?? { nextFunction: null, count: 0, isSoldOut: false };
  }
}
