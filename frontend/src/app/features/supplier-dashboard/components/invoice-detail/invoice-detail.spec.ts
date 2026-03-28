import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceDetailComponent } from './invoice-detail';
import { SupplierDashboardModule } from '../../supplier-dashboard.module';

describe('InvoiceDetail', () => {
  let component: InvoiceDetailComponent;
  let fixture: ComponentFixture<InvoiceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierDashboardModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
