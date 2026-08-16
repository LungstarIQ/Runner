import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseErrands } from './browse-errands';

describe('BrowseErrands', () => {
  let component: BrowseErrands;
  let fixture: ComponentFixture<BrowseErrands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseErrands],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseErrands);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
