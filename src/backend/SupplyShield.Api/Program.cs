using Scalar.AspNetCore;
using SupplyShield.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// ── Services ─────────────────────────────────────────────────────────────────

builder.Services.AddControllers();

// .NET 10 native OpenAPI (no Swashbuckle — avoids Microsoft.OpenApi 2.x vulnerability)
builder.Services.AddOpenApi();

// CORS — allow local Vite dev server (port 5173) and any configured origins
var corsOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?? ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Infrastructure (EF Core in-memory for Phase 2, Supabase client wrapper, AI service HTTP client)
builder.Services.AddInfrastructure(builder.Configuration);

// ── Application ───────────────────────────────────────────────────────────────

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // .NET 10 native OpenAPI endpoint
    app.MapOpenApi();
    // Scalar API browser at /scalar/v1
    app.MapScalarApiReference();
}

app.UseCors("LocalDev");
app.UseAuthorization();
app.MapControllers();

app.Run();

// Expose Program for integration testing (WebApplicationFactory)
public partial class Program { }
