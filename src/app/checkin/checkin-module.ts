import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { CheckinRoutingModule } from './checkin-routing-module';
import { Checkin } from './checkin';
import { CheckinScanner } from './components/checkin-scanner/checkin-scanner';
import { CheckinSummary } from './components/checkin-summary/checkin-summary';


@NgModule({
  declarations: [
    Checkin,
    CheckinScanner,
    CheckinSummary
  ],
  imports: [
    CommonModule,
    CheckinRoutingModule,
    ZXingScannerModule
  ]
})
export class CheckinModule { }
