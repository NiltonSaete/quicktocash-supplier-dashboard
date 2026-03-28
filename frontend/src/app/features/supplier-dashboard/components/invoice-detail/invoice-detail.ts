import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { firstValueFrom, race, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AlertService } from '../../../../core/services/alert.service';
import { Invoice } from '../../models/invoice.model';
import { EarlyPaymentEligibility } from '../../models/early-payment.model';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-detail',
  standalone: false,
  templateUrl: './invoice-detail.html',
  styleUrls: ['./invoice-detail.scss']
})
export class InvoiceDetailComponent implements OnChanges {
  readonly statusLabels: Record<string, string> = {
    Pending: 'Pending',
    Approved: 'Approved',
    Funded: 'Funded',
    Rejected: 'Rejected',
  };

  private latestEligibilityRequestId = 0;
  @Input({ required: true }) invoice!: Invoice;

  @Output() close = new EventEmitter<void>();

  eligibility: EarlyPaymentEligibility | null = null;
  isLoadingEligibility = false;
  isSubmitting = false;
  showConfirmation = false;

  constructor(
    private invoiceService: InvoiceService,
    private alertService: AlertService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoice']?.currentValue) {
      queueMicrotask(() => {
        if (this.invoice === changes['invoice'].currentValue) {
          void this.loadEligibility();
        }
      });
    }
  }

  requestEarlyPayment(): void {
    this.showConfirmation = true;
  }

  confirmRequest(): void {
    this.isSubmitting = true;
    this.invoiceService.submitEarlyPaymentRequest(this.invoice.invoiceId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showConfirmation = false;
        this.alertService.success('Early payment request submitted successfully.');
      },
      error: () => {
        this.isSubmitting = false;
        this.showConfirmation = false;
        this.alertService.error('Failed to submit request. Please try again.');
      }
    });
  }

  cancelConfirmation(): void {
    this.showConfirmation = false;
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  private async loadEligibility(): Promise<void> {
    const requestId = ++this.latestEligibilityRequestId;
    const invoiceId = this.invoice?.invoiceId;

    this.showConfirmation = false;
    this.isLoadingEligibility = true;

    console.log('[InvoiceDetail] loadEligibility called:', {
      invoiceId,
      hasInvoice: !!this.invoice,
    });

    if (!invoiceId) {
      console.warn('[InvoiceDetail] Missing invoiceId, skipping eligibility request.');
      this.eligibility = this.createUnavailableEligibility('Invoice details are incomplete.');
      this.isLoadingEligibility = false;
      return;
    }

    this.eligibility = null;

    console.log('[InvoiceDetail] Starting eligibility request:', {
      invoiceId,
      url: `http://localhost:5196/api/invoices/${invoiceId}/early-payment-eligibility`,
    });

    try {
      const result = await firstValueFrom(
        race(
          this.invoiceService.checkEligibility(invoiceId),
          timer(8000).pipe(
            mergeMap(() => {
              throw new Error('The eligibility request timed out. Please try again.');
            }),
          ),
        ),
      );

      if (requestId !== this.latestEligibilityRequestId) {
        return;
      }

      console.log('[InvoiceDetail] Eligibility response received:', {
        invoiceId,
        result,
      });
      this.eligibility = result;
    } catch (error) {
      if (requestId !== this.latestEligibilityRequestId) {
        return;
      }

      const typedError = error as Error | HttpErrorResponse;
      console.error('[InvoiceDetail] Eligibility request failed:', {
        invoiceId,
        status: typedError instanceof HttpErrorResponse ? typedError.status : undefined,
        message: typedError.message,
        error: typedError instanceof HttpErrorResponse ? typedError.error : typedError,
      });
      const message = this.getEligibilityErrorMessage(typedError);
      this.eligibility = this.createUnavailableEligibility(message);
      this.alertService.warning(message);
    } finally {
      if (requestId === this.latestEligibilityRequestId) {
        this.isLoadingEligibility = false;
      }
    }
  }

  private getEligibilityErrorMessage(error: Error | HttpErrorResponse): string {
    if (error instanceof HttpErrorResponse) {
      const apiErrors = error.error?.errors;

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        return apiErrors[0];
      }

      if (typeof error.error?.message === 'string' && error.error.message.trim()) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Unable to load early payment eligibility right now.';
  }

  private createUnavailableEligibility(reason: string): EarlyPaymentEligibility {
    return {
      isEligible: false,
      disbursementAmount: 0,
      fee: 0,
      earlyByDays: 0,
      reason
    };
  }
}
