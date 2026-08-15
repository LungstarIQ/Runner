import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevSetup } from './dev-setup';

describe('DevSetup', () => {
  let component: DevSetup;
  let fixture: ComponentFixture<DevSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevSetup],
    }).compileComponents();

    fixture = TestBed.createComponent(DevSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
