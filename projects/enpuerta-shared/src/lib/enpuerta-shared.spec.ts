import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnpuertaShared } from './enpuerta-shared';

describe('EnpuertaShared', () => {
  let component: EnpuertaShared;
  let fixture: ComponentFixture<EnpuertaShared>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnpuertaShared]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnpuertaShared);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
