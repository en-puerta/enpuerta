import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionList } from './function-list';

describe('FunctionList', () => {
  let component: FunctionList;
  let fixture: ComponentFixture<FunctionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FunctionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunctionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
