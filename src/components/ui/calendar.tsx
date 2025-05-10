
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
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-10 w-10 p-0 opacity-50 hover:opacity-100 touch-manipulation min-h-[40px] min-w-[40px]"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell:
      "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    day: cn(
      buttonVariants({ variant: "ghost" }),
      "h-10 w-10 p-0 font-normal aria-selected:opacity-100 touch-manipulation min-h-[40px] min-w-[40px]"
    ),
    day_range_end: "day-range-end",
    day_selected:
      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside:
      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle:
      "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
    caption_dropdowns: "flex justify-center gap-2 py-2"
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
    IconLeft: (props: React.ComponentProps<typeof ChevronLeft>) => <ChevronLeft className="h-6 w-6" />,
    IconRight: (props: React.ComponentProps<typeof ChevronRight>) => <ChevronRight className="h-6 w-6" />,
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
            className="h-9 min-w-[120px] px-3 py-1 text-sm bg-background border-border hover:bg-accent focus:ring-0 touch-manipulation"
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
        className={cn("w-full p-3 touch-manipulation", className)}
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
