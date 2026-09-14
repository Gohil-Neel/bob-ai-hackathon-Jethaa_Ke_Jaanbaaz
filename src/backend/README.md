# SupplyShield AI — Backend (ASP.NET Core)

Primary application backend. C# / ASP.NET Core 10 / Entity Framework Core.

## Architecture

```
SupplyShield.Api          ← HTTP controllers, Program.cs, Swagger
      ↓ depends on
SupplyShield.Application  ← Service interfaces, DTOs, use-case contracts
      ↓ depends on
SupplyShield.Domain       ← Entities, enums, domain rules (zero external deps)
      ↑ also depended on by
SupplyShield.Infrastructure ← EF Core DbContext, Supabase wrapper, AI service HTTP client
```

## Quick Start

```bash
# From src/backend/
dotnet restore SupplyShield.sln
dotnet build SupplyShield.sln
dotnet run --project SupplyShield.Api
```

API: `http://localhost:5000`  
Swagger: `http://localhost:5000/swagger`  
Health: `http://localhost:5000/api/health`

## Environment Configuration

No credentials required for Phase 2. The API starts with an in-memory database.

For later phases, set these environment variables (or `appsettings.Local.json`):

| Variable | Description | Required |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | Supabase PostgreSQL connection string | Phase 3+ |
| `Supabase__Url` | Supabase project URL | Phase 3+ |
| `Supabase__ServiceRoleKey` | Service role key — never expose in frontend | Phase 3+ |
| `AiService__BaseUrl` | Python AI service base URL | Phase 13+ |

See `.env.example` for full reference.

## Running Tests

```bash
dotnet test tests/SupplyShield.Api.Tests
```

## Phase 2 Status

All API routes return clearly marked placeholder responses.  
EF Core uses an in-memory database — no PostgreSQL connection required.  
Supabase and AI service integrations are stubs — no credentials required.
