using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CLINICSYSTEM.Migrations
{
    /// <inheritdoc />
    public partial class ReferralAndBillingUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("PRAGMA foreign_keys = OFF;");

            migrationBuilder.DropForeignKey(
                name: "FK_Referrals_Doctors_DoctorId",
                table: "Referrals");

            migrationBuilder.DropIndex(
                name: "IX_Referrals_ExternalReferralId",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "AcceptedAt",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "DoctorNotes",
                table: "Referrals");

            migrationBuilder.RenameColumn(
                name: "SentAt",
                table: "Referrals",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "RecommendedTreatment",
                table: "Referrals",
                newName: "Urgency");

            migrationBuilder.RenameColumn(
                name: "Priority",
                table: "Referrals",
                newName: "PatientName");

            migrationBuilder.RenameColumn(
                name: "ExternalServiceUrl",
                table: "Referrals",
                newName: "FhirServiceRequestId");

            migrationBuilder.RenameColumn(
                name: "ExternalServiceFeedback",
                table: "Referrals",
                newName: "CompletionNotes");

            migrationBuilder.RenameColumn(
                name: "ExternalReferralId",
                table: "Referrals",
                newName: "CancellationReason");

            migrationBuilder.RenameColumn(
                name: "Diagnosis",
                table: "Referrals",
                newName: "DoctorName");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Referrals",
                newName: "Department");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Referrals",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TEXT");

            migrationBuilder.AddColumn<string>(
                name: "AssignedToRole",
                table: "Referrals",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Referrals",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "LinkedAppointmentId",
                table: "Referrals",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PatientId",
                table: "Referrals",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "ReportAttached",
                table: "Referrals",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ReferralId",
                table: "Appointments",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BillingServices",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ServiceName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Department = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingServices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BillingInvoices",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PatientId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PatientName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Department = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ServiceId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ServiceName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InsuranceId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    InsuranceName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    InsuranceCoverage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    InsuranceDiscount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    FinalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CancellationReason = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ReferenceType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    ReferenceId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingInvoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillingInvoices_BillingServices_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "BillingServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BillingPayments",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    InvoiceId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PatientId = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    PatientName = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Method = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillingPayments_BillingInvoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "BillingInvoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_FhirServiceRequestId",
                table: "Referrals",
                column: "FhirServiceRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_LinkedAppointmentId",
                table: "Referrals",
                column: "LinkedAppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_PatientId",
                table: "Referrals",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ReferralId",
                table: "Appointments",
                column: "ReferralId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingInvoices_ServiceId",
                table: "BillingInvoices",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_BillingPayments_InvoiceId",
                table: "BillingPayments",
                column: "InvoiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Referrals_ReferralId",
                table: "Appointments",
                column: "ReferralId",
                principalTable: "Referrals",
                principalColumn: "ReferralId");

            migrationBuilder.AddForeignKey(
                name: "FK_Referrals_Appointments_LinkedAppointmentId",
                table: "Referrals",
                column: "LinkedAppointmentId",
                principalTable: "Appointments",
                principalColumn: "AppointmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Referrals_Users_DoctorId",
                table: "Referrals",
                column: "DoctorId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Referrals_Users_PatientId",
                table: "Referrals",
                column: "PatientId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
            
            migrationBuilder.Sql("PRAGMA foreign_keys = ON;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Referrals_ReferralId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Referrals_Appointments_LinkedAppointmentId",
                table: "Referrals");

            migrationBuilder.DropForeignKey(
                name: "FK_Referrals_Users_DoctorId",
                table: "Referrals");

            migrationBuilder.DropForeignKey(
                name: "FK_Referrals_Users_PatientId",
                table: "Referrals");

            migrationBuilder.DropTable(
                name: "BillingPayments");

            migrationBuilder.DropTable(
                name: "BillingInvoices");

            migrationBuilder.DropTable(
                name: "BillingServices");

            migrationBuilder.DropIndex(
                name: "IX_Referrals_FhirServiceRequestId",
                table: "Referrals");

            migrationBuilder.DropIndex(
                name: "IX_Referrals_LinkedAppointmentId",
                table: "Referrals");

            migrationBuilder.DropIndex(
                name: "IX_Referrals_PatientId",
                table: "Referrals");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_ReferralId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AssignedToRole",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "LinkedAppointmentId",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "PatientId",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "ReportAttached",
                table: "Referrals");

            migrationBuilder.DropColumn(
                name: "ReferralId",
                table: "Appointments");

            migrationBuilder.RenameColumn(
                name: "Urgency",
                table: "Referrals",
                newName: "RecommendedTreatment");

            migrationBuilder.RenameColumn(
                name: "PatientName",
                table: "Referrals",
                newName: "Priority");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "Referrals",
                newName: "SentAt");

            migrationBuilder.RenameColumn(
                name: "FhirServiceRequestId",
                table: "Referrals",
                newName: "ExternalServiceUrl");

            migrationBuilder.RenameColumn(
                name: "DoctorName",
                table: "Referrals",
                newName: "Diagnosis");

            migrationBuilder.RenameColumn(
                name: "Department",
                table: "Referrals",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "CompletionNotes",
                table: "Referrals",
                newName: "ExternalServiceFeedback");

            migrationBuilder.RenameColumn(
                name: "CancellationReason",
                table: "Referrals",
                newName: "ExternalReferralId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Referrals",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AcceptedAt",
                table: "Referrals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Referrals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DoctorNotes",
                table: "Referrals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_ExternalReferralId",
                table: "Referrals",
                column: "ExternalReferralId");

            migrationBuilder.AddForeignKey(
                name: "FK_Referrals_Doctors_DoctorId",
                table: "Referrals",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "DoctorId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
