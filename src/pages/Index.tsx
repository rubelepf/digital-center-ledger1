import { useState, useMemo } from 'react';
import { Plus, Download, RefreshCw, Building2, LogOut, Shield, History } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { DashboardCards } from '@/components/DashboardCards';
import { SearchBar } from '@/components/SearchBar';
import { StatusFilter } from '@/components/StatusFilter';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { CustomerSummaryBanner } from '@/components/CustomerSummaryBanner';
import { MonthlyChart } from '@/components/MonthlyChart';
import { DataGrid } from '@/components/DataGrid';
import { AuditLog } from '@/components/AuditLog';
import { RoleManager } from '@/components/RoleManager';
import { exportToExcel } from '@/lib/exportToExcel';

const Index = () => {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, refetch } = useTransactions();
  const { isAdmin } = useUserRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of transactions) {
      counts[t.delivery_status] = (counts[t.delivery_status] || 0) + 1;
    }
    return counts;
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = transactions;
    if (statusFilter) {
      result = result.filter(t => t.delivery_status === statusFilter);
    }
    if (startDate) {
      result = result.filter(t => t.date >= startDate);
    }
    if (endDate) {
      result = result.filter(t => t.date <= endDate);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.application_id.toLowerCase().includes(q) || t.mobile_no.includes(q) || t.applicant_name.toLowerCase().includes(q));
    }
    return result;
  }, [transactions, search, statusFilter, startDate, endDate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-grid-header text-grid-header-foreground px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">Union Parishad Digital Center - Smart Ledger</h1>
              <p className="text-xs opacity-75">Digital Center Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => setShowAdmin(!showAdmin)} className={`p-2 rounded-md transition-colors ${showAdmin ? 'bg-primary/20' : 'hover:bg-primary/20'}`} title="Admin Panel">
                <Shield className="h-4 w-4" />
              </button>
            )}
            <button onClick={refetch} className="p-2 rounded-md hover:bg-primary/20 transition-colors" title="Refresh data">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => supabase.auth.signOut()} className="p-2 rounded-md hover:bg-primary/20 transition-colors" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 flex-1 w-full">
        {showAdmin && isAdmin && (
          <div className="space-y-4">
            <RoleManager />
            <AuditLog />
          </div>
        )}

        <DashboardCards transactions={transactions} />

        <MonthlyChart transactions={transactions} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <StatusFilter activeFilter={statusFilter} onFilterChange={setStatusFilter} counts={statusCounts} />
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={() => { setStartDate(''); setEndDate(''); }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => addTransaction({
              date: new Date().toISOString().slice(0, 10),
              applicant_name: '',
              mobile_no: '',
              application_id: '',
              service_type: 'New Birth Reg',
              total_fee: 0,
              paid_amount: 0,
              delivery_status: 'UP Pending',
            })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> Add Row
            </button>
            <button onClick={() => exportToExcel(filtered)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-status-delivered text-primary-foreground text-sm font-medium hover:bg-status-delivered/90 transition-colors">
              <Download className="h-4 w-4" /> Export Excel
            </button>
          </div>
        </div>

        {search.trim() && <CustomerSummaryBanner transactions={filtered} searchQuery={search} />}

        <DataGrid
          transactions={filtered}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
          onAddService={(source) => addTransaction({
            mobile_no: source.mobile_no,
            date: source.date,
            applicant_name: source.applicant_name,
            service_type: 'New Birth Reg',
            total_fee: 0,
            paid_amount: 0,
            delivery_status: 'UP Pending',
            application_id: '',
          })}
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground pb-4">
          <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''} {(search || statusFilter || startDate || endDate) && `(filtered from ${transactions.length})`}</span>
          <span>Data auto-saved to cloud</span>
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          Developed & Maintained by Md. Rubel Islam | Digital Center Management System
        </p>
      </footer>
    </div>
  );
};

export default Index;
