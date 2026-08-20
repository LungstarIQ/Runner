import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseRunners } from './browse-runners';

describe('BrowseRunners', () => {
  let component: BrowseRunners;
  let fixture: ComponentFixture<BrowseRunners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseRunners],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseRunners);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
