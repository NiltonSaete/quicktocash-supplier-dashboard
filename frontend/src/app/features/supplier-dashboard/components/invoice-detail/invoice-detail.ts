import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
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
  styleUrl: './invoice-detail.scss'
})
export class InvoiceDetailComponent implements OnInit {
  @Input() invoice!: Invoice;
  @Output() close = new EventEmitter<void>();

  eligibility: EarlyPaymentEligibility | null = null;
  isLoadingEligibility = true;
  isSubmitting = false;
  showConfirmation = false;
  submitSuccess = false;
  submitError = '';

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.invoiceService.checkEligibility(this.invoice.invoiceId).subscribe({
      next: (result) => {
        this.eligibility = result;
        this.isLoadingEligibility = false;
      },
      error: () => {
        this.isLoadingEligibility = false;
      }
    });
  }

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
}