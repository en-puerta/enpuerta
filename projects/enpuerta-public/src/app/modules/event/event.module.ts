import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EventDetailComponent } from '../../components/event-detail/event-detail';
import { BookingFormComponent } from '../../components/booking-form/booking-form';
import { BookingConfirmedComponent } from '../../components/booking-confirmed/booking-confirmed';
import { FunctionListComponent } from '../../components/function-list/function-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
    { path: '', component: EventDetailComponent },
    { path: 'f/:functionId/booking', component: BookingFormComponent },
    { path: 'booking/:eventId/:functionId/:bookingId/confirmed', component: BookingConfirmedComponent }
];

@NgModule({
    declarations: [
        EventDetailComponent,
        BookingFormComponent,
        BookingConfirmedComponent,
        FunctionListComponent,
        HeaderComponent,
        LoadingSpinnerComponent,
        BookingSummaryComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ]
})
export class EventModule { }
