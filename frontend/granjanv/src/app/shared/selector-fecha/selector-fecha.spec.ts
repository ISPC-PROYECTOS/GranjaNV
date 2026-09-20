import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorFecha } from './selector-fecha';

describe('SelectorFecha', () => {
  let component: SelectorFecha;
  let fixture: ComponentFixture<SelectorFecha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorFecha],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorFecha);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
