using QuickToCash.API.Models.Enums;

namespace QuickToCash.API.Models
{
    public class EarlyPaymentRequest
    {
        public string RequestId { get; set; } = string.Empty;
        public string InvoiceId { get; set; } = string.Empty;
        public DateTime RequestedDate { get; set; }
        public decimal DisbursementAmount { get; set; }
        public decimal Fee { get; set; }
        public EarlyPaymentStatus Status { get; set; }
    }
}