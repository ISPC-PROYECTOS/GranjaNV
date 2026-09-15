import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { CrearClienteComponent } from './crear-cliente';

describe('CrearClienteComponent', () => {
  let component: CrearClienteComponent;
  let fixture: ComponentFixture<CrearClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearClienteComponent],
      providers: [provideHttpClient()] 
    }).compileComponents();

    fixture = TestBed.createComponent(CrearClienteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});