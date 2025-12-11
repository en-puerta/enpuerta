import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBookingsList } from './admin-bookings-list';

describe('AdminBookingsList', () => {
  let component: AdminBookingsList;
  let fixture: ComponentFixture<AdminBookingsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminBookingsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBookingsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
