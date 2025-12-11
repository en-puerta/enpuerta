import { TestBed } from '@angular/core/testing';

import { Function } from './function';

describe('Function', () => {
  let service: Function;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Function);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
