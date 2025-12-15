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
  event$!: Observable<Event | undefined>;
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

    // Get event details
    this.event$ = this.eventService.getEvent(this.eventId);

    // Get functions for this event
    this.functions$ = this.functionService.getFunctions(this.eventId);

    // Get event name
    this.event$.subscribe(event => {
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

  viewStatistics(functionId: string) {
    this.router.navigate(['/events', this.eventId, 'functions', functionId, 'stats']);
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

  async finalizeFunction(func: Function) {
    if (!confirm(`¿Estás seguro de que querés finalizar esta función?`)) {
      return;
    }

    try {
      // Import Firestore functions
      const { getFirestore, collection, getDocs, doc, updateDoc } = await import('@angular/fire/firestore');
      const firestore = getFirestore();

      // Update function status to finished
      await this.functionService.updateFunction(this.eventId, func.functionId!, { status: 'finished' });

      // Check if all functions are now finished
      const functionsRef = collection(firestore, 'events', this.eventId, 'functions');
      const snapshot = await getDocs(functionsRef);

      const allFinished = snapshot.docs.every(docSnap => {
        const data = docSnap.data();
        return data['status'] === 'finished';
      });

      // If all functions are finished, finalize the event
      if (allFinished) {
        const eventRef = doc(firestore, 'events', this.eventId);
        await updateDoc(eventRef, { status: 'finished' });
        alert(`Función finalizada. Todas las funciones están finalizadas, el evento también se finalizó automáticamente.`);
      } else {
        alert('Función finalizada exitosamente');
      }
    } catch (error) {
      console.error('Error finalizing function:', error);
      alert('Error al finalizar la función');
    }
  }
}
