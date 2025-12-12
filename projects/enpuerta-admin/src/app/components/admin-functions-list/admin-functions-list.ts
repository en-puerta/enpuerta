import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { FunctionService, EventService } from '@enpuerta/shared';
import { Function, Event } from '@enpuerta/shared';

@Component({
  selector: 'app-admin-functions-list',
  standalone: false,
  templateUrl: './admin-functions-list.html',
  styleUrl: './admin-functions-list.scss',
})
export class AdminFunctionsList implements OnInit {
  functions$!: Observable<Function[]>;
  eventId!: string;
  eventName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private functionService: FunctionService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId') || '';

    // Get functions for this event
    this.functions$ = this.functionService.getFunctions(this.eventId);

    // Get event name
    this.eventService.getEvent(this.eventId).subscribe(event => {
      if (event) this.eventName = event.nameInternal;
    });
  }

  goToNewFunction() {
    this.router.navigate(['/events', this.eventId, 'functions', 'new']);
  }

  editFunction(functionId: string) {
    this.router.navigate(['/events', this.eventId, 'functions', functionId, 'edit']);
  }

  viewBookings(functionId: string) {
    this.router.navigate(['/events', this.eventId, 'functions', functionId, 'bookings']);
  }

  viewLive(functionId: string) {
    this.router.navigate(['/events', this.eventId, 'functions', functionId, 'live']);
  }

  async cancelFunction(func: Function) {
    if (confirm(`¿Estás seguro que querés cancelar la función del ${func.dateTime}?`)) {
      try {
        await this.functionService.updateFunction(this.eventId, func.functionId!, { status: 'closed' });
        alert('Función cancelada exitosamente');
      } catch (error) {
        console.error('Error canceling function:', error);
        alert('Error al cancelar la función');
      }
    }
  }
}
