import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckinLandingComponent } from './components/checkin-landing/checkin-landing';
import { CheckinScanner } from './components/checkin-scanner/checkin-scanner';
import { CheckinSummary } from './components/checkin-summary/checkin-summary';
import { AuthGuard } from '@enpuerta/shared';

const routes: Routes = [
  { path: '', component: CheckinLandingComponent },
  { path: ':eventId/:functionId', component: CheckinScanner, canActivate: [AuthGuard] },
  { path: ':eventId/:functionId/summary', component: CheckinSummary, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
