import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AlertService } from '../../../../core/services/alert.service';
import { EarlyPaymentEligibility, EarlyPaymentStatus } from '../../models/early-payment.model';
import { Invoice, InvoiceStatus } from '../../models/invoice.model';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceDetailComponent } from './invoice-detail';

describe('InvoiceDetailComponent', () => {
  let component: InvoiceDetailComponent;
  let fixture: ComponentFixture<InvoiceDetailComponent>;
  let invoiceService: Pick<InvoiceService, 'checkEligibility' | 'submitEarlyPaymentRequest'>;

  const invoice: Invoice = {
    invoiceId: 'inv-001',
    invoiceNumber: 'INV-001',
    supplierName: 'Acme Supply',
    supplierId: 'sup-001',
    amount: 50000,
    submittedDate: '2026-03-01T00:00:00Z',
    dueDate: '2026-03-31T00:00:00Z',
    status: InvoiceStatus.Approved,
  };

  const eligibility: EarlyPaymentEligibility = {
    isEligible: true,
    disbursementAmount: 49250,
    fee: 750,
    earlyByDays: 30,
    reason: '',
  };

  beforeEach(async () => {
    invoiceService = {
      checkEligibility: vi.fn().mockReturnValue(of(eligibility)),
      submitEarlyPaymentRequest: vi.fn().mockReturnValue(of({
      requestId: 'req-001',
      invoiceId: invoice.invoiceId,
      requestedDate: '2026-03-28T00:00:00Z',
      disbursementAmount: eligibility.disbursementAmount,
      fee: eligibility.fee,
      status: EarlyPaymentStatus.Pending,
      })),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [InvoiceDetailComponent],
      providers: [
        { provide: InvoiceService, useValue: invoiceService },
        {
          provide: AlertService,
          useValue: {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn(),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads eligibility on the next macrotask after the invoice input changes', async () => {
    component.invoice = invoice;

    component.ngOnChanges({
      invoice: new SimpleChange(null, invoice, true),
    });

    expect(invoiceService.checkEligibility).not.toHaveBeenCalled();
    expect(component.eligibility).toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(invoiceService.checkEligibility).toHaveBeenCalledTimes(1);
    expect(invoiceService.checkEligibility).toHaveBeenCalledWith(invoice.invoiceId);
    expect(component.eligibility).toEqual(eligibility);
    expect(component.isLoadingEligibility).toBe(false);
  });
});
