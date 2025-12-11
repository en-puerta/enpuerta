import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, doc, updateDoc, addDoc, getDoc, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private firestore: Firestore) { }

  // Real-time observable for bookings
  getBookings(eventId: string, functionId: string): Observable<Booking[]> {
    const bookingsRef = collection(this.firestore, 'events', eventId, 'functions', functionId, 'bookings');
    return new Observable(observer => {
      const unsubscribe = onSnapshot(bookingsRef,
        snapshot => {
          const bookings = snapshot.docs.map(doc => ({ bookingId: doc.id, ...doc.data() } as Booking));
          observer.next(bookings);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  updateStatus(eventId: string, functionId: string, bookingId: string, status: 'pending_payment' | 'payment_received' | 'cancelled' | 'checked_in'): Promise<void> {
    const docRef = doc(this.firestore, 'events', eventId, 'functions', functionId, 'bookings', bookingId);
    return updateDoc(docRef, { status });
  }

  getLiveBookings(eventId: string, functionId: string): Observable<Booking[]> {
    return this.getBookings(eventId, functionId);
  }

  createBooking(eventId: string, functionId: string, booking: Partial<Booking>): Promise<any> {
    const bookingsRef = collection(this.firestore, 'events', eventId, 'functions', functionId, 'bookings');
    return addDoc(bookingsRef, booking);
  }

  // Real-time observable for single booking
  getBookingById(eventId: string, functionId: string, bookingId: string): Observable<Booking | undefined> {
    const docRef = doc(this.firestore, 'events', eventId, 'functions', functionId, 'bookings', bookingId);
    return new Observable(observer => {
      const unsubscribe = onSnapshot(docRef,
        snap => {
          const data = snap.data();
          observer.next(data ? { bookingId: snap.id, ...data } as Booking : undefined);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  getBookingByQr(eventId: string, functionId: string, qrCode: string): Observable<Booking | undefined> {
    const bookingsRef = collection(this.firestore, 'events', eventId, 'functions', functionId, 'bookings');
    const q = query(
      bookingsRef,
      where('qrCodeData', '==', qrCode)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return undefined;
        const doc = snapshot.docs[0];
        return { bookingId: doc.id, ...doc.data() } as Booking;
      })
    );
  }
}
