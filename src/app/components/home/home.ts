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
import { RoleSessionService } from '../../services/role-session.service';
import { extractApiError } from '../../utils/api-error.util';

type WalletActionKind = 'topup' | 'withdraw';
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
  private readonly roleSession = inject(RoleSessionService);
 
  readonly today = new Date();
  readonly activeRole = this.roleSession.activeRole;
 
  // NOTE: still no GET /errands/mine (or similar) on the backend, and no
  // way to tell "the errand I posted" apart from "the errand I claimed"
  // since both just live in this one shared signal -- this stays null on
  // a fresh load until the user views/claims/creates an errand elsewhere,
  // same gap as before, now on both sides of the role switch.
  readonly activeErrand = this.errandService.activeErrand;
  readonly statusLabels = ERRAND_STATUS_LABELS;
 
  readonly hasCustomer = this.devSession.customerId;
  readonly hasRunner = this.devSession.runnerId;
 
  readonly customer = signal<CustomerModel | null>(null);
  readonly runner = signal<RunnerModel | null>(null);
  readonly customerWalletBalance = signal<number | null>(null);
  readonly runnerWalletBalance = signal<number | null>(null);
 
  readonly walletActionOpen = signal<WalletActionKind | null>(null);
  readonly walletAmount = signal<number>(0);
  readonly walletActionError = signal<string | null>(null);
  readonly walletActionBusy = signal(false);
 
  async ngOnInit(): Promise<void> {
    const customerId = this.devSession.customerId();
    if (customerId) {
      const customer = await this.customerService.getById(customerId);
      this.customer.set(customer);
      const account = await this.bankAccountService.getById(customer.bankAccountId);
      this.customerWalletBalance.set(account.balance);
    }
 
    const runnerId = this.devSession.runnerId();
    if (runnerId) {
      const runner = await this.runnerService.getById(runnerId);
      this.runner.set(runner);
      const account = await this.bankAccountService.getById(runner.bankAccountId);
      this.runnerWalletBalance.set(account.balance);
    }
  }
 
  openWalletAction(kind: WalletActionKind): void {
    this.walletActionOpen.set(kind);
    this.walletAmount.set(0);
    this.walletActionError.set(null);
  }
 
  closeWalletAction(): void {
    this.walletActionOpen.set(null);
  }
 
  setWalletAmount(event: Event): void {
    this.walletAmount.set(Number((event.target as HTMLInputElement).value));
  }
 
  async confirmWalletAction(): Promise<void> {
    const kind = this.walletActionOpen();
    const amount = this.walletAmount();
    if (!kind || !amount || amount <= 0) return;
 
    const isCustomer = this.activeRole() === 'customer';
    const accountId = isCustomer ? this.customer()?.bankAccountId : this.runner()?.bankAccountId;
    if (!accountId) return;
 
    this.walletActionBusy.set(true);
    this.walletActionError.set(null);
    try {
      const account =
        kind === 'topup'
          ? await this.bankAccountService.deposit(accountId, amount)
          : await this.bankAccountService.withdraw(accountId, amount);
 
      if (isCustomer) {
        this.customerWalletBalance.set(account.balance);
      } else {
        this.runnerWalletBalance.set(account.balance);
      }
      this.walletActionOpen.set(null);
    } catch (err) {
      this.walletActionError.set(extractApiError(err, "Couldn't process that."));
    } finally {
      this.walletActionBusy.set(false);
    }
  }
}
