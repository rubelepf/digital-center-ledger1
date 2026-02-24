import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, CheckCircle, Plus } from 'lucide-react';
import type { Transaction } from '@/hooks/useTransactions';
import { EditableCell } from './EditableCell';
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

interface MobileTransactionCardProps {
  group: CustomerGroup;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
  onAddService: () => void;
  onMarkPaid: () => void;
}

export function MobileTransactionCard({ group, onUpdate, onDelete, onAddService, onMarkPaid }: MobileTransactionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const hasDue = group.totalDue > 0;
  const isDelivered = group.services.every(s => s.delivery_status === 'Delivered');
  const cardBg = isDelivered ? 'border-status-delivered/30 bg-delivered-light' : hasDue ? 'border-destructive/20 bg-danger-light' : 'border-border bg-card';

  const firstId = group.services[0]?.id;

  return (
    <>
      <div className={`rounded-xl border ${cardBg} p-4 space-y-3`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <EditableCell value={group.applicant_name} onChange={v => { for (const s of group.services) onUpdate(s.id, 'applicant_name', v); }} className="font-semibold text-foreground text-sm bg-transparent outline-none w-full" placeholder="Name..." />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <EditableCell value={group.mobile_no} onChange={v => { for (const s of group.services) onUpdate(s.id, 'mobile_no', v); }} className="text-xs text-muted-foreground bg-transparent outline-none font-mono" placeholder="Mobile..." />
              <EditableCell type="date" value={group.date} onChange={v => onUpdate(firstId, 'date', v)} className="text-xs text-muted-foreground bg-transparent outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-background/60 p-2">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-sm font-bold font-mono">৳{group.grandTotalFee.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <p className="text-[10px] text-muted-foreground">Paid</p>
            <EditableCell type="number" value={group.totalPaid} onChange={v => { onUpdate(firstId, 'paid_amount', Number(v)); for (let i = 1; i < group.services.length; i++) onUpdate(group.services[i].id, 'paid_amount', 0); }} className="text-sm font-bold font-mono text-center bg-transparent outline-none w-full text-status-delivered" />
          </div>
          <div className="rounded-lg bg-background/60 p-2">
            <p className="text-[10px] text-muted-foreground">Due</p>
            <p className={`text-sm font-bold font-mono ${group.totalDue > 0 ? 'text-danger-text' : 'text-status-delivered'}`}>৳{group.totalDue.toFixed(0)}</p>
          </div>
        </div>

        {/* Pay full button */}
        {group.totalPaid < group.grandTotalFee && group.grandTotalFee > 0 && (
          <button onClick={onMarkPaid} className="w-full py-1.5 rounded-lg bg-status-delivered/10 text-status-delivered text-xs font-medium flex items-center justify-center gap-1 hover:bg-status-delivered/20 transition-colors">
            <CheckCircle className="h-3.5 w-3.5" /> Mark Fully Paid
          </button>
        )}

        {/* Expand services */}
        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between py-1.5 text-xs font-medium text-primary">
          <span>{group.services.length} Service{group.services.length > 1 ? 's' : ''}</span>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="space-y-2 pt-1 border-t border-border/50">
            {group.services.map((s, i) => (
              <div key={s.id} className="rounded-lg bg-background/50 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono">#{i + 1}</span>
                  {group.services.length > 1 && (
                    <button onClick={() => onDelete(s.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Service</p>
                    <select value={s.service_type} onChange={e => onUpdate(s.id, 'service_type', e.target.value)} className="w-full text-xs bg-transparent font-medium outline-none">
                      {SERVICE_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Fee</p>
                    <EditableCell type="number" value={s.total_fee} onChange={v => onUpdate(s.id, 'total_fee', Number(v))} className="text-xs bg-transparent outline-none w-full font-mono" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">App ID</p>
                    <EditableCell value={s.application_id} onChange={v => onUpdate(s.id, 'application_id', v)} className="text-xs bg-transparent outline-none w-full font-mono" placeholder="ID..." />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-0.5">Status</p>
                    <select value={s.delivery_status} onChange={e => onUpdate(s.id, 'delivery_status', e.target.value)} className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border w-full ${STATUS_BADGE_STYLES[s.delivery_status] || ''}`}>
                      {DELIVERY_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={onAddService} className="w-full py-1.5 rounded-lg border border-dashed border-primary/30 text-primary text-xs font-medium flex items-center justify-center gap-1 hover:bg-primary/5 transition-colors">
              <Plus className="h-3 w-3" /> Add Service
            </button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {group.applicant_name} and {group.services.length} service(s)? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { for (const s of group.services) onDelete(s.id); setShowDeleteConfirm(false); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
