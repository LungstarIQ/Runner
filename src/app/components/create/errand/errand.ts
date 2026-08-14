import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrandService } from '../../../services/errand.service';
import { CreateErrandRequest, ErrandCategory } from '../../../models/errand.model';
import { Address } from '../../../models/address.model';
import { PaymentMethod } from '../../../models/payment.model';
import { CATEGORY_LABELS } from '../../../constants/errand.constant';
 
// Not in shared/constants.ts (that file only has category/status labels) --
// kept local since it's purely a display concern for this form. Move it
// into constants.ts if another screen ends up needing it too.
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash on delivery',
  SNAPSCAN: 'SnapScan',
  CARD: 'Card',
};

@Component({
  selector: 'app-errand',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './errand.html',
  styleUrl: './errand.scss',
})
export class Errand {
  private readonly fb = inject(FormBuilder);
  private readonly errandService = inject(ErrandService);
  private readonly router = inject(Router);
 
  readonly categories = Object.keys(CATEGORY_LABELS) as ErrandCategory[];
  readonly categoryLabels = CATEGORY_LABELS;
 
  readonly paymentMethods: PaymentMethod[] = ['CASH', 'SNAPSCAN', 'CARD'];
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;
 
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
 
  private readonly addressGroup = () =>
    this.fb.nonNullable.group({
      line1: ['', Validators.required],
      suburb: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
      // ASSUMPTION: no geocoding service yet to turn the typed address
      // into lat/lng -- zeroed out for now. Wire up a real geocoder
      // (Google Places, OpenCage, etc.) before this goes anywhere near
      // production, since distanceKm on the feed depends on this.
      lat: [0],
      lng: [0],
    });
 
  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: this.fb.nonNullable.control<ErrandCategory>('QUEUES', Validators.required),
    pickupAddress: this.addressGroup(),
    dropoffAddress: this.addressGroup(),
    fare: this.fb.nonNullable.control<number>(0, [Validators.required, Validators.min(1)]),
    deadlineAt: [''], // datetime-local string, converted to ISO on submit
    paymentMethod: this.fb.nonNullable.control<PaymentMethod>('CASH'),
  });
 
  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.submitting.set(true);
    this.submitError.set(null);
 
    const raw = this.form.getRawValue();
    const request: CreateErrandRequest = {
      title: raw.title,
      description: raw.description,
      category: raw.category,
      pickupAddress: raw.pickupAddress as Address,
      dropoffAddress: raw.dropoffAddress as Address,
      fare: raw.fare,
      deadlineAt: raw.deadlineAt ? new Date(raw.deadlineAt).toISOString() : undefined,
      paymentMethod: raw.paymentMethod,
    };
 
    try {
      const created = await this.errandService.create(request);
      this.router.navigate(['/errands', created.errandId]);
    } catch {
      this.submitError.set("Couldn't post that errand. Check your connection and try again.");
    } finally {
      this.submitting.set(false);
    }
  }
}
