import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reportes } from './reportes';

describe('Reportes', () => {
  let component: Reportes;
  let fixture: ComponentFixture<Reportes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reportes],
    }).compileComponents();

    fixture = TestBed.createComponent(Reportes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
