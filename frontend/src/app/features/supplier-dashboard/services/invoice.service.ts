import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { EarlyPaymentEligibility, EarlyPaymentRequest } from '../models/early-payment.model';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly apiUrl = 'http://localhost:5196/api/invoices';

  constructor(private http: HttpClient) {}

  getInvoices(supplierId: string): Observable<Invoice[]> {
    return this.http
      .get<ApiResponse<Invoice[]>>(`${this.apiUrl}?supplierId=${supplierId}`)
      .pipe(map((res) => this.extractData(res, 'Unable to load invoices right now.')));
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http
      .get<ApiResponse<Invoice>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => this.extractData(res, 'Unable to load invoice details right now.')));
  }

  checkEligibility(id: string): Observable<EarlyPaymentEligibility> {
    return this.http
      .get<ApiResponse<EarlyPaymentEligibility>>(`${this.apiUrl}/${id}/early-payment-eligibility`)
      .pipe(map((res) => this.extractData(res, 'Unable to load early payment eligibility right now.')));
  }

  submitEarlyPaymentRequest(id: string): Observable<EarlyPaymentRequest> {
    return this.http
      .post<ApiResponse<EarlyPaymentRequest>>(`${this.apiUrl}/${id}/early-payment-request`, {})
      .pipe(map((res) => this.extractData(res, 'Failed to submit early payment request.')));
  }

  private extractData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
    if (!response.success) {
      throw new Error(response.errors[0] ?? response.message ?? fallbackMessage);
    }

    if (response.data === null || response.data === undefined) {
      throw new Error(fallbackMessage);
    }

    return response.data;
  }
}
