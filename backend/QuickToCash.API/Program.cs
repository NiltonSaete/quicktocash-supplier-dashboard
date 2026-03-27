using QuickToCash.API.Repositories;
using QuickToCash.API.Repositories.Interfaces;
using QuickToCash.API.Services;
using QuickToCash.API.Services.Interfaces;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

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
app.UseAuthorization();
app.MapControllers();

app.Run();