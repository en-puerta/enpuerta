import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { FunctionService, BookingService } from '@enpuerta/shared';
import { Function as EventFunction, Booking } from '@enpuerta/shared';

interface FunctionStats {
    totalBookings: number;
    totalAttendees: number;
    capacityUsed: number;
    totalRevenue: number;
    averagePerBooking: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
}

@Component({
    selector: 'app-admin-function-stats',
    standalone: false,
    templateUrl: './admin-function-stats.html',
    styleUrl: './admin-function-stats.scss',
})
export class AdminFunctionStats implements OnInit {
    eventId!: string;
    functionId!: string;
    function$!: Observable<EventFunction | null>;
    stats$!: Observable<FunctionStats>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private functionService: FunctionService,
        private bookingService: BookingService
    ) { }

    ngOnInit() {
        this.eventId = this.route.snapshot.paramMap.get('eventId') || '';
        this.functionId = this.route.snapshot.paramMap.get('functionId') || '';

        // Get function details
        this.function$ = this.functionService.getFunction(this.eventId, this.functionId).pipe(
            map(func => func || null)
        );

        // Calculate statistics
        this.stats$ = combineLatest([
            this.function$,
            this.bookingService.getBookings(this.eventId, this.functionId)
        ]).pipe(
            map(([func, bookings]) => {
                if (!func || !bookings) {
                    return this.getEmptyStats();
                }

                const totalBookings = bookings.length;
                const totalAttendees = bookings.reduce((sum: number, b: Booking) => sum + (b.quantity || 0), 0);
                const capacityUsed = func.capacity > 0 ? (totalAttendees / func.capacity) * 100 : 0;
                const totalRevenue = bookings.reduce((sum: number, b: Booking) => sum + ((b.quantity || 0) * func.price), 0);
                const averagePerBooking = totalBookings > 0 ? totalAttendees / totalBookings : 0;

                const confirmedBookings = bookings.filter((b: Booking) => b.status === 'payment_received' || b.status === 'checked_in').length;
                const cancelledBookings = bookings.filter((b: Booking) => b.status === 'cancelled').length;
                const pendingBookings = bookings.filter((b: Booking) => b.status === 'pending_payment').length;

                return {
                    totalBookings,
                    totalAttendees,
                    capacityUsed,
                    totalRevenue,
                    averagePerBooking,
                    confirmedBookings,
                    cancelledBookings,
                    pendingBookings
                };
            })
        );
    }

    private getEmptyStats(): FunctionStats {
        return {
            totalBookings: 0,
            totalAttendees: 0,
            capacityUsed: 0,
            totalRevenue: 0,
            averagePerBooking: 0,
            confirmedBookings: 0,
            cancelledBookings: 0,
            pendingBookings: 0
        };
    }

    isSuccessfulEvent(stats: FunctionStats, func: EventFunction | null): boolean {
        if (!func || !stats) return false;

        const occupancyRate = stats.capacityUsed;
        const confirmationRate = stats.totalBookings > 0
            ? (stats.confirmedBookings / stats.totalBookings) * 100
            : 0;
        const revenue = stats.totalRevenue;

        return occupancyRate > 70 ||
            confirmationRate > 80 ||
            (revenue > 0 && revenue > 50000);
    }

    goBack() {
        this.router.navigate(['/events', this.eventId, 'functions']);
    }
}
