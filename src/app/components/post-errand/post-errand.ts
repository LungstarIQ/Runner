import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrandService } from '../../services/errand.service';
import { DevSessionService } from '../../services/dev-session.service';
import { CreateErrandRequest } from '../../models/errand.model';
import { LocationModel } from '../../models/location.model';
import { ERRAND_CATEGORIES } from '../../constants/errand.constant';

@Component({
  selector: 'app-post-errand',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './post-errand.html',
  styleUrl: './post-errand.scss',
})
export class PostErrand {
  private readonly fb = inject(FormBuilder);
  private readonly errandService = inject(ErrandService);
  private readonly devSession = inject(DevSessionService);
  private readonly router = inject(Router);
 
  readonly categories = ERRAND_CATEGORIES;
 
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
 
  // No customer set up yet -- the form still renders (so the layout is
  // reviewable), but submit() below refuses to fire without an id.
  readonly hasCustomer = this.devSession.customerId;
 
  private readonly locationGroup = () =>
    this.fb.nonNullable.group({
      addressLine: ['', Validators.required],
      suburb: ['', Validators.required],
      city: ['', Validators.required],
      // ASSUMPTION: no geocoding service yet -- zeroed out for now, same
      // as before. Wire up a real geocoder before this goes anywhere near
      // production.
      latitude: [0],
      longitude: [0],
    });
 
  readonly form = this.fb.nonNullable.group({
    description: ['', Validators.required],
    category: this.fb.nonNullable.control<string>('Queues'),
    pickupLocation: this.locationGroup(),
    dropoffLocation: this.locationGroup(),
    payoutAmount: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(1)]),
  });
 
  async submit(): Promise<void> {
    const customerId = this.devSession.customerId();
    if (!customerId) {
      this.submitError.set('No test customer set up yet — create one in dev setup first.');
      return;
    }
 
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.submitting.set(true);
    this.submitError.set(null);
 
    const raw = this.form.getRawValue();
    const request: CreateErrandRequest = {
      description: raw.description,
      category: raw.category,
      payoutAmount: raw.payoutAmount,
      pickupLocation: raw.pickupLocation as LocationModel,
      dropoffLocation: raw.dropoffLocation as LocationModel,
    };
 
    try {
      const created = await this.errandService.create(customerId, request);
      this.router.navigate(['/errands', created.id]);
    } catch {
      this.submitError.set("Couldn't post that errand. Check your connection and try again.");
    } finally {
      this.submitting.set(false);
    }
  }
}
