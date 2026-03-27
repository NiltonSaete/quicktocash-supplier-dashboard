using Microsoft.AspNetCore.Mvc;
using QuickToCash.API.DTOs;
using QuickToCash.API.Services.Interfaces;

namespace QuickToCash.API.Controllers
{
    [ApiController]
    [Route("api/invoices")]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoicesController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpGet]
        public IActionResult GetBySupplierId([FromQuery] string supplierId)
        {
            if (string.IsNullOrWhiteSpace(supplierId))
                return BadRequest(ApiResponse<object>.Fail("supplierId is required."));

            var invoices = _invoiceService.GetInvoicesBySupplierId(supplierId);
            return Ok(ApiResponse<object>.Ok(invoices));
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            var invoice = _invoiceService.GetInvoiceById(id);

            if (invoice == null)
                return NotFound(ApiResponse<object>.Fail("Invoice not found."));

            return Ok(ApiResponse<object>.Ok(invoice));
        }

        [HttpGet("{id}/early-payment-eligibility")]
        public IActionResult CheckEligibility(string id)
        {
            var invoice = _invoiceService.GetInvoiceById(id);

            if (invoice == null)
                return NotFound(ApiResponse<object>.Fail("Invoice not found."));

            var result = _invoiceService.CheckEligibility(id);
            return Ok(ApiResponse<object>.Ok(result));
        }

        [HttpPost("{id}/early-payment-request")]
        public IActionResult SubmitEarlyPaymentRequest(string id)
        {
            var invoice = _invoiceService.GetInvoiceById(id);

            if (invoice == null)
                return NotFound(ApiResponse<object>.Fail("Invoice not found."));

            var eligibility = _invoiceService.CheckEligibility(id);

            if (!eligibility.IsEligible)
                return BadRequest(ApiResponse<object>.Fail(eligibility.Reason));

            var existing = _invoiceService.GetEarlyPaymentRequestByInvoiceId(id);

            if (existing != null)
                return Conflict(ApiResponse<object>.Fail("An early payment request already exists for this invoice."));

            var request = _invoiceService.SubmitEarlyPaymentRequest(id);
            return StatusCode(201, ApiResponse<object>.Ok(request, "Early payment request submitted successfully."));
        }
    }
}