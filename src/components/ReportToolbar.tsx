import React from 'react';
import { FileSpreadsheet, FileText, Printer } from 'lucide-react';

interface ReportToolbarProps {
  onExportExcel: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  label?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const ReportToolbar: React.FC<ReportToolbarProps> = ({
  onExportExcel,
  onExportPdf,
  onPrint,
  label = 'Export & Print',
  size = 'md',
  disabled = false
}) => {
  const btnBase = size === 'sm' 
    ? 'px-2.5 py-1.5 text-xs rounded-lg font-medium inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border'
    : 'px-3 py-1.5 text-xs rounded-xl font-medium inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer border';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {label && <span className="text-xs font-semibold text-stone-500 hidden sm:inline">{label}:</span>}
      
      <button
        onClick={onExportExcel}
        disabled={disabled}
        title="Export to Microsoft Excel spreadsheet (.xlsx)"
        className={`${btnBase} bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-400 disabled:opacity-50`}
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
        <span>Excel</span>
      </button>

      <button
        onClick={onExportPdf}
        disabled={disabled}
        title="Download official PDF Document (.pdf)"
        className={`${btnBase} bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 hover:border-rose-400 disabled:opacity-50`}
      >
        <FileText className="w-3.5 h-3.5 text-rose-700" />
        <span>PDF</span>
      </button>

      <button
        onClick={onPrint}
        disabled={disabled}
        title="Print document or save as PDF via system printer"
        className={`${btnBase} bg-white hover:bg-stone-100 text-stone-800 border-stone-300 hover:border-stone-400 disabled:opacity-50`}
      >
        <Printer className="w-3.5 h-3.5 text-stone-700" />
        <span>Print</span>
      </button>
    </div>
  );
};
