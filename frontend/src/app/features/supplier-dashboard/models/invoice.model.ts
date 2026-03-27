export enum InvoiceStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Funded = 'Funded',
  Rejected = 'Rejected'
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  supplierId: string;
  amount: number;
  submittedDate: string;
  dueDate: string;
  status: InvoiceStatus;
}