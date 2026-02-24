interface StatusFilterProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  counts: Record<string, number>;
}

const FILTERS: { key: string | null; label: string; color?: string }[] = [
  { key: null, label: 'All' },
  { key: 'UP Pending', label: 'UP Pending', color: 'bg-status-up-pending-light text-status-up-pending border-status-up-pending/30' },
  { key: 'Sent to Upazila', label: 'Sent to Upazila', color: 'bg-status-sent-upazila-light text-status-sent-upazila border-status-sent-upazila/30' },
  { key: 'Upazila Received/Ready', label: 'Upazila Ready', color: 'bg-status-received-light text-status-received border-status-received/30' },
  { key: 'Delivered', label: 'Delivered', color: 'bg-status-delivered-light text-status-delivered border-status-delivered/30' },
];

export function StatusFilter({ activeFilter, onFilterChange, counts }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(f => {
        const isActive = activeFilter === f.key;
        const count = f.key ? (counts[f.key] || 0) : Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <button
            key={f.label}
            onClick={() => onFilterChange(f.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${isActive
                ? f.key
                  ? f.color + ' ring-2 ring-offset-1 ring-current'
                  : 'bg-primary text-primary-foreground border-primary ring-2 ring-offset-1 ring-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
          >
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-muted'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
