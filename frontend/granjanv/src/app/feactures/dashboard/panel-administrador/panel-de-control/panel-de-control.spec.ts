import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDeControl } from './panel-de-control';

describe('PanelDeControl', () => {
  let component: PanelDeControl;
  let fixture: ComponentFixture<PanelDeControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelDeControl],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelDeControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
