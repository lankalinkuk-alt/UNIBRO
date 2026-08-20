import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CompanyInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const DEFAULT_COMPANY: CompanyInfo = {
  name: 'UNIBRO SMART APPARELS (PVT) LTD',
  address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
  phone: '+94 11 234 5678',
  email: 'info@unibro.lk'
};

export interface ExportPdfOptions {
  title: string;
  subtitle?: string;
  periodOrDate?: string;
  headers: string[];
  data: (string | number)[][];
  summaryRows?: (string | number)[][];
  filename: string;
  orientation?: 'portrait' | 'landscape';
  summaryCards?: { label: string; value: string }[];
  company?: CompanyInfo;
  columnWidths?: { [key: number]: number };
  footerNote?: string;
}

export interface ExportExcelOptions {
  filename: string;
  sheetName?: string;
  title: string;
  subtitle?: string;
  periodOrDate?: string;
  headers: string[];
  data: (string | number)[][];
  summaryRows?: (string | number)[][];
  company?: CompanyInfo;
}

export interface PrintReportOptions {
  title: string;
  subtitle?: string;
  periodOrDate?: string;
  headers: string[];
  data: (string | number)[][];
  summaryCards?: { label: string; value: string }[];
  summaryRows?: (string | number)[][];
  company?: CompanyInfo;
  footerNote?: string;
}

/**
 * Export tabular report data to Excel (.xlsx) with styled title, meta headers, and totals.
 */
export function exportToExcel(options: ExportExcelOptions) {
  const {
    filename,
    sheetName = 'Report',
    title,
    subtitle,
    periodOrDate,
    headers,
    data,
    summaryRows,
    company = DEFAULT_COMPANY
  } = options;

  const now = new Date().toLocaleString('en-GB');

  // Build 2D array of rows
  const rows: any[][] = [];

  // Header banner rows
  rows.push([company.name || DEFAULT_COMPANY.name]);
  rows.push([company.address || DEFAULT_COMPANY.address]);
  rows.push(['']);
  rows.push([title.toUpperCase()]);
  if (subtitle) rows.push([subtitle]);
  if (periodOrDate) rows.push([`Period / Date: ${periodOrDate}`]);
  rows.push([`Generated On: ${now}`]);
  rows.push(['']); // Empty separator

  // Table Column Headers
  rows.push(headers);

  // Data rows
  data.forEach(row => {
    rows.push(row);
  });

  // Summary / Total rows
  if (summaryRows && summaryRows.length > 0) {
    rows.push(['']); // space
    summaryRows.forEach(sRow => {
      rows.push(sRow);
    });
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit column widths based on maximum length in each column
  const colWidths = headers.map((_, colIdx) => {
    let maxLen = (headers[colIdx] || '').toString().length;
    data.forEach(row => {
      const cellVal = (row[colIdx] ?? '').toString();
      if (cellVal.length > maxLen) maxLen = cellVal.length;
    });
    return { wch: Math.max(maxLen + 4, 12) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  const fullFileName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, fullFileName);
}

/**
 * Export tabular report data to high-quality PDF with letterhead, summary stats, and auto-table formatting.
 */
export function exportToPdf(options: ExportPdfOptions) {
  const {
    title,
    subtitle,
    periodOrDate,
    headers,
    data,
    summaryRows,
    filename,
    orientation = 'landscape',
    summaryCards,
    company = DEFAULT_COMPANY,
    footerNote
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date().toLocaleString('en-GB');

  // Header - Company Letterhead
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(company.name || DEFAULT_COMPANY.name!, 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(company.address || DEFAULT_COMPANY.address!, 14, 15);

  // Report Title and Meta
  let startY = 25;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  let metaText = '';
  if (subtitle) metaText += subtitle;
  if (periodOrDate) metaText += (metaText ? ' | ' : '') + `Period: ${periodOrDate}`;
  metaText += (metaText ? ' | ' : '') + `Generated: ${now}`;
  doc.text(metaText, 14, startY + 5);

  startY += 10;

  // Render Summary Cards if present
  if (summaryCards && summaryCards.length > 0) {
    const cardCount = summaryCards.length;
    const cardGap = 4;
    const availableWidth = pageWidth - 28;
    const cardWidth = (availableWidth - (cardCount - 1) * cardGap) / cardCount;
    const cardHeight = 15;

    summaryCards.forEach((card, idx) => {
      const cardX = 14 + idx * (cardWidth + cardGap);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cardX, startY, cardWidth, cardHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(card.label.toUpperCase(), cardX + 3, startY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(card.value, cardX + 3, startY + 11);
    });

    startY += cardHeight + 6;
  }

  // Draw AutoTable
  autoTable(doc, {
    head: [headers],
    body: data as any[][],
    foot: summaryRows && summaryRows.length > 0 ? (summaryRows as any[][]) : undefined,
    startY: startY,
    margin: { left: 14, right: 14, top: 20, bottom: 20 },
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129], // emerald-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5
    },
    footStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didDrawPage: (dataObj) => {
      // Footer page numbering
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const str = `Page ${doc.getNumberOfPages()} | Confidential Payroll & HRM Document - ${company.name}`;
      doc.text(str, 14, pageHeight - 8);
    }
  });

  const fullFileName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(fullFileName);
}

/**
 * Open high-resolution printable report in new window with print triggering.
 */
export function printReport(options: PrintReportOptions) {
  const {
    title,
    subtitle,
    periodOrDate,
    headers,
    data,
    summaryCards,
    summaryRows,
    company = DEFAULT_COMPANY,
    footerNote
  } = options;

  const now = new Date().toLocaleString('en-GB');

  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Please allow popups to open the print view.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${company.name}</title>
      <style>
        @page {
          size: landscape;
          margin: 12mm 12mm 15mm 12mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 20px;
          background: #fff;
          font-size: 11px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #059669;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .company-name {
          font-size: 18px;
          font-weight: 800;
          color: #064e3b;
          margin: 0 0 3px 0;
        }
        .company-info {
          font-size: 10px;
          color: #64748b;
          margin: 0;
        }
        .report-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .meta-tag {
          font-size: 10px;
          color: #64748b;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(${Math.min(summaryCards?.length || 4, 6)}, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 12px;
        }
        .summary-card .label {
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 3px;
        }
        .summary-card .val {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f1f5f9;
          color: #334155;
          font-weight: 700;
          text-align: left;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          font-size: 10px;
          text-transform: uppercase;
        }
        td {
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          font-size: 10.5px;
        }
        tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        .summary-table td {
          font-weight: 700;
          background-color: #f1f5f9 !important;
          border-top: 2px solid #94a3b8;
        }
        .footer {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 9.5px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }
        .signature-box {
          display: flex;
          gap: 40px;
          margin-top: 40px;
        }
        .sig-line {
          width: 160px;
          border-top: 1px dashed #94a3b8;
          text-align: center;
          padding-top: 4px;
          font-size: 10px;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px; display: flex; justify-content: flex-end; gap: 10px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print Document</button>
        <button onclick="window.close()" style="padding: 8px 16px; background: #94a3b8; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Close</button>
      </div>

      <div class="header">
        <div>
          <h1 class="company-name">${company.name || DEFAULT_COMPANY.name}</h1>
          <p class="company-info">${company.address || DEFAULT_COMPANY.address} | Tel: ${company.phone || DEFAULT_COMPANY.phone}</p>
        </div>
        <div style="text-align: right;">
          <h2 class="report-title">${title}</h2>
          <div class="meta-tag">${periodOrDate ? `Period: <b>${periodOrDate}</b> | ` : ''}Date: ${now}</div>
        </div>
      </div>

      ${summaryCards && summaryCards.length > 0 ? `
        <div class="summary-grid">
          ${summaryCards.map(c => `
            <div class="summary-card">
              <div class="label">${c.label}</div>
              <div class="val">${c.value}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}
            </tr>
          `).join('')}
          ${summaryRows && summaryRows.length > 0 ? summaryRows.map(sRow => `
            <tr class="summary-table">
              ${sRow.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}
            </tr>
          `).join('') : ''}
        </tbody>
      </table>

      ${footerNote ? `<p style="font-size: 10px; color: #64748b; font-style: italic;">* ${footerNote}</p>` : ''}

      <div class="signature-box">
        <div>
          <div class="sig-line">Prepared By</div>
        </div>
        <div>
          <div class="sig-line">Checked By (HR Manager)</div>
        </div>
        <div>
          <div class="sig-line">Approved By (Managing Director)</div>
        </div>
      </div>

      <div class="footer">
        <div>System-generated confidential official record.</div>
        <div>Page 1 of 1</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
