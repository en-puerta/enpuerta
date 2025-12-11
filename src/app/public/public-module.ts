import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PublicRoutingModule } from './public-routing-module';
import { Public } from './public';
import { Home } from './components/home/home';
import { EventDetail } from './components/event-detail/event-detail';
import { BookingForm } from './components/booking-form/booking-form';
import { BookingConfirmed } from './components/booking-confirmed/booking-confirmed';


@NgModule({
  declarations: [
    Public,
    Home,
    EventDetail,
    BookingForm,
    BookingConfirmed
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class PublicModule { }
