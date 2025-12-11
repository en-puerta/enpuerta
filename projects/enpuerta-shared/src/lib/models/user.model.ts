export interface UserMeta {
    uid?: string; // Optional since it's the document ID
    displayName: string;
    email: string;
    roles: ('owner' | 'organizer' | 'staff')[];
    organizations: string[];
}
