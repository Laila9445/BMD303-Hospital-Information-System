using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    public class PdfService
    {
        public byte[] GeneratePrescriptionPdf(PrescriptionModel prescription, 
            PatientModel patient, 
            DoctorModel doctor,
            ConsultationModel consultation)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header()
                        .Text("Medical Prescription")
                        .SemiBold().FontSize(24).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(col =>
                        {
                            col.Spacing(15);

                            // Doctor Information
                            col.Item().Row(row =>
                            {
                                row.RelativeItem().Column(column =>
                                {
                                    column.Item().Text("Doctor Information").SemiBold().FontSize(14);
                                    column.Item().Text($"Dr. {doctor.User?.FirstName} {doctor.User?.LastName}");
                                    column.Item().Text($"Specialization: {doctor.Specialization}");
                                    if (!string.IsNullOrEmpty(doctor.LicenseNumber))
                                        column.Item().Text($"License: {doctor.LicenseNumber}");
                                });
                            });

                            col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                            // Patient Information
                            col.Item().Column(column =>
                            {
                                column.Item().Text("Patient Information").SemiBold().FontSize(14);
                                column.Item().Text($"Name: {patient.FullName}");
                                column.Item().Text($"Phone: {patient.PhoneNumber ?? "N/A"}");
                                column.Item().Text($"Patient ID: {patient.ExternalPatientId}");
                            });

                            col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                            // Prescription Details
                            col.Item().Column(column =>
                            {
                                column.Item().Text("Prescription Details").SemiBold().FontSize(14);
                                column.Item().Text($"Date Issued: {prescription.CreatedAt:MMM dd, yyyy}");
                                column.Item().PaddingTop(10);
                            });

                            // Medication Table
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(3);
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn(1);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("Medication").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Dosage").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Frequency").SemiBold();
                                    header.Cell().Element(CellStyle).Text("Duration").SemiBold();

                                    static IContainer CellStyle(IContainer container)
                                    {
                                        return container.DefaultTextStyle(x => x.SemiBold())
                                            .PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                                    }
                                });

                                table.Cell().Element(CellStyle).Text(prescription.MedicationName);
                                table.Cell().Element(CellStyle).Text(prescription.Dosage);
                                table.Cell().Element(CellStyle).Text(prescription.Frequency);
                                table.Cell().Element(CellStyle).Text($"{prescription.DurationDays} days");

                                static IContainer CellStyle(IContainer container)
                                {
                                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .PaddingVertical(5);
                                }
                            });

                            // Instructions
                            if (!string.IsNullOrEmpty(prescription.Instructions))
                            {
                                col.Item().PaddingTop(10).Column(column =>
                                {
                                    column.Item().Text("Instructions:").SemiBold();
                                    column.Item().Text(prescription.Instructions);
                                });
                            }

                            // Warnings
                            if (!string.IsNullOrEmpty(prescription.Warnings))
                            {
                                col.Item().PaddingTop(10).Column(column =>
                                {
                                    column.Item().Text("Warnings:").SemiBold().FontColor(Colors.Red.Medium);
                                    column.Item().Text(prescription.Warnings).FontColor(Colors.Red.Darken1);
                                });
                            }

                            // Diagnosis
                            if (!string.IsNullOrEmpty(consultation.Diagnosis))
                            {
                                col.Item().PaddingTop(10).Column(column =>
                                {
                                    column.Item().Text("Diagnosis:").SemiBold();
                                    column.Item().Text(consultation.Diagnosis);
                                });
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Generated on ");
                            x.Span(DateTime.Now.ToString("MMM dd, yyyy HH:mm")).SemiBold();
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}
