import { Injectable } from '@angular/core';
import { Auth, authState, User, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, of, switchMap, map, from } from 'rxjs';
import { UserMeta } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly user$: Observable<User | null>;
  readonly currentUser$: Observable<User | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.user$ = authState(this.auth);
    this.currentUser$ = this.user$; // Alias for compatibility
  }

  // Login method
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  // Logout method
  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  get userMeta$(): Observable<UserMeta | null> {
    return this.user$.pipe(
      switchMap(user => {
        if (!user) return of(null);
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        return from(getDoc(userDoc)).pipe(
          map(snapshot => {
            if (!snapshot.exists()) {
              console.warn('User document not found for UID:', user.uid);
              return null;
            }
            return snapshot.data() as UserMeta;
          })
        );
      })
    );
  }

  get currentOrganizationId$(): Observable<string | null> {
    return this.userMeta$.pipe(
      map(meta => {
        if (!meta || !meta.organizations || meta.organizations.length === 0) {
          return null;
        }
        return meta.organizations[0];
      })
    );
  }
}
