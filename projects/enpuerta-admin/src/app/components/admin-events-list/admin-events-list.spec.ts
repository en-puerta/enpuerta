import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventsList } from './admin-events-list';

describe('AdminEventsList', () => {
  let component: AdminEventsList;
  let fixture: ComponentFixture<AdminEventsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminEventsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEventsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
