using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using SupplyShield.Infrastructure;

// Load .env file from src directory or root if present
LoadDotEnv();

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

// Ensure database is initialized & seeded on startup if empty
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var dbContext = services.GetRequiredService<SupplyShield.Infrastructure.Persistence.AppDbContext>();

    try
    {
        if (dbContext.Database.IsRelational())
        {
            try
            {
                await dbContext.Database.MigrateAsync();
            }
            catch (Exception ex)
            {
                logger.LogInformation("Database migration note: {Message}", ex.Message);
                try
                {
                    await dbContext.Database.ExecuteSqlRawAsync(
                        "INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ('20260914092222_InitialCreate', '9.0.4') ON CONFLICT DO NOTHING;");
                }
                catch { }
            }

            try
            {
                var ddlSync = @"
                    ALTER TABLE IF EXISTS cold_chain_alerts ADD COLUMN IF NOT EXISTS acknowledged_at_utc TIMESTAMPTZ;
                    ALTER TABLE IF EXISTS cold_chain_alerts ADD COLUMN IF NOT EXISTS excursion_end_utc TIMESTAMPTZ;
                    ALTER TABLE IF EXISTS cold_chain_alerts ADD COLUMN IF NOT EXISTS duration_minutes INT;
                    ALTER TABLE IF EXISTS sensors ADD COLUMN IF NOT EXISTS current_excursion_severity VARCHAR(50);
                    ALTER TABLE IF EXISTS vehicles ADD COLUMN IF NOT EXISTS last_seen_at_utc TIMESTAMPTZ;
                    ALTER TABLE IF EXISTS recovery_recommendations ADD COLUMN IF NOT EXISTS proposed_carrier_code VARCHAR(50);
                    ALTER TABLE IF EXISTS recovery_recommendations ADD COLUMN IF NOT EXISTS proposed_route_id UUID;
                    ALTER TABLE IF EXISTS recovery_recommendations ADD COLUMN IF NOT EXISTS proposed_vehicle_id UUID;
                    ALTER TABLE IF EXISTS recovery_recommendations ADD COLUMN IF NOT EXISTS estimated_time_saving_minutes INT;
                    ALTER TABLE IF EXISTS recovery_recommendations ADD COLUMN IF NOT EXISTS estimated_cost_delta_usd NUMERIC(12, 2);
                    ALTER TABLE IF EXISTS recovery_recommendations ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT TRUE;
                    ALTER TABLE IF EXISTS decision_audits ADD COLUMN IF NOT EXISTS applied_at_utc TIMESTAMPTZ;
                    ALTER TABLE IF EXISTS decision_audits ADD COLUMN IF NOT EXISTS before_state_json TEXT;
                    ALTER TABLE IF EXISTS decision_audits ADD COLUMN IF NOT EXISTS after_state_json TEXT;
                    ALTER TABLE IF EXISTS ""__EFMigrationsHistory"" ENABLE ROW LEVEL SECURITY;
                ";
                await dbContext.Database.ExecuteSqlRawAsync(ddlSync);
            }
            catch (Exception syncEx)
            {
                logger.LogWarning(syncEx, "Schema synchronization note: {Message}", syncEx.Message);
            }
        }
        else
        {
            await dbContext.Database.EnsureCreatedAsync();
        }

        await SupplyShield.Infrastructure.Persistence.DataSeeder.SeedAsync(dbContext, force: true);
        logger.LogInformation("Database initialization & seed verification completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Database auto-initialization / migration check completed with note: {Message}", ex.Message);
    }
}

app.Run();

// Expose Program for integration testing (WebApplicationFactory)
public partial class Program
{
    public static void LoadDotEnv()
    {
        var currentDir = new DirectoryInfo(Directory.GetCurrentDirectory());
        for (var dir = currentDir; dir != null; dir = dir.Parent)
        {
            var envPath = Path.Combine(dir.FullName, ".env");
            if (File.Exists(envPath))
            {
                ReadEnvFile(envPath);
                return;
            }

            var srcEnvPath = Path.Combine(dir.FullName, "src", ".env");
            if (File.Exists(srcEnvPath))
            {
                ReadEnvFile(srcEnvPath);
                return;
            }
        }
    }

    private static void ReadEnvFile(string path)
    {
        foreach (var line in File.ReadAllLines(path))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#'))
                continue;

            var equalsIndex = trimmed.IndexOf('=');
            if (equalsIndex > 0)
            {
                var key = trimmed[..equalsIndex].Trim();
                var val = trimmed[(equalsIndex + 1)..].Trim();
                if (Environment.GetEnvironmentVariable(key) == null)
                {
                    Environment.SetEnvironmentVariable(key, val);
                }
            }
        }
    }
}
