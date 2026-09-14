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
        // Phase 3: Configures Npgsql PostgreSQL (Supabase) when connection string or DATABASE_URL is present.
        // Falls back to in-memory database for local testing when no connection string is provided.
        services.AddDbContext<AppDbContext>(options =>
        {
            var rawConnectionString = configuration["DATABASE_URL"]
                ?? configuration.GetConnectionString("DefaultConnection")
                ?? Environment.GetEnvironmentVariable("DATABASE_URL");

            var resolvedConnectionString = ResolvePostgreSqlConnectionString(rawConnectionString);

            if (!string.IsNullOrWhiteSpace(resolvedConnectionString))
            {
                options.UseNpgsql(resolvedConnectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                });
            }
            else
            {
                // In-memory fallback when no connection string is configured
                options.UseInMemoryDatabase("SupplyShieldDev");
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

    /// <summary>
    /// Parses connection strings from either standard ADO.NET format or Postgres URI format (postgresql://user:pass@host:port/db).
    /// </summary>
    public static string? ResolvePostgreSqlConnectionString(string? rawConnectionString)
    {
        if (string.IsNullOrWhiteSpace(rawConnectionString))
            return null;

        var trimmed = rawConnectionString.Trim();

        // If it starts with postgres:// or postgresql://, convert URI format to Npgsql connection string
        if (trimmed.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(trimmed);
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = uri.AbsolutePath.TrimStart('/');

                var builder = new Npgsql.NpgsqlConnectionStringBuilder
                {
                    Host = host,
                    Port = port,
                    Database = string.IsNullOrEmpty(database) ? "postgres" : database,
                    Username = username,
                    Password = password,
                    SslMode = Npgsql.SslMode.Require
                };

                return builder.ConnectionString;
            }
            catch
            {
                // Fall back to returning raw string if parsing fails
                return trimmed;
            }
        }

        return trimmed;
    }
}
