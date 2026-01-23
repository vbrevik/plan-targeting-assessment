// Export Utilities
// Functions for exporting data to various formats

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: any[],
  filename: string,
  headers?: string[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    csvHeaders.join(','),
    // Data rows
    ...data.map((row) =>
      csvHeaders.map((header) => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Handle objects/arrays (stringify)
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Handle strings with commas/quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(
  data: any,
  filename: string,
  pretty: boolean = true
): void {
  const jsonContent = pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Add classification markings to HTML content
 */
export function addClassificationMarkings(
  html: string,
  level: 'UNCLASS' | 'CUI' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI' = 'SECRET',
  caveats: string[] = []
): string {
  const caveatText = caveats.length > 0 ? `//${caveats.join('//')}` : '';
  const classification = `${level}${caveatText}`;
  
  // Add header and footer with classification
  const header = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: #1e293b; color: #fbbf24; padding: 8px; text-align: center; font-size: 10px; font-weight: bold; z-index: 9999; border-bottom: 2px solid #fbbf24;">
      ${classification}
    </div>
  `;
  
  const footer = `
    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #1e293b; color: #fbbf24; padding: 8px; text-align: center; font-size: 10px; font-weight: bold; z-index: 9999; border-top: 2px solid #fbbf24;">
      ${classification}
    </div>
  `;
  
  // Add padding to body to account for fixed headers/footers
  const styledHtml = html.replace(
    '<body',
    '<body style="padding-top: 40px; padding-bottom: 40px;"'
  );
  
  return header + styledHtml + footer;
}

/**
 * Export HTML content to PDF (client-side using browser print)
 * Note: For better PDF quality, consider using a library like jsPDF or html2pdf.js
 */
export function exportToPDF(
  htmlContent: string,
  filename: string,
  classification: 'UNCLASS' | 'CUI' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI' = 'SECRET',
  caveats: string[] = []
): void {
  // Add classification markings
  const markedContent = addClassificationMarkings(htmlContent, classification, caveats);
  
  // Create a new window with the content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window. Please allow popups.');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @media print {
            @page {
              margin: 0.5in;
              size: letter;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              color: #000;
              background: #fff;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-after: always;
            }
          }
          body {
            margin: 0;
            padding: 40px 20px;
          }
        </style>
      </head>
      <body>
        ${markedContent}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close window after print dialog
      setTimeout(() => {
        printWindow.close();
      }, 100);
    }, 250);
  };
}

/**
 * Convert table element to CSV
 */
export function tableToCSV(tableElement: HTMLTableElement, filename: string): void {
  const rows: string[] = [];
  
  // Get headers
  const headerRow = tableElement.querySelector('thead tr');
  if (headerRow) {
    const headers = Array.from(headerRow.querySelectorAll('th, td')).map(
      (cell) => {
        const text = cell.textContent?.trim() || '';
        return text.includes(',') || text.includes('"') ? `"${text.replace(/"/g, '""')}"` : text;
      }
    );
    rows.push(headers.join(','));
  }
  
  // Get data rows
  const dataRows = tableElement.querySelectorAll('tbody tr');
  dataRows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) => {
      const text = cell.textContent?.trim() || '';
      return text.includes(',') || text.includes('"') ? `"${text.replace(/"/g, '""')}"` : text;
    });
    rows.push(cells.join(','));
  });
  
  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
