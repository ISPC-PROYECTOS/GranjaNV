import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroIncidentes } from './registro-incidentes';

describe('RegistroIncidentes', () => {
  let component: RegistroIncidentes;
  let fixture: ComponentFixture<RegistroIncidentes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroIncidentes],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroIncidentes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
