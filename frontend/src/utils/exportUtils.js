/**
 * BakeUrCurls — Export Utilities
 * Provides browser-native, dependency-free export to CSV / Excel (.csv/.xlsx-compatible)
 * and formatted printable PDF reports.
 */

/**
 * Clean & escape string for CSV
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Trigger download of CSV/Excel file in browser
 */
export const exportToCSV = (filename, headers, rows) => {
  const headerLine = headers.map(escapeCSV).join(',');
  const rowLines = rows.map((r) => r.map(escapeCSV).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n'); // UTF-8 BOM for Excel support

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Open print dialogue formatted as a styled PDF report
 */
export const exportToPDF = ({ title, subtitle, columns, data, summaryStats = [] }) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable PDF report.');
    return;
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statsHtml = summaryStats.length
    ? `
    <div style="display: flex; gap: 16px; margin-bottom: 24px;">
      ${summaryStats
        .map(
          (s) => `
        <div style="flex: 1; background: #fdfaf6; border: 1px solid #e7d8c6; border-radius: 8px; padding: 12px 16px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #88725f; font-weight: 600;">${s.label}</div>
          <div style="font-size: 22px; font-weight: 800; color: #231812; margin-top: 4px;">${s.value}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `
    : '';

  const tableHeaderHtml = `
    <tr>
      ${columns.map((c) => `<th style="text-align: left; padding: 10px 12px; background: #231812; color: #F1D592; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${c}</th>`).join('')}
    </tr>
  `;

  const tableBodyHtml = data
    .map(
      (row, idx) => `
    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#fcf9f5'}; border-bottom: 1px solid #ede4d9;">
      ${row.map((cell) => `<td style="padding: 10px 12px; font-size: 12px; color: #33271f; vertical-align: top;">${cell || '—'}</td>`).join('')}
    </tr>
  `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} — BakeUrCurls Report</title>
        <style>
          @page { size: A4 landscape; margin: 16mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 0; color: #231812; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D4AF37; padding-bottom: 14px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #231812; font-family: serif; }
          .sub { font-size: 12px; color: #88725f; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .footer { margin-top: 24px; font-size: 10px; color: #a39080; text-align: center; border-top: 1px solid #ede4d9; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🌀 BakeUrCurls</div>
            <div class="sub">${title} &bull; ${subtitle || 'Official Salon Administration Export'}</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #88725f;">
            Generated on: <strong>${currentDate}</strong><br/>
            Location: Trivandrum, Kerala
          </div>
        </div>

        ${statsHtml}

        <table>
          <thead>${tableHeaderHtml}</thead>
          <tbody>${tableBodyHtml}</tbody>
        </table>

        <div class="footer">
          BakeUrCurls &bull; 2nd Floor, F Square, Pattom-Kesawadasapuram Road, Oppst. Chalakuzhi Road, Trivandrum &bull; +91 70120 01472
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
