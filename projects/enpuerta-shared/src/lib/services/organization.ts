import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Organization } from '../models/organization.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  constructor(private firestore: Firestore) { }

  getOrganization(orgId: string): Observable<Organization | undefined> {
    const docRef = doc(this.firestore, 'organizations', orgId);
    return from(getDoc(docRef)).pipe(
      map(snap => {
        const data = snap.data();
        return data ? { orgId: snap.id, ...data } as Organization : undefined;
      })
    );
  }
}
