import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFunctionForm } from './admin-function-form';

describe('AdminFunctionForm', () => {
  let component: AdminFunctionForm;
  let fixture: ComponentFixture<AdminFunctionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminFunctionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFunctionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
