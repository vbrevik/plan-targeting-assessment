export class ExportService {
    /**
     * Convert array of objects to CSV with Security Classification Header
     */
    static toCSV<T extends object>(data: T[], filename: string, classification: string = "SECRET//NOFORN") {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            `CLASSIFICATION: ${classification}`, // Header
            headers.join(','), // Column Names
            ...data.map(row => headers.map(fieldName => {
                const val = (row as any)[fieldName];
                return JSON.stringify(val ?? ''); // Handle nulls/objects simply
            }).join(',')),
            `CLASSIFICATION: ${classification}` // Footer
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
