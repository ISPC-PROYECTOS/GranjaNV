import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosProduccion } from './datos-produccion';

describe('DatosProduccion', () => {
  let component: DatosProduccion;
  let fixture: ComponentFixture<DatosProduccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosProduccion],
    }).compileComponents();

    fixture = TestBed.createComponent(DatosProduccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
