import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PanelProduccion } from './panel-produccion';

describe('PanelProduccion', () => {
  let component: PanelProduccion;
  let fixture: ComponentFixture<PanelProduccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelProduccion],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PanelProduccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});