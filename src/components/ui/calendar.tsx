
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.defaultMonth || new Date());
  const [view, setView] = React.useState<"days" | "months" | "years">("days");
  
  // Handle touch swipe gestures for month navigation
  const { handlers: swipeHandlers } = useTouchGestures({
    onSwipeLeft: () => {
      if (view === "days") {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentMonth(nextMonth);
        props.onMonthChange?.(nextMonth);
      }
    },
    onSwipeRight: () => {
      if (view === "days") {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentMonth(prevMonth);
        props.onMonthChange?.(prevMonth);
      }
    },
    threshold: 40,
  });
  
  const defaultClassNames = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: cn(
      "text-sm font-medium cursor-pointer px-3 py-1 rounded-md hover:bg-accent",
      view !== "days" && "hidden"
    ),
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-10 w-10 p-0 opacity-50 hover:opacity-100 touch-manipulation min-h-[44px] min-w-[44px]"
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
      "h-10 w-10 p-0 font-normal aria-selected:opacity-100 touch-manipulation min-h-[44px] min-w-[44px]"
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
    caption_dropdowns: "flex justify-center gap-4 py-2"
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
      
      // Create year options (100 years back, 20 years forward)
      const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 121 }, (_, i) => {
          const year = currentYear - 100 + i;
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
          open={props.name === "years" && view === "years" ? true : undefined}
          onOpenChange={props.name === "years" ? 
            (isOpen) => {
              if (!isOpen) setView("days");
            } : undefined
          }
        >
          <SelectTrigger 
            className="h-9 min-w-[110px] px-3 py-1 text-sm bg-background border-border hover:bg-accent focus:ring-0 touch-manipulation"
            aria-label={props.name === "months" ? "Select month" : "Select year"}
          >
            <SelectValue>{children}</SelectValue>
          </SelectTrigger>
          <SelectContent 
            className="max-h-60 overflow-auto touch-manipulation bg-background solid-dropdown z-[100]" 
            position="popper"
            align="center"
          >
            {props.name === "years" && (
              <div className="sticky top-0 bg-background z-10 p-1 border-b">
                <input
                  type="text"
                  placeholder="Search year..."
                  className="w-full p-2 text-sm border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  onChange={(e) => {
                    const yearContainer = e.currentTarget.closest('[role="listbox"]');
                    if (yearContainer) {
                      const yearValue = e.currentTarget.value.trim();
                      if (yearValue) {
                        const yearItem = Array.from(yearContainer.children).find(
                          (item) => item.textContent?.includes(yearValue)
                        ) as HTMLElement;
                        
                        if (yearItem) {
                          yearItem.scrollIntoView({ block: "center" });
                        }
                      }
                    }
                  }}
                />
              </div>
            )}
            {options?.map((option) => (
              <SelectItem 
                key={option.value}
                value={String(option.value)}
                className="touch-manipulation min-h-[44px] text-base flex items-center"
              >
                {option.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
    Caption: (props: any) => {
      const { displayMonth } = props;
      
      // Create a custom caption component that opens year selection when clicked
      return (
        <div className="flex justify-center items-center py-1 relative">
          <div className="flex items-center">
            <button 
              type="button" 
              className="text-sm font-medium cursor-pointer px-3 py-1 rounded-md hover:bg-accent min-h-[44px] min-w-[120px] touch-manipulation"
              onClick={() => setView("years")}
              aria-label="Open year selection"
            >
              {format(displayMonth, "MMMM yyyy")}
            </button>
          </div>
        </div>
      );
    }
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

  // When year view is active, render the year selection directly
  if (view === "years") {
    return (
      <div className="calendar-container touch-manipulation p-3 w-full">
        <div className="flex justify-between items-center mb-4">
          <button
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 w-10 p-0 touch-manipulation min-h-[44px] min-w-[44px]"
            )}
            onClick={() => setView("days")}
            aria-label="Back to calendar"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-medium">Select Year</h2>
          <div className="h-10 w-10"></div> {/* Empty div for alignment */}
        </div>
        
        <div className="sticky top-0 bg-background z-10 p-1 mb-2">
          <input
            type="text"
            placeholder="Search year..."
            className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
            onChange={(e) => {
              const yearValue = e.currentTarget.value.trim();
              const yearContainer = document.getElementById('year-grid');
              if (yearContainer && yearValue) {
                const yearItems = yearContainer.querySelectorAll('[data-year]');
                for (let item of yearItems) {
                  if (item.textContent?.includes(yearValue)) {
                    item.scrollIntoView({ block: "center" });
                    break;
                  }
                }
              }
            }}
          />
        </div>
        
        <div 
          id="year-grid" 
          className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[300px] py-2"
        >
          {(() => {
            const currentYear = new Date().getFullYear();
            const years = Array.from({ length: 121 }, (_, i) => currentYear - 100 + i);
            return years.map(year => (
              <button
                key={year}
                data-year={year}
                className={cn(
                  "py-2 px-1 rounded-md text-center touch-manipulation min-h-[44px]",
                  currentMonth.getFullYear() === year ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setFullYear(year);
                  setCurrentMonth(newDate);
                  props.onMonthChange?.(newDate);
                  setView("days");
                }}
              >
                {year}
              </button>
            ));
          })()}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container touch-manipulation">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("w-full p-3 touch-manipulation", className)}
        classNames={mergedClassNames}
        components={mergedComponents}
        captionLayout="custom" // Use custom to enable our Caption component
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
