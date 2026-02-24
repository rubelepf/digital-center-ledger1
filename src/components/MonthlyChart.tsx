import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Transaction } from '@/hooks/useTransactions';

interface MonthlyChartProps {
  transactions: Transaction[];
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  const chartData = useMemo(() => {
    const monthMap = new Map<string, { month: string; totalFee: number; totalPaid: number; totalDue: number }>();

    for (const t of transactions) {
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!monthMap.has(month)) {
        monthMap.set(month, { month, totalFee: 0, totalPaid: 0, totalDue: 0 });
      }
      const entry = monthMap.get(month)!;
      entry.totalFee += Number(t.total_fee);
      entry.totalPaid += Number(t.paid_amount);
      entry.totalDue += Number(t.total_fee) - Number(t.paid_amount);
    }

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  if (chartData.length === 0) return null;

  return (
    <div className="stat-card">
      <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Revenue Overview</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="totalFee" name="Total Fee" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalPaid" name="Paid" fill="hsl(var(--status-delivered))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalDue" name="Due" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
