import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, startWith } from 'rxjs/operators';
import { Invoice, InvoiceStatus } from '../../models/invoice.model';
import { InvoiceDetailComponent } from '../invoice-detail/invoice-detail';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    InvoiceDetailComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent {
  private readonly invoiceService = inject(InvoiceService);

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
  readonly activeFilter$ = new BehaviorSubject<string>('All');
  readonly invoicesState$ = this.invoiceService.getInvoices('sup-001').pipe(
    map((invoices) => ({
      invoices,
      isLoading: false,
      hasError: false,
    })),
    catchError(() =>
      of({
        invoices: [] as Invoice[],
        isLoading: false,
        hasError: true,
      }),
    ),
    startWith({
      invoices: [] as Invoice[],
      isLoading: true,
      hasError: false,
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  readonly vm$ = combineLatest([
    this.invoicesState$,
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
    this.activeFilter$,
  ]).pipe(
    map(([state, searchTerm, activeFilter]) => {
      const filteredInvoices = this.filterInvoices(state.invoices, activeFilter, searchTerm);

      return {
        ...state,
        activeFilter,
        filteredInvoices,
        counts: this.buildCounts(state.invoices),
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  selectedInvoice: Invoice | null = null;
  showFilters = true;
  displayedColumns = [
    'invoiceNumber',
    'supplierName',
    'amount',
    'submittedDate',
    'dueDate',
    'status',
    'actions',
  ];
  setFilter(filter: string): void {
    this.activeFilter$.next(filter);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
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

  private filterInvoices(invoices: Invoice[], activeFilter: string, searchTerm: string): Invoice[] {
    let result = [...invoices];

    if (activeFilter !== 'All') {
      result = result.filter((invoice) => invoice.status === activeFilter);
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return result;
    }

    return result.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.supplierName.toLowerCase().includes(term),
    );
  }

  private buildCounts(invoices: Invoice[]): Record<string, number> {
    return {
      All: invoices.length,
      Pending: invoices.filter((invoice) => invoice.status === InvoiceStatus.Pending).length,
      Approved: invoices.filter((invoice) => invoice.status === InvoiceStatus.Approved).length,
      Funded: invoices.filter((invoice) => invoice.status === InvoiceStatus.Funded).length,
      Rejected: invoices.filter((invoice) => invoice.status === InvoiceStatus.Rejected).length,
    };
  }
}
