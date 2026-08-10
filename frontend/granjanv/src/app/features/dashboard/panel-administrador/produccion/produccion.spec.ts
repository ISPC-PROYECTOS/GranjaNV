import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Produccion } from './produccion';

describe('Produccion', () => {
  let component: Produccion;
  let fixture: ComponentFixture<Produccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Produccion],
    }).compileComponents();

    fixture = TestBed.createComponent(Produccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
