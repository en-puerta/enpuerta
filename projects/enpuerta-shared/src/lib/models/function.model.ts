export interface Function {
    functionId: string;
    eventId: string;
    organizationId: string;
    dateTime: Date | any; // Firestore timestamp
    capacity: number;
    price: number;
    autoCloseMinutesBefore: number;
    status: 'open' | 'closed' | 'soldout' | 'finished';
}
