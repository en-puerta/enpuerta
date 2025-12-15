import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { EventService, AuthService } from '@enpuerta/shared';
import { Event } from '@enpuerta/shared';

type SortColumn = 'nameInternal' | 'aliasPublic' | 'eventType' | 'status';
type SortDirection = 'asc' | 'desc';

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
  selectedStatus = 'Todos';
  eventTypes = ['Todos', 'Teatro', 'Stand-up', 'Música', 'Taller', 'Otro'];
  eventStatuses = ['Todos', 'active', 'inactive', 'finished'];

  sortBy: SortColumn = 'nameInternal';
  sortDirection: SortDirection = 'asc';

  private filterTypeSubject = new BehaviorSubject<string>('Todos');
  private filterStatusSubject = new BehaviorSubject<string>('Todos');
  private sortSubject = new BehaviorSubject<{ column: SortColumn, direction: SortDirection }>({
    column: 'nameInternal',
    direction: 'asc'
  });

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

    // Filter and sort events
    this.filteredEvents$ = combineLatest([
      this.events$,
      this.filterTypeSubject,
      this.filterStatusSubject,
      this.sortSubject
    ]).pipe(
      map(([events, typeFilter, statusFilter, sort]) => {
        // Filter by type
        let filtered = typeFilter === 'Todos'
          ? events
          : events.filter(e => e.eventType === typeFilter.toLowerCase());

        // Filter by status
        filtered = statusFilter === 'Todos'
          ? filtered
          : filtered.filter(e => e.status === statusFilter);

        // Sort
        return this.sortEvents(filtered, sort.column, sort.direction);
      })
    );
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.filterTypeSubject.next(type);
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.filterStatusSubject.next(status);
  }

  setSorting(column: SortColumn) {
    // Toggle direction if same column, otherwise default to asc
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.sortSubject.next({ column: this.sortBy, direction: this.sortDirection });
  }

  private sortEvents(events: Event[], column: SortColumn, direction: SortDirection): Event[] {
    const sorted = [...events].sort((a, b) => {
      let aVal: any = a[column];
      let bVal: any = b[column];

      // Handle string comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
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

  async cancelEvent(event: Event) {
    if (!confirm(`¿Estás seguro de que querés cancelar el evento "${event.nameInternal}"?`)) {
      return;
    }

    try {
      await this.eventService.updateEvent(event.eventId, { status: 'inactive' });
      // The UI will update automatically thanks to real-time observables
    } catch (error) {
      console.error('Error canceling event:', error);
      alert('Hubo un error al cancelar el evento. Por favor intentá de nuevo.');
    }
  }

  async finalizeEvent(event: Event) {
    if (!confirm(`¿Estás seguro de que querés finalizar el evento "${event.nameInternal}"? Esto también finalizará todas sus funciones.`)) {
      return;
    }

    try {
      // Import Firestore functions
      const { getFirestore, collection, query, where, getDocs, writeBatch, doc } = await import('@angular/fire/firestore');
      const firestore = getFirestore();

      console.log('Finalizing event:', event.eventId);

      // Update event status
      await this.eventService.updateEvent(event.eventId, { status: 'finished' as any });

      // Get all functions for this event (from subcollection)
      const eventDocRef = doc(firestore, 'events', event.eventId);
      const functionsRef = collection(eventDocRef, 'functions');
      const snapshot = await getDocs(functionsRef);

      console.log('Functions found:', snapshot.size);

      // Batch update all functions to finished
      if (!snapshot.empty) {
        const batch = writeBatch(firestore);
        snapshot.forEach((funcDoc) => {
          console.log('Updating function:', funcDoc.id);
          batch.update(funcDoc.ref, { status: 'finished' });
        });
        await batch.commit();
        console.log('Batch committed successfully');
      }

      alert(`Evento y ${snapshot.size} función(es) finalizados correctamente`);
    } catch (error) {
      console.error('Error finalizing event:', error);
      alert('Hubo un error al finalizar el evento. Por favor intentá de nuevo.');
    }
  }
}
