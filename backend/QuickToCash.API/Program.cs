using Microsoft.AspNetCore.Authentication;
using QuickToCash.API.Repositories;
using QuickToCash.API.Repositories.Interfaces;
using QuickToCash.API.Services;
using QuickToCash.API.Services.Interfaces;
using QuickToCash.API.Auth;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();
builder.Services
    .AddAuthentication(MockBearerAuthenticationHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, MockBearerAuthenticationHandler>(
        MockBearerAuthenticationHandler.SchemeName,
        _ => { });
builder.Services.AddAuthorization();

builder.Services.AddSingleton<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
