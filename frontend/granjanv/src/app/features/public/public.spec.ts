import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Public } from './public';

describe('Public', () => {
  let component: Public;
  let fixture: ComponentFixture<Public>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Public],
    }).compileComponents();

    fixture = TestBed.createComponent(Public);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
