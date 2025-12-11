import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EventService, AuthService } from '@enpuerta/shared';
import { Event } from '@enpuerta/shared';

@Component({
  selector: 'app-admin-events-list',
  standalone: false,
  templateUrl: './admin-events-list.html',
  styleUrl: './admin-events-list.scss',
})
export class AdminEventsList implements OnInit {
  events$!: Observable<Event[]>;
  filteredEvents$!: Observable<Event[]>;
  selectedType = 'Todos';
  eventTypes = ['Todos', 'Teatro', 'Stand-up', 'Música', 'Taller', 'Otro'];

  private filterSubject = new BehaviorSubject<string>('Todos');

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Get events for current organization using switchMap to flatten observables
    this.events$ = this.authService.currentOrganizationId$.pipe(
      switchMap(orgId => {
        if (!orgId) return of([]);
        return this.eventService.getEvents(orgId);
      })
    );

    // Filter events by type
    this.filteredEvents$ = combineLatest([
      this.events$,
      this.filterSubject
    ]).pipe(
      map(([events, filter]) => {
        if (filter === 'Todos') return events;
        return events.filter(e => e.eventType === filter.toLowerCase());
      })
    );
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.filterSubject.next(type);
  }

  goToNewEvent() {
    this.router.navigate(['/events/new']);
  }

  editEvent(eventId: string) {
    this.router.navigate(['/events', eventId, 'edit']);
  }

  viewFunctions(eventId: string) {
    this.router.navigate(['/events', eventId, 'functions']);
  }
}
