import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Invoice, InvoiceStatus } from '../../models/invoice.model';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly filters = ['All', 'Pending', 'Approved', 'Funded', 'Rejected'];
  readonly filterLabels: Record<string, string> = {
    All: 'All',
    Pending: 'Pending',
    Approved: 'Approved',
    Funded: 'Funded',
    Rejected: 'Rejected',
  };
  readonly statusLabels: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Pending]: 'Pending',
    [InvoiceStatus.Approved]: 'Approved',
    [InvoiceStatus.Funded]: 'Funded',
    [InvoiceStatus.Rejected]: 'Rejected',
  };

  readonly searchControl = new FormControl('', { nonNullable: true });

  allInvoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;
  isLoading = true;
  hasError = false;
  showFilters = true;
  activeFilter = 'All';
  displayedColumns = [
    'invoiceNumber',
    'supplierName',
    'amount',
    'submittedDate',
    'dueDate',
    'status',
    'actions',
  ];

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilter());

    this.invoiceService.getInvoices('sup-001').subscribe({
      next: (invoices) => {
        this.allInvoices = invoices;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }
  applyFilter(): void {
    let result = [...this.allInvoices];

    if (this.activeFilter !== 'All') {
      result = result.filter((i) => i.status === this.activeFilter);
    }

    const term = this.searchControl.value.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(term) ||
          i.supplierName.toLowerCase().includes(term),
      );
    }

    this.filteredInvoices = result;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  getCount(filter: string): number {
    if (filter === 'All') return this.allInvoices.length;
    return this.allInvoices.filter((i) => i.status === filter).length;
  }

  getFilterLabel(filter: string): string {
    return this.filterLabels[filter] ?? filter;
  }

  getStatusLabel(status: InvoiceStatus): string {
    return this.statusLabels[status] ?? status;
  }

  selectInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
  }

  closeDetail(): void {
    this.selectedInvoice = null;
  }
}
