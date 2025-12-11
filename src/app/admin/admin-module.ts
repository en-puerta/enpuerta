import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing-module';
import { Admin } from './admin';
import { AdminLogin } from './components/admin-login/admin-login';
import { AdminEventsList } from './components/admin-events-list/admin-events-list';
import { AdminEventForm } from './components/admin-event-form/admin-event-form';
import { AdminFunctionsList } from './components/admin-functions-list/admin-functions-list';
import { AdminFunctionForm } from './components/admin-function-form/admin-function-form';
import { AdminBookingsList } from './components/admin-bookings-list/admin-bookings-list';
import { AdminLiveView } from './components/admin-live-view/admin-live-view';


@NgModule({
  declarations: [
    Admin,
    AdminLogin,
    AdminEventsList,
    AdminEventForm,
    AdminFunctionsList,
    AdminFunctionForm,
    AdminBookingsList,
    AdminLiveView
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class AdminModule { }
