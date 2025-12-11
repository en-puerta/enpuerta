import { Component, OnInit } from '@angular/core';
import { EventService, Event } from '@enpuerta/shared';
import { Observable, BehaviorSubject, map, combineLatest } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  filteredEvents$: Observable<Event[]> | undefined;
  featuredEvents$: Observable<Event[]> | undefined;

  selectedFilter = 'Todos';
  filters = ['Todos', 'Teatro', 'Stand-up', 'Música', 'Taller', 'Otro'];

  selectedSort = 'date-asc';
  sortOptions = [
    { value: 'date-asc', label: 'Fecha (próximos primero)' },
    { value: 'date-desc', label: 'Fecha (lejanos primero)' },
    { value: 'name', label: 'Nombre A-Z' }
  ];

  // TODO: Location filter - preparado para filtrar por ciudad/cercanía
  selectedLocation = 'all';
  locationOptions = [
    { value: 'all', label: 'Todas las ubicaciones' },
    { value: 'caba', label: 'CABA' },
    { value: 'gba', label: 'GBA' },
    { value: 'nearby', label: 'Cerca mío' }
    // Agregar más ciudades según necesidad
  ];

  private filterSubject = new BehaviorSubject<string>('Todos');
  private sortSubject = new BehaviorSubject<string>('date-asc');
  private locationSubject = new BehaviorSubject<string>('all');

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    const allEvents$ = this.eventService.getActiveEvents();

    this.filteredEvents$ = combineLatest([allEvents$, this.filterSubject, this.sortSubject]).pipe(
      map(([events, filter, sort]) => {
        // Filter
        let filtered = filter === 'Todos'
          ? events
          : events.filter(e => e.eventType?.toLowerCase() === filter.toLowerCase());

        // Sort
        return this.sortEvents(filtered, sort);
      })
    );

    this.featuredEvents$ = allEvents$.pipe(
      map(events => events.filter(e => e.isSponsored))
    );
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.filterSubject.next(filter);
  }

  setSort(sort: string): void {
    this.selectedSort = sort;
    this.sortSubject.next(sort);
  }

  // TODO: Implement location filtering logic
  setLocation(location: string): void {
    this.selectedLocation = location;
    this.locationSubject.next(location);
    // When implementing, add location to combineLatest and filter logic
  }

  private sortEvents(events: Event[], sortBy: string): Event[] {
    const sorted = [...events];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.aliasPublic.localeCompare(b.aliasPublic));
      case 'date-asc':
      case 'date-desc':
        // Date sorting requires function data - for now return unsorted
        // TODO: Load functions and sort by next function date
        return sorted;
      default:
        return sorted;
    }
  }
}
