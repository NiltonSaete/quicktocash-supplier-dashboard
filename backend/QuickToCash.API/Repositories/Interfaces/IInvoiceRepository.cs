using QuickToCash.API.Models;

namespace QuickToCash.API.Repositories.Interfaces
{
    public interface IInvoiceRepository
    {
        List<Invoice> GetBySupplierId(string supplierId);
        Invoice? GetById(string invoiceId);
        void AddEarlyPaymentRequest(EarlyPaymentRequest request);
        EarlyPaymentRequest? GetEarlyPaymentRequestByInvoiceId(string invoiceId);
    }
}