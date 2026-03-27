using Moq;
using QuickToCash.API.Models;
using QuickToCash.API.Models.Enums;
using QuickToCash.API.Repositories.Interfaces;
using QuickToCash.API.Services;

namespace QuickToCash.Tests
{
    public class EarlyPaymentServiceTests
    {
        private readonly Mock<IInvoiceRepository> _mockRepo;
        private readonly InvoiceService _service;

        public EarlyPaymentServiceTests()
        {
            _mockRepo = new Mock<IInvoiceRepository>();
            _service = new InvoiceService(_mockRepo.Object);
        }

        private Invoice CreateInvoice(InvoiceStatus status, int daysUntilDue, decimal amount = 50000)
        {
            return new Invoice
            {
                InvoiceId = "inv-test",
                InvoiceNumber = "INV-TEST-001",
                SupplierName = "Test Supplier",
                SupplierId = "sup-001",
                Amount = amount,
                SubmittedDate = DateTime.Now.AddDays(-10),
                DueDate = DateTime.Now.AddDays(daysUntilDue),
                Status = status
            };
        }

        [Fact]
        public void CheckEligibility_ApprovedInvoice_DueIn30Days_ReturnsEligible()
        {
            var invoice = CreateInvoice(InvoiceStatus.Approved, 30);
            _mockRepo.Setup(r => r.GetById("inv-test")).Returns(invoice);

            var result = _service.CheckEligibility("inv-test");

            Assert.True(result.IsEligible);
            Assert.Equal(30, result.EarlyByDays);
            Assert.True(result.Fee > 0);
            Assert.Equal(invoice.Amount - result.Fee, result.DisbursementAmount);
        }

        [Fact]
        public void CheckEligibility_ApprovedInvoice_DueIn3Days_ReturnsNotEligible()
        {
            var invoice = CreateInvoice(InvoiceStatus.Approved, 3);
            _mockRepo.Setup(r => r.GetById("inv-test")).Returns(invoice);

            var result = _service.CheckEligibility("inv-test");

            Assert.False(result.IsEligible);
            Assert.Contains("too close", result.Reason);
        }

        [Fact]
        public void CheckEligibility_PendingInvoice_ReturnsNotEligible()
        {
            var invoice = CreateInvoice(InvoiceStatus.Pending, 30);
            _mockRepo.Setup(r => r.GetById("inv-test")).Returns(invoice);

            var result = _service.CheckEligibility("inv-test");

            Assert.False(result.IsEligible);
            Assert.Contains("not yet approved", result.Reason);
        }

        [Fact]
        public void CheckEligibility_RejectedInvoice_ReturnsNotEligible()
        {
            var invoice = CreateInvoice(InvoiceStatus.Rejected, 30);
            _mockRepo.Setup(r => r.GetById("inv-test")).Returns(invoice);

            var result = _service.CheckEligibility("inv-test");

            Assert.False(result.IsEligible);
            Assert.Contains("rejected", result.Reason);
        }

        [Fact]
        public void CheckEligibility_FeeCalculation_IsCorrect()
        {
            // 50000 * 1.5% * 30/30 = 750
            var invoice = CreateInvoice(InvoiceStatus.Approved, 30, 50000);
            _mockRepo.Setup(r => r.GetById("inv-test")).Returns(invoice);

            var result = _service.CheckEligibility("inv-test");

            Assert.Equal(750.00m, result.Fee);
            Assert.Equal(49250.00m, result.DisbursementAmount);
        }
    }
}