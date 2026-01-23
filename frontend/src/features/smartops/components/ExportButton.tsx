// Export Button Component
// Provides export functionality for data (PDF, CSV, JSON)

import { useState } from 'react';
import { Download, FileText, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportToCSV, exportToJSON, exportToPDF, tableToCSV } from '@/lib/utils/export';
import { cn } from '@/lib/utils';

export type ExportFormat = 'pdf' | 'csv' | 'json';

interface ExportButtonProps {
  data?: any[] | any; // Data to export (array for CSV/JSON, any for PDF)
  tableElement?: HTMLTableElement | null; // Optional table element for CSV export
  filename: string;
  classification?: 'UNCLASS' | 'CUI' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI';
  caveats?: string[];
  formats?: ExportFormat[]; // Which formats to show (default: all)
  className?: string;
  variant?: 'button' | 'dropdown'; // Button style or dropdown menu
  onExportStart?: () => void;
  onExportComplete?: (format: ExportFormat) => void;
  onExportError?: (error: Error) => void;
}

export function ExportButton({
  data,
  tableElement,
  filename,
  classification = 'SECRET',
  caveats = ['NOFORN'],
  formats = ['pdf', 'csv', 'json'],
  className = '',
  variant = 'dropdown',
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      onExportStart?.();

      switch (format) {
        case 'csv':
          if (tableElement) {
            tableToCSV(tableElement, filename);
          } else if (Array.isArray(data) && data.length > 0) {
            exportToCSV(data, filename);
          } else {
            throw new Error('No data or table element provided for CSV export');
          }
          break;

        case 'json':
          if (data) {
            exportToJSON(data, filename);
          } else {
            throw new Error('No data provided for JSON export');
          }
          break;

        case 'pdf':
          // For PDF, we'll use the current page content
          // In a real implementation, you might want to generate HTML from data
          const htmlContent = document.body.innerHTML;
          exportToPDF(htmlContent, filename, classification, caveats);
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      onExportComplete?.(format);
      setShowDropdown(false);
    } catch (error) {
      console.error('Export failed:', error);
      onExportError?.(error instanceof Error ? error : new Error('Export failed'));
    } finally {
      setIsExporting(false);
    }
  };

  const formatLabels: Record<ExportFormat, string> = {
    pdf: 'PDF',
    csv: 'CSV',
    json: 'JSON',
  };

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    pdf: <FileText className="w-4 h-4" />,
    csv: <FileSpreadsheet className="w-4 h-4" />,
    json: <FileJson className="w-4 h-4" />,
  };

  if (variant === 'button' && formats.length === 1) {
    // Single format button
    const format = formats[0];
    return (
      <button
        onClick={() => handleExport(format)}
        disabled={isExporting}
        className={cn(
          'flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm font-bold text-white hover:bg-slate-700 active:bg-slate-600 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          formatIcons[format]
        )}
        <span className="hidden sm:inline">Export {formatLabels[format]}</span>
        <span className="sm:hidden">Export</span>
      </button>
    );
  }

  // Dropdown variant
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className={cn(
          'flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm font-bold text-white hover:bg-slate-700 active:bg-slate-600 transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Export</span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="py-1">
              {formats.map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-slate-800 transition-colors touch-manipulation disabled:opacity-50"
                >
                  <div className="text-slate-400">{formatIcons[format]}</div>
                  <span>Export as {formatLabels[format]}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
