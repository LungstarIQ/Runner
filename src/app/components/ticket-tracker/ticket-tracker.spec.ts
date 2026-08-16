import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketTracker } from './ticket-tracker';

describe('TicketTracker', () => {
  let component: TicketTracker;
  let fixture: ComponentFixture<TicketTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTracker],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
