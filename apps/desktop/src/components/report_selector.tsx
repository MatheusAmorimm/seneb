"use client";

import { ChevronDown, FileText } from "lucide-react";
import { Report } from "../types";

interface ReportSelectorProps {
  reports: Report[];
  selectedReportId: string | null;
  onSelect: (id: string) => void;
}

export function ReportSelector({ reports, selectedReportId, onSelect }: ReportSelectorProps) {
  if (reports.length === 0) return null;

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#00988D] transition-colors">
        <FileText size={18} className="text-[#00988D]" />
        
        <select 
          value={selectedReportId || ""}
          onChange={(e) => onSelect(e.target.value)}
          className="appearance-none bg-transparent font-bold text-[#013750] outline-none cursor-pointer min-w-[180px]"
        >
          {reports.map((report) => (
            <option key={report.id} value={report.id}>
              {report.name}
            </option>
          ))}
        </select>
        
        <ChevronDown size={16} className="text-slate-400" />
      </div>
    </div>
  );
}