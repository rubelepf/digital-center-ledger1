import { useState, useMemo } from 'react';
import { Trash2, CheckCircle, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import type { Transaction } from '@/hooks/useTransactions';
import { EditableCell } from '@/components/EditableCell';
import { MobileTransactionCard } from '@/components/MobileTransactionCard';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SERVICE_TYPES = ['New Birth Reg', 'Correction', 'Reprint', 'Other Certificate'];
const DELIVERY_STATUSES = ['UP Pending', 'Sent to Upazila', 'Upazila Received/Ready', 'Delivered'];

const STATUS_BADGE_STYLES: Record<string, string> = {
  'UP Pending': 'bg-status-up-pending-light text-status-up-pending border-status-up-pending/30',
  'Sent to Upazila': 'bg-status-sent-upazila-light text-status-sent-upazila border-status-sent-upazila/30',
  'Upazila Received/Ready': 'bg-status-received-light text-status-received border-status-received/30',
  'Delivered': 'bg-status-delivered-light text-status-delivered border-status-delivered/30',
};

interface CustomerGroup {
  key: string;
  mobile_no: string;
  applicant_name: string;
  date: string;
  services: Transaction[];
  grandTotalFee: number;
  totalPaid: number;
  totalDue: number;
}

interface DataGridProps {
  transactions: Transaction[];
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
  onAddService: (source: { mobile_no: string; applicant_name: string; date: string }) => void;
}

function PaymentBadge({ totalFee, paidAmount }: { totalFee: number; paidAmount: number }) {
  let label: string;
  let badgeClass: string;

  if (paidAmount <= 0) {
    label = '🔴 Unpaid';
    badgeClass = 'bg-destructive/10 text-destructive border-destructive/30';
  } else if (paidAmount < totalFee) {
    label = '🟡 Partial';
    badgeClass = 'bg-status-up-pending-light text-status-up-pending border-status-up-pending/30';
  } else {
    label = '🟢 Paid';
    badgeClass = 'bg-status-delivered-light text-status-delivered border-status-delivered/30';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
      {label}
    </span>
  );
}

function MasterRow({ group, expanded, onToggle, onUpdate, onMarkPaid, onDeleteGroup }: {
  group: CustomerGroup;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onMarkPaid: () => void;
  onDeleteGroup: () => void;
}) {
  const firstId = group.services[0]?.id;
  const hasDue = group.totalDue > 0;
  const isDelivered = group.services.every(s => s.delivery_status === 'Delivered');
  const rowBg = isDelivered ? 'bg-delivered-light' : hasDue ? 'bg-danger-light' : 'bg-card';

  return (
    <tr className={`${rowBg} hover:brightness-[0.97] transition-all cursor-pointer`} onClick={onToggle}>
      <td className={`grid-cell w-10 ${rowBg}`}>
        <button className="p-0.5 text-muted-foreground hover:text-primary transition-colors">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </td>
      <td className={`grid-cell ${rowBg}`} onClick={e => e.stopPropagation()}>
        <EditableCell
          type="date"
          value={group.date}
          onChange={v => onUpdate(firstId, 'date', v)}
          className="grid-cell-input"
        />
      </td>
      <td className={`grid-cell font-medium ${rowBg}`} onClick={e => e.stopPropagation()}>
        <EditableCell
          value={group.applicant_name}
          onChange={v => {
            for (const s of group.services) onUpdate(s.id, 'applicant_name', v);
          }}
          className="grid-cell-input"
        />
      </td>
      <td className={`grid-cell ${rowBg}`} onClick={e => e.stopPropagation()}>
        <EditableCell
          value={group.mobile_no}
          onChange={v => {
            for (const s of group.services) onUpdate(s.id, 'mobile_no', v);
          }}
          className="grid-cell-input"
        />
      </td>
      <td className={`grid-cell text-center font-semibold text-primary ${rowBg}`}>
        {group.services.length}
      </td>
      <td className={`grid-cell font-mono font-semibold ${rowBg}`}>
        ৳{group.grandTotalFee.toLocaleString()}
      </td>
      <td className={`grid-cell ${rowBg}`} onClick={e => e.stopPropagation()}>
        <EditableCell
          type="number"
          min="0"
          step="any"
          value={group.totalPaid}
          onChange={v => {
            const val = Number(v);
            onUpdate(firstId, 'paid_amount', val);
            for (let i = 1; i < group.services.length; i++) {
              onUpdate(group.services[i].id, 'paid_amount', 0);
            }
          }}
          className="grid-cell-input !bg-[hsl(var(--status-up-pending-light))]"
        />
      </td>
      <td className={`grid-cell font-mono font-semibold ${group.totalDue > 0 ? 'text-danger-text' : 'text-status-delivered'} ${rowBg}`}>
        ৳{group.totalDue.toFixed(2)}
      </td>
      <td className={`grid-cell ${rowBg}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <PaymentBadge totalFee={group.grandTotalFee} paidAmount={group.totalPaid} />
          {group.totalPaid < group.grandTotalFee && group.grandTotalFee > 0 && (
            <button
              onClick={onMarkPaid}
              className="p-0.5 rounded hover:bg-status-delivered/10 text-status-delivered transition-colors"
              title="Mark as fully paid"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </td>
      <td className={`grid-cell ${rowBg}`} onClick={e => e.stopPropagation()}>
        <button
          onClick={onDeleteGroup}
          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete customer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

function DetailRows({ group, onUpdate, onDelete, onAddService }: {
  group: CustomerGroup;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
  onAddService: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <tr>
      <td colSpan={10} className="p-0 bg-muted/30">
        <div className="px-6 py-3 border-b border-grid-border">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-left border-b border-grid-border">#</th>
                <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-left border-b border-grid-border">Service Type</th>
                <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-left border-b border-grid-border">Application ID</th>
                <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-left border-b border-grid-border">Service Fee</th>
                <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-left border-b border-grid-border">Delivery Status</th>
                <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-left border-b border-grid-border w-10"></th>
              </tr>
            </thead>
            <tbody>
              {group.services.map((s, i) => (
                <tr key={s.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-3 py-1.5 text-xs text-muted-foreground font-mono">{i + 1}</td>
                  <td className="px-3 py-1.5">
                    <select
                      value={s.service_type}
                      onChange={e => onUpdate(s.id, 'service_type', e.target.value)}
                      className="text-sm bg-transparent outline-none cursor-pointer font-medium"
                    >
                      {SERVICE_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <EditableCell
                      value={s.application_id}
                      onChange={v => onUpdate(s.id, 'application_id', v)}
                      className="text-sm bg-transparent outline-none w-full font-mono"
                      placeholder="Enter ID..."
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <EditableCell
                      type="number"
                      value={s.total_fee}
                      onChange={v => onUpdate(s.id, 'total_fee', Number(v))}
                      className="text-sm bg-transparent outline-none w-20 font-mono"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <select
                      value={s.delivery_status}
                      onChange={e => onUpdate(s.id, 'delivery_status', e.target.value)}
                      className={`text-[11px] font-semibold rounded-full px-2 py-0.5 border cursor-pointer ${STATUS_BADGE_STYLES[s.delivery_status] || ''}`}
                    >
                      {DELIVERY_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    {group.services.length > 1 && (
                      <button
                        onClick={() => handleDelete(s.id)}
                        className={`p-1 rounded transition-colors ${confirmDelete === s.id ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive'}`}
                        title={confirmDelete === s.id ? 'Click again to confirm' : 'Delete service'}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={onAddService}
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/5"
          >
            <Plus className="h-3 w-3" /> Add Service
          </button>
        </div>
      </td>
    </tr>
  );
}

export function DataGrid({ transactions, onUpdate, onDelete, onAddService }: DataGridProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const groups: CustomerGroup[] = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const key = `${t.mobile_no}||${t.applicant_name}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }

    return Array.from(map.entries()).map(([key, services]) => {
      const grandTotalFee = services.reduce((s, t) => s + Number(t.total_fee), 0);
      const totalPaid = services.reduce((s, t) => s + Number(t.paid_amount), 0);
      return {
        key,
        mobile_no: services[0].mobile_no,
        applicant_name: services[0].applicant_name,
        date: services[0].date,
        services,
        grandTotalFee,
        totalPaid,
        totalDue: grandTotalFee - totalPaid,
      };
    });
  }, [transactions]);

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        {groups.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No records found. Click "+ Add Row" to start.</div>
        )}
        {groups.map(group => (
          <MobileTransactionCard
            key={group.key}
            group={group}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddService={() => onAddService({ mobile_no: group.mobile_no, applicant_name: group.applicant_name, date: group.date })}
            onMarkPaid={() => onUpdate(group.services[0].id, 'paid_amount', group.grandTotalFee)}
          />
        ))}
      </div>
    );
  }

  const masterHeaders = ['', 'Date', 'Applicant Name', 'Mobile No', 'Services', 'Grand Total Fee', 'Total Paid', 'Total Due', 'Payment Status', ''];

  return (
    <div className="border border-grid-border rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr>
              {masterHeaders.map(h => (
                <th key={h} className="grid-header-cell text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr>
                <td colSpan={10} className="grid-cell text-center py-12 text-muted-foreground">
                  No records found. Click "+ Add Row" to start.
                </td>
              </tr>
            )}
            {groups.map(group => {
              const expanded = expandedKeys.has(group.key);
              return (
                <MasterRowGroup
                  key={group.key}
                  group={group}
                  expanded={expanded}
                  onToggle={() => toggleExpand(group.key)}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onAddService={() => onAddService({
                    mobile_no: group.mobile_no,
                    applicant_name: group.applicant_name,
                    date: group.date,
                  })}
                  onMarkPaid={() => {
                    // Set first service paid_amount to grand total
                    const firstId = group.services[0].id;
                    onUpdate(firstId, 'paid_amount', group.grandTotalFee);
                  }}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MasterRowGroup({ group, expanded, onToggle, onUpdate, onDelete, onAddService, onMarkPaid }: {
  group: CustomerGroup;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
  onAddService: () => void;
  onMarkPaid: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteGroup = () => {
    for (const s of group.services) {
      onDelete(s.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <MasterRow
        group={group}
        expanded={expanded}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onMarkPaid={onMarkPaid}
        onDeleteGroup={() => setShowDeleteConfirm(true)}
      />
      {expanded && (
        <DetailRows
          group={group}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddService={onAddService}
        />
      )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer and all their associated services ({group.services.length} service{group.services.length > 1 ? 's' : ''})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
