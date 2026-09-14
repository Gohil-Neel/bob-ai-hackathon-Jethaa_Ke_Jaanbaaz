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

        // If it's an unconfigured template placeholder, treat as null (use fallback)
        if (trimmed.Contains("[YOUR_") || trimmed.Contains("[password]") || trimmed.Contains("your_password"))
            return null;

        // If it starts with postgres:// or postgresql://, convert URI format to Npgsql connection string
        if (trimmed.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                // Strip scheme
                var schemeIndex = trimmed.IndexOf("://", StringComparison.Ordinal);
                var withoutScheme = trimmed[(schemeIndex + 3)..];

                // Split user info and host/database
                var atIndex = withoutScheme.LastIndexOf('@');
                if (atIndex <= 0) return null;

                var userInfoPart = withoutScheme[..atIndex];
                var hostDbPart = withoutScheme[(atIndex + 1)..];

                var colonIndex = userInfoPart.IndexOf(':');
                var username = colonIndex >= 0 ? userInfoPart[..colonIndex] : userInfoPart;
                var password = colonIndex >= 0 ? userInfoPart[(colonIndex + 1)..] : "";

                // Unescape URI entities, strip accidental surrounding brackets/quotes
                username = Uri.UnescapeDataString(username).Trim('[', ']', '"', '\'');
                password = Uri.UnescapeDataString(password).Trim('[', ']', '"', '\'');

                // Split host:port/database
                var slashIndex = hostDbPart.IndexOf('/');
                var hostPort = slashIndex >= 0 ? hostDbPart[..slashIndex] : hostDbPart;
                var database = slashIndex >= 0 ? hostDbPart[(slashIndex + 1)..] : "postgres";

                // Strip query parameters if any (e.g. ?sslmode=require)
                var queryIndex = database.IndexOf('?');
                if (queryIndex >= 0) database = database[..queryIndex];

                var host = hostPort;
                var port = 5432;
                var portColonIndex = hostPort.IndexOf(':');
                if (portColonIndex >= 0)
                {
                    host = hostPort[..portColonIndex];
                    if (int.TryParse(hostPort[(portColonIndex + 1)..], out var parsedPort))
                    {
                        port = parsedPort;
                    }
                }

                var builder = new Npgsql.NpgsqlConnectionStringBuilder
                {
                    Host = host,
                    Port = port,
                    Database = string.IsNullOrWhiteSpace(database) ? "postgres" : database,
                    Username = username,
                    Password = password,
                    SslMode = Npgsql.SslMode.Require,
                    TrustServerCertificate = true,
                    Timeout = 15,
                    CommandTimeout = 30
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
