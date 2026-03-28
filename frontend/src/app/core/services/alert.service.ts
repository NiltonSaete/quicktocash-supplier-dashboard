import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertMessage {
  id: number;
  type: AlertType;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly alertsSubject = new BehaviorSubject<AlertMessage[]>([]);
  private nextId = 1;

  readonly alerts$ = this.alertsSubject.asObservable();

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  warning(text: string): void {
    this.push('warning', text);
  }

  info(text: string): void {
    this.push('info', text);
  }

  dismiss(id: number): void {
    this.alertsSubject.next(this.alertsSubject.value.filter((alert) => alert.id !== id));
  }

  private push(type: AlertType, text: string): void {
    const alert: AlertMessage = {
      id: this.nextId++,
      type,
      text,
    };

    this.alertsSubject.next([...this.alertsSubject.value, alert]);
    setTimeout(() => this.dismiss(alert.id), 4000);
  }
}
