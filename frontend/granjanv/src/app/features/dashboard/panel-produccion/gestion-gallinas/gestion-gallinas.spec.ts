import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionGallinas } from './gestion-gallinas';

describe('GestionGallinas', () => {
  let component: GestionGallinas;
  let fixture: ComponentFixture<GestionGallinas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionGallinas],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionGallinas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
