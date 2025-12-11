import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinScanner } from './checkin-scanner';

describe('CheckinScanner', () => {
  let component: CheckinScanner;
  let fixture: ComponentFixture<CheckinScanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckinScanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckinScanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
