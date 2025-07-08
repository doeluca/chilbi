
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePdf(invoiceEl: HTMLElement, tisch: string) {
  const canvas = await html2canvas(invoiceEl, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`Rechnung_Tisch_${tisch}.pdf`);
}
