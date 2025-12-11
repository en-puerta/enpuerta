import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Public } from './public';
import { HomeComponent } from './components/home/home';
import { EventDetailComponent } from './components/event-detail/event-detail';
import { BookingFormComponent } from './components/booking-form/booking-form';
import { BookingConfirmedComponent } from './components/booking-confirmed/booking-confirmed';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'e/:alias', component: EventDetailComponent },
  { path: 'e/:alias/book/:functionId', component: BookingFormComponent },
  { path: 'booking/:bookingId/confirmed', component: BookingConfirmedComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
