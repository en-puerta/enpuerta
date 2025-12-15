import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLogin } from './components/admin-login/admin-login';
import { AdminEventsList } from './components/admin-events-list/admin-events-list';
import { AdminEventForm } from './components/admin-event-form/admin-event-form';
import { AdminFunctionsList } from './components/admin-functions-list/admin-functions-list';
import { AdminFunctionForm } from './components/admin-function-form/admin-function-form';
import { AdminBookingsList } from './components/admin-bookings-list/admin-bookings-list';
import { AdminLiveView } from './components/admin-live-view/admin-live-view';
import { AdminFunctionStats } from './components/admin-function-stats/admin-function-stats';
import { AuthGuard, MaintenanceComponent, NotFoundComponent } from '@enpuerta/shared';

const routes: Routes = [
  { path: 'login', component: AdminLogin },
  { path: 'maintenance', component: MaintenanceComponent },
  { path: 'events', component: AdminEventsList, canActivate: [AuthGuard] },
  { path: 'events/new', component: AdminEventForm, canActivate: [AuthGuard] },
  { path: 'events/:eventId/edit', component: AdminEventForm, canActivate: [AuthGuard] },
  { path: 'events/:eventId/functions', component: AdminFunctionsList, canActivate: [AuthGuard] },
  { path: 'events/:eventId/functions/new', component: AdminFunctionForm, canActivate: [AuthGuard] },
  { path: 'events/:eventId/functions/:functionId/edit', component: AdminFunctionForm, canActivate: [AuthGuard] },
  { path: 'events/:eventId/functions/:functionId/bookings', component: AdminBookingsList, canActivate: [AuthGuard] },
  { path: 'events/:eventId/functions/:functionId/live', component: AdminLiveView, canActivate: [AuthGuard] },
  { path: 'events/:eventId/functions/:functionId/stats', component: AdminFunctionStats, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent } // 404 - Must be last
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
