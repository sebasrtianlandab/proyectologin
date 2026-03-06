"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";

import { cn } from "./utils";

/** Estilo ERP: viision, bordes redondeados, tipografía clara, español */
const defaultClassNames: React.ComponentProps<typeof DayPicker>["classNames"] = {
  months: "flex flex-col sm:flex-row gap-6",
  month: "flex flex-col gap-4",
  caption: "flex justify-center pt-1 relative items-center w-full",
  caption_label: "text-sm font-semibold text-gray-800",
  nav: "flex items-center gap-1",
  nav_button: cn(
    "inline-flex size-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  ),
  nav_button_previous: "absolute left-1",
  nav_button_next: "absolute right-1",
  table: "w-full border-collapse",
  head_row: "flex justify-between",
  head_cell: "text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-8 rounded-md",
  row: "flex w-full mt-1",
  cell: "relative p-0 text-center text-xs focus-within:relative focus-within:z-20 [&:has([aria-selected])]:rounded-full",
  day: "size-8 p-0 text-xs font-medium text-gray-800 rounded-full hover:bg-viision-50 hover:text-viision-700 transition-colors aria-selected:opacity-100",
  day_range_start: "day-range-start rounded-l-full",
  day_range_end: "day-range-end rounded-r-full",
  day_selected:
    "bg-viision-600 text-white hover:bg-viision-600 hover:text-white focus:bg-viision-600 focus:text-white",
  day_today: "bg-viision-100 text-viision-700 font-semibold",
  day_outside: "text-gray-500 aria-selected:text-gray-400",
  day_disabled: "text-gray-400 opacity-60",
  day_range_middle: "rounded-none bg-viision-50/50 text-viision-700",
  day_hidden: "invisible",
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={es}
      labels={{ labelPrevious: () => "Mes anterior", labelNext: () => "Próximo mes" }}
      className={cn("p-3", className)}
      classNames={{ ...defaultClassNames, ...classNames }}
      components={{
        IconLeft: ({ className: c, ...p }) => (
          <ChevronLeft className={cn("size-4", c)} {...p} />
        ),
        IconRight: ({ className: c, ...p }) => (
          <ChevronRight className={cn("size-4", c)} {...p} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
