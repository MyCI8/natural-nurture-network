
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTouchGestures } from "@/hooks/use-touch-gestures";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  captionLayout = "dropdown",
  ...props
}: CalendarProps) {
  const captionRef = React.useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.defaultMonth || new Date());
  
  // Handle touch swipe gestures for month navigation
  const { handlers: swipeHandlers } = useTouchGestures({
    onSwipeLeft: () => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentMonth(nextMonth);
      props.onMonthChange?.(nextMonth);
    },
    onSwipeRight: () => {
      const prevMonth = new Date(currentMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentMonth(prevMonth);
      props.onMonthChange?.(prevMonth);
    },
    threshold: 40,
  });
  
  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "flex items-center justify-center relative h-12 px-4 text-base font-semibold",
    caption_label: "text-sm font-medium",
    nav: "absolute top-0 flex w-full justify-between",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-12 text-muted-foreground/80 hover:text-foreground p-0 touch-manipulation min-h-[48px] min-w-[48px]",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-12 text-muted-foreground/80 hover:text-foreground p-0 touch-manipulation min-h-[48px] min-w-[48px]",
    ),
    weekday: "w-10 h-10 font-medium text-sm text-muted-foreground flex items-center justify-center",
    day_button:
      "relative flex h-10 w-10 items-center justify-center rounded-full p-0 text-base font-normal outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-data-[selected]:group-[.range-middle]:bg-accent group-data-[selected]:group-[.range-middle]:text-foreground touch-manipulation",
    day: "group h-10 w-10 p-0 text-sm font-medium aria-selected:opacity-100 min-h-[40px]",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:h-1 *:after:w-1 *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    hidden: "invisible",
    week_number: "flex h-10 w-10 items-center justify-center text-xs font-medium text-muted-foreground",
    caption_dropdowns: "flex justify-center gap-2 p-2",
  };

  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
            defaultClassNames[key as keyof typeof defaultClassNames],
            classNames[key as keyof typeof classNames],
          )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as typeof defaultClassNames,
  );

  // Custom components for the calendar
  const defaultComponents = {
    Chevron: (props: React.SVGProps<SVGSVGElement> & { orientation: "left" | "right" }) => {
      if (props.orientation === "left") {
        return <ChevronLeft size={24} strokeWidth={2} {...props} aria-hidden="true" />;
      }
      return <ChevronRight size={24} strokeWidth={2} {...props} aria-hidden="true" />;
    },
    YearChevrons: (props: React.SVGProps<SVGSVGElement> & { orientation: "left" | "right" }) => {
      if (props.orientation === "left") {
        return <ChevronsLeft size={20} strokeWidth={2} {...props} aria-hidden="true" />;
      }
      return <ChevronsRight size={20} strokeWidth={2} {...props} aria-hidden="true" />;
    },
    // Custom dropdown component for months
    Dropdown: ({ value, onChange, children, ...props }: any) => {
      // Create month options
      const months = React.useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(i);
          return {
            value: i,
            text: format(date, "MMMM"),
          };
        });
      }, []);
      
      // Create year options (10 years back, 10 years forward)
      const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 21 }, (_, i) => {
          const year = currentYear - 10 + i;
          return {
            value: year,
            text: year.toString(),
          };
        });
      }, []);
      
      const options = props.name === "months" ? months : years;
      
      return (
        <Select
          value={String(value)}
          onValueChange={(newValue) => onChange(Number(newValue))}
        >
          <SelectTrigger 
            className="h-9 min-w-[120px] px-3 py-1 text-sm bg-transparent border-none hover:bg-accent focus:ring-0 touch-manipulation"
            aria-label={props.name === "months" ? "Select month" : "Select year"}
          >
            <SelectValue>{children}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-auto touch-manipulation bg-background" position="popper">
            {options?.map((option) => (
              <SelectItem 
                key={option.value}
                value={String(option.value)}
                className="touch-manipulation min-h-[40px] text-base flex items-center"
              >
                {option.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  React.useEffect(() => {
    if (props.month) {
      setCurrentMonth(props.month);
    }
  }, [props.month]);

  return (
    <div className="calendar-container touch-manipulation">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("w-fit touch-manipulation", className)}
        classNames={mergedClassNames}
        components={mergedComponents}
        captionLayout={captionLayout}
        month={currentMonth}
        onMonthChange={(month) => {
          setCurrentMonth(month);
          props.onMonthChange?.(month);
        }}
        {...swipeHandlers}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
