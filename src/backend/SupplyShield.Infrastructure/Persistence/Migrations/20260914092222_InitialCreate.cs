using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SupplyShield.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "carriers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_carriers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "decision_audits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OperatorId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ActionType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetEntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetEntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ApprovedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AppliedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BeforeStateJson = table.Column<string>(type: "text", nullable: true),
                    AfterStateJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_decision_audits", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "disruptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DisruptionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AffectedRegion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    StartedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ResolvedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_disruptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "model_predictions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModelName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ModelVersion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContextType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContextEntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    PredictionType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Score = table.Column<decimal>(type: "numeric(8,6)", precision: 8, scale: 6, nullable: false),
                    RawOutputJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_model_predictions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "routes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Origin = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Destination = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    EstimatedHours = table.Column<int>(type: "integer", nullable: false),
                    CarrierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_routes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "vehicles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AssetCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AssetType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CapacityKg = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    CurrentLocation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    LastSeenAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CarrierId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vehicles_carriers_CarrierId",
                        column: x => x.CarrierId,
                        principalTable: "carriers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "route_segments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RouteId = table.Column<Guid>(type: "uuid", nullable: false),
                    SequenceOrder = table.Column<int>(type: "integer", nullable: false),
                    FromLocation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ToLocation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TransportMode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EstimatedHours = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_route_segments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_route_segments_routes_RouteId",
                        column: x => x.RouteId,
                        principalTable: "routes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shipments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrackingNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Origin = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Destination = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CarrierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EstimatedArrivalUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsColdChain = table.Column<bool>(type: "boolean", nullable: false),
                    RouteId = table.Column<Guid>(type: "uuid", nullable: true),
                    RiskScore = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shipments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shipments_routes_RouteId",
                        column: x => x.RouteId,
                        principalTable: "routes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "recovery_recommendations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ShipmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecommendationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Rationale = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Confidence = table.Column<decimal>(type: "numeric(5,4)", precision: 5, scale: 4, nullable: true),
                    ProposedRouteId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProposedCarrierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ProposedVehicleId = table.Column<Guid>(type: "uuid", nullable: true),
                    EstimatedTimeSavingMinutes = table.Column<int>(type: "integer", nullable: true),
                    EstimatedCostDeltaUsd = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    RequiresApproval = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recovery_recommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_recovery_recommendations_shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sensors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SensorCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ShipmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    MinTempCelsius = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    MaxTempCelsius = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    LastReadingCelsius = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    LastReadingAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CurrentExcursionSeverity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sensors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sensors_shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "shipment_disruptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ShipmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    DisruptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    EstimatedDelayHours = table.Column<int>(type: "integer", nullable: true),
                    ImpactNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shipment_disruptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shipment_disruptions_disruptions_DisruptionId",
                        column: x => x.DisruptionId,
                        principalTable: "disruptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_shipment_disruptions_shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vehicle_assignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ShipmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReleasedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicle_assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_vehicle_assignments_shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_vehicle_assignments_vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "cold_chain_alerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SensorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ShipmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ExcursionPeakCelsius = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    AllowedMinCelsius = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    AllowedMaxCelsius = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    ExcursionStartUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExcursionEndUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: true),
                    IsAcknowledged = table.Column<bool>(type: "boolean", nullable: false),
                    AcknowledgedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cold_chain_alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cold_chain_alerts_sensors_SensorId",
                        column: x => x.SensorId,
                        principalTable: "sensors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_cold_chain_alerts_shipments_ShipmentId",
                        column: x => x.ShipmentId,
                        principalTable: "shipments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "sensor_readings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SensorId = table.Column<Guid>(type: "uuid", nullable: false),
                    TemperatureCelsius = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    RecordedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsExcursion = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sensor_readings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sensor_readings_sensors_SensorId",
                        column: x => x.SensorId,
                        principalTable: "sensors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_carriers_Code",
                table: "carriers",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_carriers_IsActive",
                table: "carriers",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_cold_chain_alerts_IsAcknowledged",
                table: "cold_chain_alerts",
                column: "IsAcknowledged");

            migrationBuilder.CreateIndex(
                name: "IX_cold_chain_alerts_SensorId",
                table: "cold_chain_alerts",
                column: "SensorId");

            migrationBuilder.CreateIndex(
                name: "IX_cold_chain_alerts_Severity",
                table: "cold_chain_alerts",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_cold_chain_alerts_ShipmentId",
                table: "cold_chain_alerts",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_decision_audits_ActionType",
                table: "decision_audits",
                column: "ActionType");

            migrationBuilder.CreateIndex(
                name: "IX_decision_audits_ApprovedAtUtc",
                table: "decision_audits",
                column: "ApprovedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_decision_audits_Status",
                table: "decision_audits",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_decision_audits_TargetEntityType",
                table: "decision_audits",
                column: "TargetEntityType");

            migrationBuilder.CreateIndex(
                name: "IX_disruptions_DisruptionType",
                table: "disruptions",
                column: "DisruptionType");

            migrationBuilder.CreateIndex(
                name: "IX_disruptions_IsActive",
                table: "disruptions",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_disruptions_Severity",
                table: "disruptions",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_model_predictions_ContextType_ContextEntityId",
                table: "model_predictions",
                columns: new[] { "ContextType", "ContextEntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_model_predictions_ModelName",
                table: "model_predictions",
                column: "ModelName");

            migrationBuilder.CreateIndex(
                name: "IX_recovery_recommendations_RecommendationType",
                table: "recovery_recommendations",
                column: "RecommendationType");

            migrationBuilder.CreateIndex(
                name: "IX_recovery_recommendations_Severity",
                table: "recovery_recommendations",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_recovery_recommendations_ShipmentId",
                table: "recovery_recommendations",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_route_segments_RouteId_SequenceOrder",
                table: "route_segments",
                columns: new[] { "RouteId", "SequenceOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_routes_IsActive",
                table: "routes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_sensor_readings_IsExcursion",
                table: "sensor_readings",
                column: "IsExcursion");

            migrationBuilder.CreateIndex(
                name: "IX_sensor_readings_SensorId_RecordedAtUtc",
                table: "sensor_readings",
                columns: new[] { "SensorId", "RecordedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_sensors_SensorCode",
                table: "sensors",
                column: "SensorCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sensors_ShipmentId",
                table: "sensors",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_sensors_Status",
                table: "sensors",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_shipment_disruptions_DisruptionId",
                table: "shipment_disruptions",
                column: "DisruptionId");

            migrationBuilder.CreateIndex(
                name: "IX_shipment_disruptions_ShipmentId_DisruptionId",
                table: "shipment_disruptions",
                columns: new[] { "ShipmentId", "DisruptionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_shipments_CarrierCode",
                table: "shipments",
                column: "CarrierCode");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_Priority",
                table: "shipments",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_RouteId",
                table: "shipments",
                column: "RouteId");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_Status",
                table: "shipments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_shipments_TrackingNumber",
                table: "shipments",
                column: "TrackingNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vehicle_assignments_ShipmentId",
                table: "vehicle_assignments",
                column: "ShipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_vehicle_assignments_VehicleId_ShipmentId",
                table: "vehicle_assignments",
                columns: new[] { "VehicleId", "ShipmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_AssetCode",
                table: "vehicles",
                column: "AssetCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_CarrierId",
                table: "vehicles",
                column: "CarrierId");

            migrationBuilder.CreateIndex(
                name: "IX_vehicles_Status",
                table: "vehicles",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cold_chain_alerts");

            migrationBuilder.DropTable(
                name: "decision_audits");

            migrationBuilder.DropTable(
                name: "model_predictions");

            migrationBuilder.DropTable(
                name: "recovery_recommendations");

            migrationBuilder.DropTable(
                name: "route_segments");

            migrationBuilder.DropTable(
                name: "sensor_readings");

            migrationBuilder.DropTable(
                name: "shipment_disruptions");

            migrationBuilder.DropTable(
                name: "vehicle_assignments");

            migrationBuilder.DropTable(
                name: "sensors");

            migrationBuilder.DropTable(
                name: "disruptions");

            migrationBuilder.DropTable(
                name: "vehicles");

            migrationBuilder.DropTable(
                name: "shipments");

            migrationBuilder.DropTable(
                name: "carriers");

            migrationBuilder.DropTable(
                name: "routes");
        }
    }
}
