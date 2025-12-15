import { NgModule, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, registerLocaleData } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import localeEs from '@angular/common/locales/es-AR';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HomeComponent } from './components/home/home';
import { EventDetailComponent } from './components/event-detail/event-detail';
import { BookingFormComponent } from './components/booking-form/booking-form';
import { BookingConfirmedComponent } from './components/booking-confirmed/booking-confirmed';
import { HeaderComponent } from './components/header/header';
import { EventCardComponent } from './components/event-card/event-card';
import { EventListComponent } from './components/event-list/event-list';
import { FunctionListComponent } from './components/function-list/function-list';
import { BookingSummaryComponent } from './components/booking-summary/booking-summary';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner';
import { FooterComponent } from './components/footer/footer';

// Register Spanish locale
registerLocaleData(localeEs);

@NgModule({
  declarations: [
    App,
    HomeComponent,
    EventDetailComponent,
    BookingFormComponent,
    BookingConfirmedComponent,
    HeaderComponent,
    EventCardComponent,
    EventListComponent,
    FunctionListComponent,
    BookingSummaryComponent,
    LoadingSpinnerComponent,
    FooterComponent
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
    provideAuth(() => getAuth()),
    { provide: LOCALE_ID, useValue: 'es-AR' }
  ],
  bootstrap: [App]
})
export class AppModule { }
