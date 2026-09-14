using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace SupplyShield.Api.Tests;

/// <summary>
/// Integration tests for the /api/health endpoint.
///
/// Uses WebApplicationFactory to spin up the real ASP.NET Core pipeline in-process.
/// No database or external service required — Phase 2 runs with in-memory DB.
/// </summary>
public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_Returns_200()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Health_Returns_Status_Ok()
    {
        var response = await _client.GetAsync("/api/health");
        var body = await response.Content.ReadFromJsonAsync<HealthResponse>();

        Assert.NotNull(body);
        Assert.Equal("ok", body.Status);
    }

    [Fact]
    public async Task Health_Returns_Service_Name()
    {
        var response = await _client.GetAsync("/api/health");
        var body = await response.Content.ReadFromJsonAsync<HealthResponse>();

        Assert.NotNull(body);
        Assert.Equal("supplyshield-api", body.Service);
    }

    [Fact]
    public async Task Health_Response_Has_Expected_Shape()
    {
        var response = await _client.GetAsync("/api/health");
        var body = await response.Content.ReadFromJsonAsync<HealthResponse>();

        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body.Status));
        Assert.False(string.IsNullOrWhiteSpace(body.Service));
    }

    /// <summary>Minimal DTO to deserialise the health response.</summary>
    private record HealthResponse(string Status, string Service);
}
