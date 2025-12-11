import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { AdminLogin } from './components/admin-login/admin-login';
import { AdminEventsList } from './components/admin-events-list/admin-events-list';
import { AdminEventForm } from './components/admin-event-form/admin-event-form';
import { AdminFunctionsList } from './components/admin-functions-list/admin-functions-list';
import { AdminFunctionForm } from './components/admin-function-form/admin-function-form';
import { AdminBookingsList } from './components/admin-bookings-list/admin-bookings-list';
import { AdminLiveView } from './components/admin-live-view/admin-live-view';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar';
import { AdminTopbarComponent } from './components/admin-topbar/admin-topbar';
import { StatusBadgeComponent } from './components/status-badge/status-badge';
import { MetricCardComponent } from './components/metric-card/metric-card';

@NgModule({
  declarations: [
    App,
    AdminLogin,
    AdminEventsList,
    AdminEventForm,
    AdminFunctionsList,
    AdminFunctionForm,
    AdminBookingsList,
    AdminLiveView,
    AdminSidebarComponent,
    AdminTopbarComponent,
    StatusBadgeComponent,
    MetricCardComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ],
  bootstrap: [App]
})
export class AppModule { }
