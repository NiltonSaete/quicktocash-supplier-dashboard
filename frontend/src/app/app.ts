import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalAlertsComponent } from './shared/components/global-alerts/global-alerts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalAlertsComponent],
  template: `
    <app-global-alerts />
    <router-outlet />
  `
})
export class AppComponent {}
