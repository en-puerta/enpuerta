import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLiveView } from './admin-live-view';

describe('AdminLiveView', () => {
  let component: AdminLiveView;
  let fixture: ComponentFixture<AdminLiveView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminLiveView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminLiveView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
