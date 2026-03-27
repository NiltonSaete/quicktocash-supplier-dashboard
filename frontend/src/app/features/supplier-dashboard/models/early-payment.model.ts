export enum EarlyPaymentStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export interface EarlyPaymentEligibility {
  isEligible: boolean;
  disbursementAmount: number;
  fee: number;
  earlyByDays: number;
  reason: string;
}

export interface EarlyPaymentRequest {
  requestId: string;
  invoiceId: string;
  requestedDate: string;
  disbursementAmount: number;
  fee: number;
  status: EarlyPaymentStatus;
}