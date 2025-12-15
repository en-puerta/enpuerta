import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventService, FunctionService, BookingService, Event, Function } from '@enpuerta/shared';
import { Observable, switchMap, combineLatest, map, of, shareReplay } from 'rxjs';

@Component({
  selector: 'app-event-detail',
  standalone: false,
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetailComponent implements OnInit {
  event$: Observable<Event | undefined> | undefined;
  functions$: Observable<any[]> | undefined; // any to include availableCapacity
  loading = true;
  window = window; // Make window available in template
  encodeURIComponent = encodeURIComponent; // Make encodeURIComponent available in template

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private functionService: FunctionService,
    private bookingService: BookingService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.event$ = this.route.paramMap.pipe(
      switchMap(params => {
        const alias = params.get('alias');
        if (!alias) return of(undefined);
        return this.eventService.getEventByAlias(alias);
      }),
      shareReplay(1)
    );

    this.functions$ = this.event$.pipe(
      switchMap(event => {
        if (!event) {
          this.loading = false;
          return of([]);
        }
        console.log('📍 Event loaded, fetching functions for:', event.eventId);
        return this.functionService.getFutureFunctions(event.eventId).pipe(
          switchMap(functions => {
            console.log('🎭 Functions received:', functions.length);
            if (functions.length === 0) {
              this.loading = false;
              return of([]);
            }

            // For each function, get bookings to calc capacity
            const functionsWithCapacity$ = functions.map(func => {
              console.log('🎫 Fetching bookings for function:', func.functionId);
              return this.bookingService.getBookings(event.eventId, func.functionId).pipe(
                map(bookings => {
                  console.log('📊 Bookings received for', func.functionId, ':', bookings.length);
                  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
                  const sold = activeBookings.reduce((acc, curr) => acc + curr.quantity, 0);
                  const availableCapacity = func.capacity - sold;
                  console.log(`💺 Capacity for ${func.functionId}: ${availableCapacity}/${func.capacity} (sold: ${sold})`);
                  return {
                    ...func,
                    availableCapacity
                  };
                })
              );
            });

            return combineLatest(functionsWithCapacity$).pipe(
              map(funcs => {
                this.loading = false;
                console.log('✅ Final functions with capacity:', funcs);
                return funcs.sort((a, b) => {
                  const dateA = (a.dateTime && (a.dateTime as any).toDate) ? (a.dateTime as any).toDate() : new Date(a.dateTime);
                  const dateB = (b.dateTime && (b.dateTime as any).toDate) ? (b.dateTime as any).toDate() : new Date(b.dateTime);
                  return dateA.getTime() - dateB.getTime();
                });
              })
            );
          })
        );
      }),
      shareReplay(1)
    );
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    }).catch(err => {
      console.error('Error copying link:', err);
    });
  }

  getMapUrl(address: string): SafeResourceUrl {
    const encodedAddress = encodeURIComponent(address);
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }
}
