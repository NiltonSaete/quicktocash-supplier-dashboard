using QuickToCash.API.Models;
using QuickToCash.API.Models.Enums;
using QuickToCash.API.Repositories.Interfaces;

namespace QuickToCash.API.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly List<Invoice> _invoices;
        private readonly List<EarlyPaymentRequest> _requests = new();

        public InvoiceRepository()
        {
            _invoices = new List<Invoice>
            {
                new Invoice
                {
                    InvoiceId = "inv-001",
                    InvoiceNumber = "INV-2026-001",
                    SupplierName = "Acme Supplies",
                    SupplierId = "sup-001",
                    Amount = 50000,
                    SubmittedDate = DateTime.Now.AddDays(-20),
                    DueDate = DateTime.Now.AddDays(30),
                    Status = InvoiceStatus.Approved
                },
                new Invoice
                {
                    InvoiceId = "inv-002",
                    InvoiceNumber = "INV-2026-002",
                    SupplierName = "Acme Supplies",
                    SupplierId = "sup-001",
                    Amount = 120000,
                    SubmittedDate = DateTime.Now.AddDays(-10),
                    DueDate = DateTime.Now.AddDays(3),
                    Status = InvoiceStatus.Approved
                },
                new Invoice
                {
                    InvoiceId = "inv-003",
                    InvoiceNumber = "INV-2026-003",
                    SupplierName = "Acme Supplies",
                    SupplierId = "sup-001",
                    Amount = 75000,
                    SubmittedDate = DateTime.Now.AddDays(-5),
                    DueDate = DateTime.Now.AddDays(45),
                    Status = InvoiceStatus.Pending
                },
                new Invoice
                {
                    InvoiceId = "inv-004",
                    InvoiceNumber = "INV-2026-004",
                    SupplierName = "Acme Supplies",
                    SupplierId = "sup-001",
                    Amount = 30000,
                    SubmittedDate = DateTime.Now.AddDays(-30),
                    DueDate = DateTime.Now.AddDays(-5),
                    Status = InvoiceStatus.Funded
                },
                new Invoice
                {
                    InvoiceId = "inv-005",
                    InvoiceNumber = "INV-2026-005",
                    SupplierName = "Acme Supplies",
                    SupplierId = "sup-001",
                    Amount = 90000,
                    SubmittedDate = DateTime.Now.AddDays(-15),
                    DueDate = DateTime.Now.AddDays(20),
                    Status = InvoiceStatus.Rejected
                }
            };
        }

        public List<Invoice> GetBySupplierId(string supplierId) =>
            _invoices.Where(i => i.SupplierId == supplierId).ToList();

        public Invoice? GetById(string invoiceId) =>
            _invoices.FirstOrDefault(i => i.InvoiceId == invoiceId);

        public void AddEarlyPaymentRequest(EarlyPaymentRequest request) =>
            _requests.Add(request);

        public EarlyPaymentRequest? GetEarlyPaymentRequestByInvoiceId(string invoiceId) =>
            _requests.FirstOrDefault(r => r.InvoiceId == invoiceId);
    }
}