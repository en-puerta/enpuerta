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
}
