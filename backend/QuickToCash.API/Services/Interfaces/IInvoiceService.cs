using QuickToCash.API.DTOs;
using QuickToCash.API.Models;

namespace QuickToCash.API.Services.Interfaces
{
    public interface IInvoiceService
    {
        List<Invoice> GetInvoicesBySupplierId(string supplierId);
        Invoice? GetInvoiceById(string invoiceId);
        EarlyPaymentEligibilityResult CheckEligibility(string invoiceId);
        EarlyPaymentRequest SubmitEarlyPaymentRequest(string invoiceId);
        EarlyPaymentRequest? GetEarlyPaymentRequestByInvoiceId(string invoiceId);
    }
}