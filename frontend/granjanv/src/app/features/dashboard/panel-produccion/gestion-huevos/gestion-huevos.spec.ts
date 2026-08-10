import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionHuevos } from './gestion-huevos';

describe('GestionHuevos', () => {
  let component: GestionHuevos;
  let fixture: ComponentFixture<GestionHuevos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionHuevos],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionHuevos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
