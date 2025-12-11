import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Checkin } from './checkin';
import { CheckinScanner } from './components/checkin-scanner/checkin-scanner';
import { CheckinSummary } from './components/checkin-summary/checkin-summary';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: Checkin },
  { path: ':functionId', component: CheckinScanner, canActivate: [AuthGuard] },
  { path: ':functionId/summary', component: CheckinSummary, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckinRoutingModule { }
