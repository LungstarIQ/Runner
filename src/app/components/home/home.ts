import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ErrandService } from '../../services/errand.service';
import { CustomerService } from '../../services/customer.service';
import { RunnerService } from '../../services/runner.service';
import { BankAccountService } from '../../services/bank-account.service';
import { DevSessionService } from '../../services/dev-session.service';
import { ERRAND_STATUS_LABELS } from '../../constants/errand.constant';
import { CustomerModel } from '../../models/customer.model';
import { RunnerModel } from '../../models/runner.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly errandService = inject(ErrandService);
  private readonly customerService = inject(CustomerService);
  private readonly runnerService = inject(RunnerService);
  private readonly bankAccountService = inject(BankAccountService);
  private readonly devSession = inject(DevSessionService);
 
  readonly today = new Date();
 
  // Still no GET /errands/mine (or similar) on the backend -- this stays
  // null on a fresh load until the user views/claims/creates an errand
  // elsewhere in the app, same gap as before.
  readonly activeErrand = this.errandService.activeErrand;
  readonly statusLabels = ERRAND_STATUS_LABELS;
 
  readonly hasCustomer = this.devSession.customerId;
  readonly customer = signal<CustomerModel | null>(null);
  readonly runner = signal<RunnerModel | null>(null);
  readonly walletBalance = signal<number | null>(null);
 
  async ngOnInit(): Promise<void> {
    const customerId = this.devSession.customerId();
    if (customerId) {
      const customer = await this.customerService.getById(customerId);
      this.customer.set(customer);
      const account = await this.bankAccountService.getById(customer.bankAccountId);
      this.walletBalance.set(account.balance);
    }
 
    const runnerId = this.devSession.runnerId();
    if (runnerId) {
      this.runner.set(await this.runnerService.getById(runnerId));
    }
  }
}
