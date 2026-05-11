using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CLINICSYSTEM.Migrations
{
    /// <inheritdoc />
    public partial class AddReferralPatientPhone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PatientPhone",
                table: "Referrals",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PatientPhone",
                table: "Referrals");
        }
    }
}
