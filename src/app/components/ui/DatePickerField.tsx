"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "./utils";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

/** Convierte yyyy-mm-dd a Date o undefined */
function toDate(s: string): Date | undefined {
  if (!s || s.length < 10) return undefined;
  const d = parse(s, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

/** Convierte Date a yyyy-mm-dd */
function toValue(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/**
 * Selector de fecha estilizado para el ERP (Popover + Calendar).
 * value/onChange en formato ISO yyyy-mm-dd.
 */
export function DatePickerField({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  className,
  triggerClassName,
  disabled,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const date = toDate(value);
  const display = date ? format(date, "d 'de' MMM, yyyy", { locale: es }) : "";

  const handleSelect = (d: Date | undefined) => {
    if (!d) return;
    onChange(toValue(d));
    setOpen(false);
  };

  const handleHoy = () => {
    const today = new Date();
    onChange(toValue(today));
    setOpen(false);
  };

  const handleBorrar = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-viision-500/20 focus:border-viision-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !display && "text-gray-500",
            triggerClassName
          )}
        >
          <span className={cn(!display && "text-gray-400")}>
            {display || placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0 bg-white border-gray-200 shadow-lg rounded-xl", className)} align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
          <button
            type="button"
            onClick={handleBorrar}
            className="text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Borrar
          </button>
          <button
            type="button"
            onClick={handleHoy}
            className="text-xs font-medium text-viision-600 hover:text-viision-700"
          >
            Hoy
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
