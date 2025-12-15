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

  searchQuery = '';

  // Price filter
  selectedPriceFilter = 'all';
  priceFilterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'free', label: 'Gratis' },
    { value: 'paid', label: 'De pago' }
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
  private searchSubject = new BehaviorSubject<string>('');
  private priceFilterSubject = new BehaviorSubject<string>('all');

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    // Only show events that have at least one function
    const allEvents$ = this.eventService.getActiveEventsWithFunctions();

    this.filteredEvents$ = combineLatest([
      allEvents$,
      this.filterSubject,
      this.sortSubject,
      this.searchSubject,
      this.priceFilterSubject
    ]).pipe(
      map(([events, filter, sort, search, priceFilter]) => {
        // Filter by category
        let filtered = filter === 'Todos'
          ? events
          : events.filter(e => e.eventType?.toLowerCase() === filter.toLowerCase());

        // Filter by search query
        if (search.trim()) {
          const query = search.toLowerCase();
          filtered = filtered.filter(e =>
            e.aliasPublic.toLowerCase().includes(query) ||
            e.nameInternal.toLowerCase().includes(query) ||
            e.locationAddress.toLowerCase().includes(query) ||
            e.descriptionShort?.toLowerCase().includes(query) ||
            e.descriptionLong?.toLowerCase().includes(query)
          );
        }

        // Filter by price
        if (priceFilter !== 'all') {
          if (priceFilter === 'free') {
            filtered = filtered.filter(e => e.pricingType === 'free');
          } else if (priceFilter === 'paid') {
            filtered = filtered.filter(e => e.pricingType === 'fixed' || e.pricingType === 'pay-what-you-want');
          }
        }

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

  setPriceFilter(priceFilter: string): void {
    this.selectedPriceFilter = priceFilter;
    this.priceFilterSubject.next(priceFilter);
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
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
