import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { finalize, timeout } from 'rxjs/operators';
import { Invoice } from '../../models/invoice.model';
import { EarlyPaymentEligibility } from '../../models/early-payment.model';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './invoice-detail.html',
  styleUrls: ['./invoice-detail.scss']
})
export class InvoiceDetailComponent {
  readonly statusLabels: Record<string, string> = {
    Pending: 'Pending',
    Approved: 'Approved',
    Funded: 'Funded',
    Rejected: 'Rejected',
  };

  private _invoice!: Invoice;
  private eligibilityLoadTimer: ReturnType<typeof setTimeout> | null = null;

  @Input() set invoice(value: Invoice) {
    this._invoice = value;
    console.log('[InvoiceDetail] invoice input received:', {
      invoiceId: value?.invoiceId,
      invoiceNumber: value?.invoiceNumber,
      status: value?.status,
    });
    if (this.eligibilityLoadTimer) {
      clearTimeout(this.eligibilityLoadTimer);
    }
    this.eligibilityLoadTimer = setTimeout(() => {
      this.eligibilityLoadTimer = null;
      this.isLoadingEligibility = true;
      this.loadEligibility();
    }, 0);
  }

  get invoice(): Invoice {
    return this._invoice;
  }

  @Output() close = new EventEmitter<void>();

  eligibility: EarlyPaymentEligibility | null = null;
  isLoadingEligibility = false;
  isSubmitting = false;
  showConfirmation = false;
  submitSuccess = false;
  submitError = '';

  constructor(private invoiceService: InvoiceService) {}

  requestEarlyPayment(): void {
    this.showConfirmation = true;
  }

  confirmRequest(): void {
    this.isSubmitting = true;
    this.invoiceService.submitEarlyPaymentRequest(this.invoice.invoiceId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.showConfirmation = false;
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Failed to submit request. Please try again.';
        this.showConfirmation = false;
      }
    });
  }

  cancelConfirmation(): void {
    this.showConfirmation = false;
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  private loadEligibility(): void {
    const invoiceId = this.invoice?.invoiceId;

    this.showConfirmation = false;
    this.submitSuccess = false;
    this.submitError = '';

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

    this.invoiceService
      .checkEligibility(invoiceId)
      .pipe(timeout(8000))
      .pipe(finalize(() => (this.isLoadingEligibility = false)))
      .subscribe({
        next: (result) => {
          console.log('[InvoiceDetail] Eligibility response received:', {
            invoiceId,
            result,
          });
          this.eligibility = result;
        },
        error: (error: HttpErrorResponse) => {
          console.error('[InvoiceDetail] Eligibility request failed:', {
            invoiceId,
            status: error.status,
            message: error.message,
            error: error.error,
          });
          this.eligibility = this.createUnavailableEligibility(this.getEligibilityErrorMessage(error));
        }
      });
  }

  private getEligibilityErrorMessage(error: HttpErrorResponse): string {
    const apiErrors = error.error?.errors;

    if (Array.isArray(apiErrors) && apiErrors.length > 0) {
      return apiErrors[0];
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
