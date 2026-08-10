import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroUsuario } from './registro-usuario';

describe('RegistroUsuario', () => {
  let component: RegistroUsuario;
  let fixture: ComponentFixture<RegistroUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
