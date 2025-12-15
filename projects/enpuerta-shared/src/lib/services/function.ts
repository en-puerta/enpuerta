import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, doc, getDoc, addDoc, updateDoc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Function } from '../models/function.model';

@Injectable({
  providedIn: 'root'
})
export class FunctionService {

  constructor(private firestore: Firestore) { }

  // Real-time observable for all functions
  getFunctions(eventId: string): Observable<Function[]> {
    const functionsRef = collection(this.firestore, 'events', eventId, 'functions');
    return new Observable(observer => {
      const unsubscribe = onSnapshot(functionsRef,
        snapshot => {
          const functions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              functionId: doc.id,
              ...data,
              dateTime: data['dateTime']?.toDate ? data['dateTime'].toDate() : data['dateTime']
            } as Function;
          });
          observer.next(functions);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  // Real-time observable for single function
  getFunction(eventId: string, functionId: string): Observable<Function | undefined> {
    const docRef = doc(this.firestore, 'events', eventId, 'functions', functionId);
    return new Observable(observer => {
      const unsubscribe = onSnapshot(docRef,
        snap => {
          const data = snap.data();
          if (!data) {
            observer.next(undefined);
            return;
          }
          observer.next({
            functionId: snap.id,
            ...data,
            dateTime: data['dateTime']?.toDate ? data['dateTime'].toDate() : data['dateTime']
          } as Function);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  createFunction(eventId: string, fn: Partial<Function>): Promise<any> {
    const functionsRef = collection(this.firestore, 'events', eventId, 'functions');
    return addDoc(functionsRef, fn);
  }

  updateFunction(eventId: string, functionId: string, data: Partial<Function>): Promise<void> {
    const docRef = doc(this.firestore, 'events', eventId, 'functions', functionId);
    return updateDoc(docRef, data);
  }

  // Real-time observable for future functions
  getFutureFunctions(eventId: string): Observable<Function[]> {
    const functionsRef = collection(this.firestore, 'events', eventId, 'functions');
    const now = new Date();
    const q = query(
      functionsRef,
      where('dateTime', '>=', now)
    );

    return new Observable(observer => {
      const unsubscribe = onSnapshot(q,
        snapshot => {
          const functions = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              functionId: doc.id,
              ...data,
              dateTime: data['dateTime']?.toDate ? data['dateTime'].toDate() : data['dateTime']
            } as Function;
          });
          observer.next(functions);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  /**
   * Check if function is closed for ONLINE booking based on auto-close time
   * Note: Function may still be open for door sales even if online booking is closed
   * @param func Function to check
   * @returns true if closed for online booking
   */
  isClosedForBooking(func: Function): boolean {
    // Manual closure or finished
    if (func.status === 'closed' || func.status === 'soldout' || func.status === 'finished') {
      return true;
    }

    // Auto-close check based on time
    const functionDateTime = func.dateTime instanceof Date
      ? func.dateTime
      : func.dateTime.toDate(); // Firestore Timestamp

    // Backward compatibility: check both field names
    // Old field: autoCloseMinutes, New field: autoCloseMinutesBefore
    const autoCloseMinutes = func.autoCloseMinutesBefore ?? (func as any).autoCloseMinutes ?? 15;

    const closeTime = new Date(functionDateTime.getTime() - (autoCloseMinutes * 60 * 1000));
    const now = new Date();

    return now >= closeTime;
  }

  /**
   * Get minutes until function closes for online booking
   * @param func Function to check
   * @returns minutes until close, or null if already closed
   */
  getMinutesUntilClose(func: Function): number | null {
    if (this.isClosedForBooking(func)) {
      return null;
    }

    const functionDateTime = func.dateTime instanceof Date
      ? func.dateTime
      : func.dateTime.toDate();

    // Backward compatibility: check both field names
    const autoCloseMinutes = func.autoCloseMinutesBefore ?? (func as any).autoCloseMinutes ?? 15;

    const closeTime = new Date(functionDateTime.getTime() - (autoCloseMinutes * 60 * 1000));
    const now = new Date();

    const diffMs = closeTime.getTime() - now.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  }

  /**
   * Get user-friendly message for closed booking
   * @param func Function to check
   * @returns message explaining why booking is closed
   */
  getClosedMessage(func: Function): string {
    if (func.status === 'finished') {
      return 'Esta función ya finalizó.';
    }

    if (func.status === 'soldout') {
      return 'Función agotada.';
    }

    if (func.status === 'closed') {
      return 'Las reservas online están cerradas. Podés conseguir tus entradas en puerta.';
    }

    // Auto-closed
    if (this.isClosedForBooking(func)) {
      const autoCloseMinutes = func.autoCloseMinutesBefore ?? (func as any).autoCloseMinutes ?? 15;
      return `Las reservas online cierran ${autoCloseMinutes} minutos antes de la función. Podés conseguir tus entradas en puerta.`;
    }

    return '';
  }
}
