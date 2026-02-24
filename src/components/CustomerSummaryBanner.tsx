import { useMemo, useState } from 'react';
import { User, Banknote, CheckCircle, Clock, Receipt, Landmark } from 'lucide-react';
import type { Transaction } from '@/hooks/useTransactions';

interface CustomerSummaryBannerProps {
  transactions: Transaction[];
  searchQuery: string;
}

export function CustomerSummaryBanner({ transactions, searchQuery }: CustomerSummaryBannerProps) {
  const stats = useMemo(() => {
    const totalFee = transactions.reduce((sum, t) => sum + (t.total_fee ?? 0), 0);
    const totalPaid = transactions.reduce((sum, t) => sum + (t.paid_amount ?? 0), 0);
    const totalDue = transactions.reduce((sum, t) => sum + (t.due_amount ?? 0), 0);

    const serviceTypeCounts: Record<string, number> = {};
    for (const t of transactions) {
      serviceTypeCounts[t.service_type] = (serviceTypeCounts[t.service_type] || 0) + 1;
    }

    return {
      total: transactions.length,
      totalFee,
      totalPaid,
      totalDue,
      serviceTypeCounts,
    };
  }, [transactions]);

  const bannerTitle = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return 'Customer Profile Summary';
    if (/^[\d\s\-+]+$/.test(q)) return `Summary for Mobile: ${q}`;
    return `Summary for: ${q}`;
  }, [searchQuery]);

  const SERVICE_TYPES = ['New Birth Reg', 'Correction', 'Reprint', 'Other Certificate'];

  const [manualCounts, setManualCounts] = useState<Record<string, string>>({});

  const totalCertificates = useMemo(() => {
    return SERVICE_TYPES.reduce((sum, type) => {
      const val = manualCounts[type] !== undefined ? Number(manualCounts[type]) : (stats.serviceTypeCounts[type] || 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [manualCounts, stats.serviceTypeCounts]);

  const handleManualCount = (type: string, val: string) => {
    setManualCounts(prev => ({ ...prev, [type]: val }));
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-primary">{bannerTitle}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Receipt className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Apps</p>
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-status-sent-upazila/10">
            <Banknote className="h-3.5 w-3.5 text-status-sent-upazila" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Fee</p>
            <p className="text-lg font-bold text-foreground">৳{stats.totalFee.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-status-delivered/10">
            <CheckCircle className="h-3.5 w-3.5 text-status-delivered" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-lg font-bold text-foreground">৳{stats.totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-destructive/10">
            <Banknote className="h-3.5 w-3.5 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Due</p>
            <p className="text-lg font-bold text-foreground">৳{stats.totalDue.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-accent">
            <Landmark className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Govt. Fee (৳50×{totalCertificates})</p>
            <p className="text-lg font-bold text-foreground">৳{(totalCertificates * 50).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-primary/10 pt-2">
        <p className="text-xs text-muted-foreground mb-1.5 font-medium">Service Type Breakdown</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_TYPES.map(type => (
            <label key={type} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-primary/20 bg-primary/5 text-primary">
              {type}:
              <input
                type="number"
                min={0}
                value={manualCounts[type] ?? (stats.serviceTypeCounts[type] || 0)}
                onChange={e => handleManualCount(type, e.target.value)}
                className="w-8 bg-transparent border-b border-primary/30 text-center font-bold text-primary outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
