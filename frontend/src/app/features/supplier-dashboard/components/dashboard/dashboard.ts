import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { Invoice, InvoiceStatus } from '../../models/invoice.model';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceDetailComponent } from '../invoice-detail/invoice-detail';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    InvoiceDetailComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
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

  allInvoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;
  isLoading = true;
  hasError = false;
  searchTerm = '';
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

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
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
