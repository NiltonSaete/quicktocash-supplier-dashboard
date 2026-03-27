using QuickToCash.API.DTOs;
using QuickToCash.API.Models;
using QuickToCash.API.Models.Enums;
using QuickToCash.API.Repositories.Interfaces;
using QuickToCash.API.Services.Interfaces;

namespace QuickToCash.API.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _repository;

        public InvoiceService(IInvoiceRepository repository)
        {
            _repository = repository;
        }

        public List<Invoice> GetInvoicesBySupplierId(string supplierId) =>
            _repository.GetBySupplierId(supplierId);

        public Invoice? GetInvoiceById(string invoiceId) =>
            _repository.GetById(invoiceId);

        public EarlyPaymentEligibilityResult CheckEligibility(string invoiceId)
        {
            var invoice = _repository.GetById(invoiceId);

            if (invoice == null)
                return new EarlyPaymentEligibilityResult
                {
                    IsEligible = false,
                    Reason = "Invoice not found."
                };

            if (invoice.Status == InvoiceStatus.Pending)
                return new EarlyPaymentEligibilityResult
                {
                    IsEligible = false,
                    Reason = "Invoice is not yet approved."
                };

            if (invoice.Status == InvoiceStatus.Rejected)
                return new EarlyPaymentEligibilityResult
                {
                    IsEligible = false,
                    Reason = "Invoice has been rejected."
                };

            if (invoice.Status == InvoiceStatus.Funded)
                return new EarlyPaymentEligibilityResult
                {
                    IsEligible = false,
                    Reason = "Invoice has already been funded."
                };

            var daysUntilDue = (invoice.DueDate.Date - DateTime.Today).Days;

            if (daysUntilDue <= 5)
                return new EarlyPaymentEligibilityResult
                {
                    IsEligible = false,
                    Reason = "Due date is too close to request early payment."
                };

            var fee = invoice.Amount * 0.015m * daysUntilDue / 30;
            var disbursement = invoice.Amount - fee;

            return new EarlyPaymentEligibilityResult
            {
                IsEligible = true,
                Fee = Math.Round(fee, 2),
                DisbursementAmount = Math.Round(disbursement, 2),
                EarlyByDays = daysUntilDue
            };
        }

        public EarlyPaymentRequest SubmitEarlyPaymentRequest(string invoiceId)
        {
            var eligibility = CheckEligibility(invoiceId);
            var invoice = _repository.GetById(invoiceId)!;

            var request = new EarlyPaymentRequest
            {
                RequestId = Guid.NewGuid().ToString(),
                InvoiceId = invoiceId,
                RequestedDate = DateTime.Now,
                Fee = eligibility.Fee,
                DisbursementAmount = eligibility.DisbursementAmount,
                Status = EarlyPaymentStatus.Pending
            };

            _repository.AddEarlyPaymentRequest(request);
            return request;
        }

        public EarlyPaymentRequest? GetEarlyPaymentRequestByInvoiceId(string invoiceId) =>
    _repository.GetEarlyPaymentRequestByInvoiceId(invoiceId);
    }
}