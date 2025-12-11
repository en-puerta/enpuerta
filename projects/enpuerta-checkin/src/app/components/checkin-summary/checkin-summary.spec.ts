import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckinSummary } from './checkin-summary';

describe('CheckinSummary', () => {
  let component: CheckinSummary;
  let fixture: ComponentFixture<CheckinSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckinSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckinSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
