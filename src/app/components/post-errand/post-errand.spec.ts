import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostErrand } from './post-errand';

describe('PostErrand', () => {
  let component: PostErrand;
  let fixture: ComponentFixture<PostErrand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostErrand],
    }).compileComponents();

    fixture = TestBed.createComponent(PostErrand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
