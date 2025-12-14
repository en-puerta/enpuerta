import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, collectionData, onSnapshot } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, forkJoin, of } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private firestore: Firestore) { }

  // Real-time observable for events by organization
  getEvents(organizationId: string): Observable<Event[]> {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, where('organizationId', '==', organizationId));
    return new Observable(observer => {
      const unsubscribe = onSnapshot(q,
        snapshot => {
          const events = snapshot.docs.map(doc => ({ eventId: doc.id, ...doc.data() } as Event));
          observer.next(events);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  // Real-time observable for single event
  getEvent(eventId: string): Observable<Event | undefined> {
    const docRef = doc(this.firestore, 'events', eventId);
    return new Observable(observer => {
      const unsubscribe = onSnapshot(docRef,
        snap => {
          const data = snap.data();
          observer.next(data ? { eventId: snap.id, ...data } as Event : undefined);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  createEvent(event: Partial<Event>): Promise<any> {
    const eventsRef = collection(this.firestore, 'events');
    return addDoc(eventsRef, event);
  }

  updateEvent(eventId: string, data: Partial<Event>): Promise<void> {
    const docRef = doc(this.firestore, 'events', eventId);
    return updateDoc(docRef, data);
  }

  // Real-time observable for active events
  getActiveEvents(): Observable<Event[]> {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, where('status', '==', 'active'));
    return new Observable(observer => {
      const unsubscribe = onSnapshot(q,
        snapshot => {
          const events = snapshot.docs.map(doc => ({ eventId: doc.id, ...doc.data() } as Event));
          observer.next(events);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  // Real-time observable for active events with at least one function
  getActiveEventsWithFunctions(): Observable<Event[]> {
    return this.getActiveEvents().pipe(
      switchMap(events => {
        if (events.length === 0) {
          return of([]);
        }

        // Check each event for functions
        const eventChecks = events.map(event =>
          from(getDocs(collection(this.firestore, 'events', event.eventId!, 'functions'))).pipe(
            map(snapshot => ({
              event,
              hasFunctions: !snapshot.empty
            }))
          )
        );

        return forkJoin(eventChecks).pipe(
          map(results => results
            .filter(result => result.hasFunctions)
            .map(result => result.event)
          )
        );
      })
    );
  }

  // Real-time observable for event by alias
  getEventByAlias(alias: string): Observable<Event | undefined> {
    const eventsRef = collection(this.firestore, 'events');
    const q = query(eventsRef, where('aliasPublic', '==', alias));
    return new Observable(observer => {
      const unsubscribe = onSnapshot(q,
        snapshot => {
          if (snapshot.empty) {
            observer.next(undefined);
            return;
          }
          const doc = snapshot.docs[0];
          observer.next({ eventId: doc.id, ...doc.data() } as Event);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }
}
