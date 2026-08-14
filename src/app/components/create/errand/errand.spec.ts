import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Errand } from './errand';

describe('Errand', () => {
  let component: Errand;
  let fixture: ComponentFixture<Errand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Errand],
    }).compileComponents();

    fixture = TestBed.createComponent(Errand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
