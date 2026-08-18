import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ErrandService } from '../../services/errand.service';
import { DevSessionService } from '../../services/dev-session.service';
import { ErrandStatus } from '../../models/errand.model';
import { TransactionModel } from '../../models/transaction.model';
import { ERRAND_STATUS_ORDER, ERRAND_STATUS_LABELS, NEXT_EVENT_FOR_STATUS, CANCEL_EVENT_FOR_STATUS, PRIMARY_ACTION_LABELS, BRANCH_STATUSES } from '../../constants/errand.constant';

@Component({
  selector: 'app-ticket-tracker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ticket-tracker.html',
  styleUrl: './ticket-tracker.scss',
})
export class TicketTracker implements OnInit {
  
  private readonly route = inject(ActivatedRoute);
  private readonly errandService = inject(ErrandService);
  private readonly devSession = inject(DevSessionService);
 
  // Shared with the dashboard -- claiming/transitioning here updates that
  // screen's active-ticket card too, without a refetch.
  readonly errand = this.errandService.activeErrand;
 
  readonly statusOrder = ERRAND_STATUS_ORDER;
  readonly statusLabels = ERRAND_STATUS_LABELS;
  readonly primaryLabels = PRIMARY_ACTION_LABELS;
 
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly acting = signal(false);
  readonly polling = signal(false);
 
  readonly transactions = signal<TransactionModel[]>([]);
 
  readonly reviewRating = signal(5);
  readonly reviewComment = signal('');
  readonly reviewSubmitted = signal(false);
  readonly refunded = signal(false);
 
  readonly isBranch = computed(() => {
    const errand = this.errand();
    return errand ? BRANCH_STATUSES.includes(errand.status) : false;
  });
 
  readonly stepIndex = computed(() => {
    const errand = this.errand();
    if (!errand) return -1;
    return this.statusOrder.indexOf(errand.status);
  });
 
  readonly hasPrimaryAction = computed(() => {
    const errand = this.errand();
    if (!errand) return false;
    return errand.status === 'POSTED' || !!NEXT_EVENT_FOR_STATUS[errand.status];
  });
 
  readonly canReportIssue = computed(() => {
    const errand = this.errand();
    return errand ? !!CANCEL_EVENT_FOR_STATUS[errand.status] : false;
  });
 
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError.set('No errand id in the route.');
      this.loading.set(false);
      return;
    }
    await this.load(id);
  }
 
  private async load(id: string): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const errand = await this.errandService.getById(id);
      if (errand.status === 'COMPLETED') {
        this.transactions.set(await this.errandService.getTransactions(id));
      }
    } catch {
      this.loadError.set("Couldn't load that ticket.");
    } finally {
      this.loading.set(false);
    }
  }
 
  async primaryAction(): Promise<void> {
    const errand = this.errand();
    if (!errand) return;
 
    this.acting.set(true);
    this.actionError.set(null);
    try {
      if (errand.status === 'POSTED') {
        const runnerId = this.devSession.runnerId();
        if (!runnerId) {
          this.actionError.set('No test runner set up yet — create one in dev setup to claim this.');
          return;
        }
        await this.errandService.claim(errand.id, runnerId);
        return;
      }
 
      const event = NEXT_EVENT_FOR_STATUS[errand.status];
      if (!event) return;
 
      const updated = await this.errandService.transition(errand.id, event);
 
      // The second INITIATE_PAYMENT call returns PROCESSING_PAYMENT
      // immediately -- the real COMPLETED/DISPUTED/PAYMENT_FAILED outcome
      // happens moments later on a background thread. Poll until it settles.
      if (updated.status === 'PROCESSING_PAYMENT') {
        this.polling.set(true);
        const settled = await this.errandService.pollUntilSettled(errand.id);
        this.polling.set(false);
        if (settled.status === 'COMPLETED') {
          this.transactions.set(await this.errandService.getTransactions(errand.id));
        }
      }
    } catch {
      this.actionError.set("That action didn't go through. Try again.");
    } finally {
      this.acting.set(false);
    }
  }
 
  async reportIssue(): Promise<void> {
    const errand = this.errand();
    if (!errand) return;
    const event = CANCEL_EVENT_FOR_STATUS[errand.status];
    if (!event) return;
 
    this.acting.set(true);
    this.actionError.set(null);
    try {
      await this.errandService.transition(errand.id, event);
    } catch {
      this.actionError.set("Couldn't report that. Try again.");
    } finally {
      this.acting.set(false);
    }
  }
 
  setRating(value: number): void {
    this.reviewRating.set(value);
  }
 
  setComment(event: Event): void {
    this.reviewComment.set((event.target as HTMLTextAreaElement).value);
  }
 
  async submitReview(): Promise<void> {
    const errand = this.errand();
    if (!errand) return;
    this.acting.set(true);
    this.actionError.set(null);
    try {
      await this.errandService.submitReview(errand.id, {
        rating: this.reviewRating(),
        comment: this.reviewComment(),
      });
      this.reviewSubmitted.set(true);
    } catch {
      this.actionError.set("Couldn't submit that review.");
    } finally {
      this.acting.set(false);
    }
  }
 
  async requestRefund(): Promise<void> {
    const errand = this.errand();
    if (!errand) return;
    this.acting.set(true);
    this.actionError.set(null);
    try {
      await this.errandService.refund(errand.id);
      this.transactions.set(await this.errandService.getTransactions(errand.id));
      this.refunded.set(true);
    } catch {
      this.actionError.set("Couldn't process that refund.");
    } finally {
      this.acting.set(false);
    }
  }
}
