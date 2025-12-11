export interface Booking {
    bookingId: string;
    functionId: string;
    eventId: string;
    organizationId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    quantity: number;
    status: 'pending_payment' | 'payment_received' | 'cancelled' | 'checked_in';
    createdAt: Date | any;
    updatedAt: Date | any;
    qrCodeData?: string;
}
