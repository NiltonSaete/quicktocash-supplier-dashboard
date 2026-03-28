import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-global-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-alerts.html',
  styleUrl: './global-alerts.scss',
})
export class GlobalAlertsComponent {
  readonly alertService = inject(AlertService);

  dismiss(id: number): void {
    this.alertService.dismiss(id);
  }
}
