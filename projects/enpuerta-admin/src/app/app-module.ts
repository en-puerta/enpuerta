import { NgModule, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, registerLocaleData } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import localeEsAr from '@angular/common/locales/es-AR';

// Register Spanish locale
registerLocaleData(localeEsAr);

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
import { MaintenanceComponent, NotFoundComponent } from '@enpuerta/shared';

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
    MaintenanceComponent,
    NotFoundComponent,
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
