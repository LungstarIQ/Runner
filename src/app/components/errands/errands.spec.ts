import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Errands } from './errands';

describe('Errands', () => {
  let component: Errands;
  let fixture: ComponentFixture<Errands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Errands],
    }).compileComponents();

    fixture = TestBed.createComponent(Errands);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
