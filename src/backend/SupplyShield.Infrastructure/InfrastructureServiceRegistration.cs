using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SupplyShield.Infrastructure.Integrations.Supabase;
using SupplyShield.Infrastructure.Integrations.WatsonX;
using SupplyShield.Infrastructure.Persistence;

namespace SupplyShield.Infrastructure;

/// <summary>
/// Extension method that registers all Infrastructure services into the DI container.
/// Call this from SupplyShield.Api / Program.cs.
/// </summary>
public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── EF Core ──────────────────────────────────────────────────────────
        // Phase 2: In-memory database so the API starts without PostgreSQL.
        // Phase 3+: Replace with Npgsql/PostgreSQL connection string.
        services.AddDbContext<AppDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                // Phase 2: No connection string — use in-memory DB so app starts cleanly.
                options.UseInMemoryDatabase("SupplyShieldDev");
            }
            else
            {
                // Phase 3+: Real PostgreSQL via Supabase.
                // options.UseNpgsql(connectionString);
                options.UseInMemoryDatabase("SupplyShieldDev"); // remove this line in Phase 3
            }
        });

        // ── Supabase wrapper ─────────────────────────────────────────────────
        services.AddSingleton<SupabaseClientWrapper>();

        // ── AI service HTTP client ────────────────────────────────────────────
        var aiServiceBaseUrl = configuration["AiService:BaseUrl"] ?? "http://localhost:8001";
        services.AddHttpClient<AiServiceClient>(client =>
        {
            client.BaseAddress = new Uri(aiServiceBaseUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        return services;
    }
}
