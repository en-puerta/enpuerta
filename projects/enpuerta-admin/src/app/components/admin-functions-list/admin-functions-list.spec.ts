import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFunctionsList } from './admin-functions-list';

describe('AdminFunctionsList', () => {
  let component: AdminFunctionsList;
  let fixture: ComponentFixture<AdminFunctionsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminFunctionsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFunctionsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
