using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CLINICSYSTEM.Migrations
{
    /// <inheritdoc />
    public partial class CompletionPromptModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillingInvoices_BillingServices_ServiceId",
                table: "BillingInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_BillingPayments_BillingInvoices_InvoiceId",
                table: "BillingPayments");

            migrationBuilder.DropIndex(
                name: "IX_BillingInvoices_ServiceId",
                table: "BillingInvoices");

            migrationBuilder.AlterColumn<decimal>(
                name: "InsuranceCoverage",
                table: "BillingInvoices",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "PhysioTreatmentPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PatientId = table.Column<int>(type: "INTEGER", nullable: false),
                    PhysioId = table.Column<int>(type: "INTEGER", nullable: false),
                    ReferralId = table.Column<int>(type: "INTEGER", nullable: true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Sessions = table.Column<int>(type: "INTEGER", nullable: false),
                    CompletedSessions = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhysioTreatmentPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhysioTreatmentPlans_AspNetUsers_PatientId",
                        column: x => x.PatientId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhysioTreatmentPlans_AspNetUsers_PhysioId",
                        column: x => x.PhysioId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhysioTreatmentPlans_Referrals_ReferralId",
                        column: x => x.ReferralId,
                        principalTable: "Referrals",
                        principalColumn: "ReferralId");
                });

            migrationBuilder.CreateTable(
                name: "RadiologyStudies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PatientId = table.Column<int>(type: "INTEGER", nullable: false),
                    RadiologistId = table.Column<int>(type: "INTEGER", nullable: false),
                    ReferralId = table.Column<int>(type: "INTEGER", nullable: true),
                    StudyType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    StudyDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    BillingCreated = table.Column<bool>(type: "INTEGER", nullable: false),
                    BillingInvoiceId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyStudies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RadiologyStudies_AspNetUsers_PatientId",
                        column: x => x.PatientId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RadiologyStudies_AspNetUsers_RadiologistId",
                        column: x => x.RadiologistId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RadiologyStudies_Referrals_ReferralId",
                        column: x => x.ReferralId,
                        principalTable: "Referrals",
                        principalColumn: "ReferralId");
                });

            migrationBuilder.CreateTable(
                name: "RadiologyReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StudyId = table.Column<int>(type: "INTEGER", nullable: false),
                    RadiologistId = table.Column<int>(type: "INTEGER", nullable: false),
                    PatientId = table.Column<int>(type: "INTEGER", nullable: false),
                    Findings = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: true),
                    Impression = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Recommendations = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadiologyReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RadiologyReports_AspNetUsers_PatientId",
                        column: x => x.PatientId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadiologyReports_AspNetUsers_RadiologistId",
                        column: x => x.RadiologistId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadiologyReports_RadiologyStudies_StudyId",
                        column: x => x.StudyId,
                        principalTable: "RadiologyStudies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PhysioTreatmentPlans_PatientId",
                table: "PhysioTreatmentPlans",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_PhysioTreatmentPlans_PhysioId",
                table: "PhysioTreatmentPlans",
                column: "PhysioId");

            migrationBuilder.CreateIndex(
                name: "IX_PhysioTreatmentPlans_ReferralId",
                table: "PhysioTreatmentPlans",
                column: "ReferralId");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyReports_PatientId",
                table: "RadiologyReports",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyReports_RadiologistId",
                table: "RadiologyReports",
                column: "RadiologistId");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyReports_StudyId",
                table: "RadiologyReports",
                column: "StudyId");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyStudies_PatientId",
                table: "RadiologyStudies",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyStudies_RadiologistId",
                table: "RadiologyStudies",
                column: "RadiologistId");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyStudies_ReferralId",
                table: "RadiologyStudies",
                column: "ReferralId");

            migrationBuilder.AddForeignKey(
                name: "FK_BillingPayments_BillingInvoices_InvoiceId",
                table: "BillingPayments",
                column: "InvoiceId",
                principalTable: "BillingInvoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BillingPayments_BillingInvoices_InvoiceId",
                table: "BillingPayments");

            migrationBuilder.DropTable(
                name: "PhysioTreatmentPlans");

            migrationBuilder.DropTable(
                name: "RadiologyReports");

            migrationBuilder.DropTable(
                name: "RadiologyStudies");

            migrationBuilder.AlterColumn<decimal>(
                name: "InsuranceCoverage",
                table: "BillingInvoices",
                type: "decimal(5,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BillingInvoices_ServiceId",
                table: "BillingInvoices",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_BillingInvoices_BillingServices_ServiceId",
                table: "BillingInvoices",
                column: "ServiceId",
                principalTable: "BillingServices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BillingPayments_BillingInvoices_InvoiceId",
                table: "BillingPayments",
                column: "InvoiceId",
                principalTable: "BillingInvoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
