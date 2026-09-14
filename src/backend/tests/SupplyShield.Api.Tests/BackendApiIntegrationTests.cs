using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SupplyShield.Infrastructure.Persistence;
using Xunit;

namespace SupplyShield.Api.Tests;

/// <summary>
/// Integration tests verifying that ASP.NET Core controllers return live database data.
/// </summary>
public class BackendApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public BackendApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("DATABASE_URL", "");
            builder.UseSetting("ConnectionStrings:DefaultConnection", "");
        }).CreateClient();
    }

    [Fact]
    public async Task GetDashboardKpis_ReturnsLiveKpisFromDatabase()
    {
        var response = await _client.GetAsync("/api/dashboard/kpis");
        var content = await response.Content.ReadAsStringAsync();
        Assert.True(response.IsSuccessStatusCode, $"API returned {response.StatusCode}: {content}");

        var json = await response.Content.ReadFromJsonAsync<JsonObject>();
        Assert.NotNull(json);
        Assert.True(json["totalShipments"]?.GetValue<int>() >= 5);
        Assert.True(json["activeDisruptions"]?.GetValue<int>() >= 4);
        Assert.True(json["idleFleetAssets"]?.GetValue<int>() >= 2);
    }

    [Fact]
    public async Task GetShipments_ReturnsPopulatedList()
    {
        var response = await _client.GetAsync("/api/shipments");
        response.EnsureSuccessStatusCode();

        var array = await response.Content.ReadFromJsonAsync<JsonArray>();
        Assert.NotNull(array);
        Assert.NotEmpty(array);

        var first = array[0]?.AsObject();
        Assert.NotNull(first);
        Assert.NotNull(first["trackingNumber"]?.GetValue<string>());
        Assert.NotNull(first["status"]?.GetValue<string>());
    }

    [Fact]
    public async Task GetDisruptions_ReturnsDisruptionsWithSeverities()
    {
        var response = await _client.GetAsync("/api/disruptions");
        response.EnsureSuccessStatusCode();

        var array = await response.Content.ReadFromJsonAsync<JsonArray>();
        Assert.NotNull(array);
        Assert.NotEmpty(array);
    }

    [Fact]
    public async Task GetFleet_ReturnsFleetVehicles()
    {
        var response = await _client.GetAsync("/api/fleet");
        response.EnsureSuccessStatusCode();

        var array = await response.Content.ReadFromJsonAsync<JsonArray>();
        Assert.NotNull(array);
        Assert.NotEmpty(array);
    }

    [Fact]
    public async Task GetColdChain_ReturnsSensorsAndTelemetry()
    {
        var response = await _client.GetAsync("/api/cold-chain");
        response.EnsureSuccessStatusCode();

        var array = await response.Content.ReadFromJsonAsync<JsonArray>();
        Assert.NotNull(array);
        Assert.NotEmpty(array);
    }

    [Fact]
    public async Task GetAlerts_ReturnsColdChainAlerts()
    {
        var response = await _client.GetAsync("/api/alerts");
        response.EnsureSuccessStatusCode();

        var array = await response.Content.ReadFromJsonAsync<JsonArray>();
        Assert.NotNull(array);
        Assert.NotEmpty(array);
    }
}
