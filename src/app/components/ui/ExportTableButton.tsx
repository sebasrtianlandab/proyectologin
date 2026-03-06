"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "./utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  format?: (value: unknown, row: T) => string;
}

export interface ExportTableButtonProps<T = Record<string, unknown>> {
  /** Columnas: key (del objeto), label (cabecera), opcional format */
  columns: ExportColumn<T>[];
  /** Datos de la tabla (filas) */
  data: T[];
  /** Prefijo del nombre del archivo (ej: "auditoria", "personal-rrhh") */
  filenamePrefix: string;
  /** Formatos a ofrecer. Por defecto CSV y PDF */
  formats?: ("csv" | "pdf")[];
  /** Deshabilitar cuando no hay datos */
  disabled?: boolean;
  className?: string;
  /** Texto del botón */
  buttonLabel?: string;
}

function escapeCsvValue(v: string): string {
  const s = String(v ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ExportTableButton<T extends Record<string, unknown>>({
  columns,
  data,
  filenamePrefix,
  formats = ["csv", "pdf"],
  disabled = false,
  className,
  buttonLabel = "Exportar",
}: ExportTableButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCellValue = (row: T, col: ExportColumn<T>): string => {
    const raw = row[col.key];
    if (col.format) return col.format(raw, row);
    if (raw == null) return "—";
    if (typeof raw === "object" && "toLocaleString" in (raw as Date)) return (raw as Date).toLocaleString("es-ES");
    return String(raw);
  };

  const headers = columns.map((c) => c.label);
  const rows = data.map((row) => columns.map((col) => getCellValue(row, col)));

  const exportCsv = () => {
    setOpen(false);
    if (data.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCsvValue).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-6)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado correctamente");
  };

  const exportPdf = () => {
    setOpen(false);
    if (data.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      autoTable(doc, {
        head: [headers],
        body: rows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 19, 252] },
      });
      doc.save(`${filenamePrefix}_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-6)}.pdf`);
      toast.success("PDF exportado correctamente");
    } catch {
      toast.error("Error al generar el PDF");
    }
  };

  const isDisabled = disabled || data.length === 0;

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => !isDisabled && setOpen((o) => !o)}
        disabled={isDisabled}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg transition-colors",
          "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Download className="w-4 h-4" />
        {buttonLabel}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[10rem]">
          {formats.includes("csv") && (
            <button
              type="button"
              onClick={exportCsv}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Exportar CSV
            </button>
          )}
          {formats.includes("pdf") && (
            <button
              type="button"
              onClick={exportPdf}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Exportar PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
}
