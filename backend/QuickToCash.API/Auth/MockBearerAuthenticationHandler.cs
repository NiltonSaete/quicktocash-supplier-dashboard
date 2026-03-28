using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace QuickToCash.API.Auth
{
    public class MockBearerAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string SchemeName = "MockBearer";
        private const string ExpectedToken = "mock-token-supplier-001";

        public MockBearerAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
            {
                return Task.FromResult(AuthenticateResult.Fail("Missing Authorization header."));
            }

            var headerValue = authorizationHeader.ToString();
            const string bearerPrefix = "Bearer ";

            if (!headerValue.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return Task.FromResult(AuthenticateResult.Fail("Authorization header must use Bearer scheme."));
            }

            var token = headerValue[bearerPrefix.Length..].Trim();

            if (!string.Equals(token, ExpectedToken, StringComparison.Ordinal))
            {
                return Task.FromResult(AuthenticateResult.Fail("Invalid bearer token."));
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "sup-001"),
                new Claim(ClaimTypes.Name, "Supplier Demo User"),
            };

            var identity = new ClaimsIdentity(claims, SchemeName);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, SchemeName);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
