import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceDetailComponent } from './invoice-detail';
import { InvoiceService } from '../../services/invoice.service';
import { of } from 'rxjs';

describe('InvoiceDetail', () => {
  let component: InvoiceDetailComponent;
  let fixture: ComponentFixture<InvoiceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailComponent],
      providers: [
        {
          provide: InvoiceService,
          useValue: {
            checkEligibility: () => of(null),
            submitEarlyPaymentRequest: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
