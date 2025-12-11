import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLogin } from './components/admin-login/admin-login';
import { AdminEventsList } from './components/admin-events-list/admin-events-list';
import { AdminEventForm } from './components/admin-event-form/admin-event-form';
import { AdminFunctionsList } from './components/admin-functions-list/admin-functions-list';
import { AdminFunctionForm } from './components/admin-function-form/admin-function-form';
import { AdminBookingsList } from './components/admin-bookings-list/admin-bookings-list';
import { AdminLiveView } from './components/admin-live-view/admin-live-view';

const routes: Routes = [
  { path: 'login', component: AdminLogin },
  { path: 'events', component: AdminEventsList },
  { path: 'events/new', component: AdminEventForm },
  { path: 'events/:eventId/edit', component: AdminEventForm },
  { path: 'events/:eventId/functions', component: AdminFunctionsList },
  { path: 'events/:eventId/functions/new', component: AdminFunctionForm },
  { path: 'functions/:functionId/edit', component: AdminFunctionForm },
  { path: 'functions/:functionId/bookings', component: AdminBookingsList },
  { path: 'functions/:functionId/live', component: AdminLiveView },
  { path: '', redirectTo: 'events', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
