import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { CheckinLandingComponent } from './components/checkin-landing/checkin-landing';
import { CheckinScanner } from './components/checkin-scanner/checkin-scanner';
import { CheckinSummary } from './components/checkin-summary/checkin-summary';

@NgModule({
  declarations: [
    App,
    CheckinLandingComponent,
    CheckinScanner,
    CheckinSummary
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ZXingScannerModule
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
