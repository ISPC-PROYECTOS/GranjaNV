import { TestBed } from '@angular/core/testing';

import { Gastos } from './gastos';

describe('Gastos', () => {
  let service: Gastos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gastos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
