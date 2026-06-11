import type { AndreaniReport, DdtReport } from "./types";
import * as XLSX from "xlsx";

/**
 * Export Andreani Reports to Excel (.xlsx)
 */
export function exportAndreaniToExcel(reports: AndreaniReport[]) {
  const data = reports.map(r => ({
    "Oggetto": r.subject,
    "Priorità": r.priority,
    "Mittente": r.sender || "-",
    "Data": new Date(r.receivedAt).toLocaleDateString("it-IT"),
    "Sintesi": r.summary || "-",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report Andreani");
  
  // Set column widths
  worksheet["!cols"] = [
    { wch: 30 },
    { wch: 12 },
    { wch: 20 },
    { wch: 12 },
    { wch: 40 },
  ];

  XLSX.writeFile(workbook, `andreani-reports-${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Export DDT Reports to Excel (.xlsx)
 */
export function exportDdtToExcel(reports: DdtReport[]) {
  const data = reports.map(r => ({
    "Numero": r.reportNumber,
    "Tipo": r.reportType,
    "Categoria": r.productCategory,
    "Mittente": r.sender || "-",
    "Ricevente": r.recipient || "-",
    "Fornitore": r.supplier || "-",
    "Data": new Date(r.receivedAt).toLocaleDateString("it-IT"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report DDT");
  
  // Set column widths
  worksheet["!cols"] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
  ];

  XLSX.writeFile(workbook, `ddt-reports-${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * Export Andreani Reports to PDF
 */
export async function exportAndreaniToPdf(reports: AndreaniReport[]) {
  const { jsPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  doc.text("Report Email Fabio Andreani", 14, 15);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Data esportazione: ${new Date().toLocaleDateString("it-IT")}`, 14, 25);

  // Table
  const tableData = reports.map(r => [
    r.subject.substring(0, 40),
    r.priority,
    r.sender || "-",
    new Date(r.receivedAt).toLocaleDateString("it-IT"),
    r.summary?.substring(0, 30) || "-",
  ]);

  autoTable(doc, {
    head: [["Oggetto", "Priorità", "Mittente", "Data", "Sintesi"]],
    body: tableData,
    startY: 35,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(`andreani-reports-${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Export DDT Reports to PDF
 */
export async function exportDdtToPdf(reports: DdtReport[]) {
  const { jsPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  doc.text("Report DDT Prodotti HERO", 14, 15);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Data esportazione: ${new Date().toLocaleDateString("it-IT")}`, 14, 25);

  // Table
  const tableData = reports.map(r => [
    r.reportNumber,
    r.reportType,
    r.productCategory,
    r.sender?.substring(0, 15) || "-",
    r.recipient?.substring(0, 15) || "-",
    new Date(r.receivedAt).toLocaleDateString("it-IT"),
  ]);

  autoTable(doc, {
    head: [["Numero", "Tipo", "Categoria", "Mittente", "Ricevente", "Data"]],
    body: tableData,
    startY: 35,
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(`ddt-reports-${new Date().toISOString().split("T")[0]}.pdf`);
}


