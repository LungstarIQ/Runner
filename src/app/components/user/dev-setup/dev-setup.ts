import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { RunnerService } from '../../../services/runner.service';
import { DevSessionService } from '../../../services/dev-session.service';
import { TransportMode } from '../../../models/runner.model';

type SetupTab = 'customer' | 'runner';

@Component({
  selector: 'app-dev-setup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dev-setup.html',
  styleUrl: './dev-setup.scss',
})
export class DevSetup {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly runnerService = inject(RunnerService);
  private readonly devSession = inject(DevSessionService);
 
  readonly tab = signal<SetupTab>('customer');
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
 
  readonly transportModes: TransportMode[] = ['WALK', 'BICYCLE', 'MOTORBIKE', 'CAR'];
 
  // Existing ids, if this browser already has one stashed -- shown so it's
  // obvious you don't need to re-create one every time you reload.
  readonly existingCustomerId = this.devSession.customerId;
  readonly existingRunnerId = this.devSession.runnerId;
 
  readonly customerForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
  });
 
  readonly runnerForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    transportMode: this.fb.nonNullable.control<TransportMode>('WALK', Validators.required),
  });
 
  setTab(tab: SetupTab): void {
    this.tab.set(tab);
    this.submitError.set(null);
  }
 
  async createCustomer(): Promise<void> {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    try {
      const raw = this.customerForm.getRawValue();
      const customer = await this.customerService.create({
        fullName: raw.fullName,
        email: raw.email,
        phoneNumber: raw.phoneNumber || undefined,
      });
      this.devSession.setCustomerId(customer.id);
    } catch {
      this.submitError.set("Couldn't create that customer. Check the backend is running.");
    } finally {
      this.submitting.set(false);
    }
  }
 
  async createRunner(): Promise<void> {
    if (this.runnerForm.invalid) {
      this.runnerForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    try {
      const raw = this.runnerForm.getRawValue();
      const runner = await this.runnerService.create({
        fullName: raw.fullName,
        email: raw.email,
        phoneNumber: raw.phoneNumber || undefined,
        transportMode: raw.transportMode,
      });
      this.devSession.setRunnerId(runner.id);
    } catch {
      this.submitError.set("Couldn't create that runner. Check the backend is running.");
    } finally {
      this.submitting.set(false);
    }
  }
}
