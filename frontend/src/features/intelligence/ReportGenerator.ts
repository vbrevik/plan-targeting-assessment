import type { Entity } from "@/lib/mshnctrl/services/ontology.service";

/**
 * Generates a printable report for the given entities.
 * Opens a new window with a styled print view.
 */
export const generateReport = (title: string, data: Record<string, Entity[]>) => {
    // Create a new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to generate reports');
        return;
    }

    const date = new Date().toLocaleString();

    // Generate HTML content
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style>
            body { font-family: monospace; padding: 20px; color: #1e293b; }
            h1 { text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 5px; }
            .meta { font-size: 12px; margin-bottom: 30px; color: #64748b; }
            .section { margin-bottom: 30px; break-inside: avoid; }
            h2 { font-size: 16px; text-transform: uppercase; background: #e2e8f0; padding: 5px 10px; margin: 0 0 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; border-bottom: 1px solid #000; padding: 8px; text-transform: uppercase; font-size: 10px; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
            tr:last-child td { border-bottom: none; }
            .urgent { color: #ef4444; font-weight: bold; }
            .status { font-weight: bold; text-transform: uppercase; font-size: 10px; }
            @media print {
                body { padding: 0; }
                h2 { background: #eee !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <h1>${title}</h1>
        <div class="meta">GENERATED: ${date} | CLASSIFICATION: UNCLASSIFIED</div>
    `;

    // specific order for report
    const sectionOrder = ['RFI', 'Task', 'Decision', 'Meeting', 'TOR', 'Person'];

    // Sort sections
    const sections = Object.keys(data).sort((a, b) => {
        const ia = sectionOrder.indexOf(a);
        const ib = sectionOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });

    sections.forEach(type => {
        const entities = data[type];
        if (!entities || entities.length === 0) return;

        html += `
            <div class="section">
                <h2>${type}s (${entities.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th width="20%">Name</th>
                            <th width="10%">Status</th>
                            <th width="50%">Description</th>
                            <th width="20%">Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        entities.forEach(entity => {
            const isUrgent = entity.properties?.priority === 'critical' || entity.properties?.priority === 'high';
            const created = new Date(entity.created_at).toLocaleDateString();

            html += `
                <tr>
                    <td class="${isUrgent ? 'urgent' : ''}">${entity.name}</td>
                    <td><span class="status">${entity.status || entity.properties?.status || 'Active'}</span></td>
                    <td>${entity.description || entity.properties?.description || '-'}</td>
                    <td>${created}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    });

    html += `
    <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; font-size: 10px; text-align: center;">
        END OF REPORT
    </div>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    // Slight delay to ensure styles render before print dialog
    setTimeout(() => {
        printWindow.print();
        // printWindow.close(); // Optional: close after print, but often better to leave open for user review
    }, 500);
};
