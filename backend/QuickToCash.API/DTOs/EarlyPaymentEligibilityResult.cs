namespace QuickToCash.API.DTOs
{
    public class EarlyPaymentEligibilityResult
    {
        public bool IsEligible { get; set; }
        public decimal DisbursementAmount { get; set; }
        public decimal Fee { get; set; }
        public int EarlyByDays { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}