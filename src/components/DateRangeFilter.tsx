import { CalendarDays } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

export function DateRangeFilter({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }: DateRangeFilterProps) {
  const hasFilter = startDate || endDate;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <input
        type="date"
        value={startDate}
        onChange={e => onStartDateChange(e.target.value)}
        className="px-2 py-1.5 rounded-lg border border-input bg-background text-foreground text-xs outline-none focus:ring-2 focus:ring-primary"
        placeholder="From"
      />
      <span className="text-xs text-muted-foreground">to</span>
      <input
        type="date"
        value={endDate}
        onChange={e => onEndDateChange(e.target.value)}
        className="px-2 py-1.5 rounded-lg border border-input bg-background text-foreground text-xs outline-none focus:ring-2 focus:ring-primary"
        placeholder="To"
      />
      {hasFilter && (
        <button
          onClick={onClear}
          className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
