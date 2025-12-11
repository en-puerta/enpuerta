import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { EventDetailComponent } from './components/event-detail/event-detail';
import { BookingFormComponent } from './components/booking-form/booking-form';
import { BookingConfirmedComponent } from './components/booking-confirmed/booking-confirmed';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'e/:alias', component: EventDetailComponent },
  { path: 'e/:alias/f/:functionId/booking', component: BookingFormComponent },
  { path: 'booking/:eventId/:functionId/:bookingId/confirmed', component: BookingConfirmedComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
