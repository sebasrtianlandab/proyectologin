"use client";

import { Search } from "lucide-react";
import { cn } from "./utils";

export interface ErpSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

/**
 * Barra de búsqueda reutilizable del ERP.
 * Texto y placeholder oscuros sobre fondo claro para buena legibilidad.
 */
export function ErpSearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  inputClassName,
}: ErpSearchInputProps) {
  return (
    <div className={cn("relative flex-1 min-w-0", className)}>
      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 bg-white border border-gray-200 rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-viision-500/20 focus:border-viision-400",
          inputClassName
        )}
      />
    </div>
  );
}
