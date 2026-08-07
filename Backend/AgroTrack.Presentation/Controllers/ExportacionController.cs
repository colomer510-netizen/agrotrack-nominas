using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AgroTrack.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportacionController : ControllerBase
    {
        [HttpGet("documentos/packing-list/{contenedorId}")]
        public IActionResult GenerarPackingListPdf(int contenedorId)
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

                    page.Header().Element(ComposeHeader);
                    page.Content().Element(ComposeContent);
                    page.Footer().Element(ComposeFooter);
                });
            });

            byte[] pdfBytes = document.GeneratePdf();
            return File(pdfBytes, "application/pdf", $"PackingList_Contenedor_{contenedorId}.pdf");
        }

        void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("PACKING LIST").FontSize(20).SemiBold().FontColor(Colors.Blue.Darken2);
                    column.Item().Text("Planta Procesadora de Plátano - Rivas, Nicaragua").FontSize(14).FontColor(Colors.Grey.Medium);
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            container.PaddingVertical(1, Unit.Centimetre).Column(column =>
            {
                column.Spacing(5);
                column.Item().Text("Detalle de Carga - Exportación").SemiBold();
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Lote #").SemiBold();
                        header.Cell().Text("Peso Total (Kg)").SemiBold();
                        header.Cell().Text("Cajas").SemiBold();
                    });

                    // Mock data
                    table.Cell().Text("L-2026-08-01");
                    table.Cell().Text("23,000.00");
                    table.Cell().Text("1,000");
                });
            });
        }

        void ComposeFooter(IContainer container)
        {
            container.AlignCenter().Text(x =>
            {
                x.Span("Página ");
                x.CurrentPageNumber();
                x.Span(" de ");
                x.TotalPages();
            });
        }
    }
}
