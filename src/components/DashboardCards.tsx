import { FileText, Clock, Send, PackageCheck, CheckCircle2, Landmark } from 'lucide-react';
import type { Transaction } from '@/hooks/useTransactions';

interface DashboardCardsProps {
  transactions: Transaction[];
}

export function DashboardCards({ transactions }: DashboardCardsProps) {
  const total = transactions.length;
  const upPending = transactions.filter(t => t.delivery_status === 'UP Pending').length;
  const sentUpazila = transactions.filter(t => t.delivery_status === 'Sent to Upazila').length;
  const upazilaReady = transactions.filter(t => t.delivery_status === 'Upazila Received/Ready').length;
  const delivered = transactions.filter(t => t.delivery_status === 'Delivered').length;
  const govtFee = total * 50;

  const cards = [
    { label: 'Total Applications', value: total, icon: FileText, accent: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending at UP', value: upPending, icon: Clock, accent: 'text-status-up-pending', bg: 'bg-status-up-pending-light' },
    { label: 'Pending at Upazila', value: sentUpazila, icon: Send, accent: 'text-status-sent-upazila', bg: 'bg-status-sent-upazila-light' },
    { label: 'Ready for Delivery', value: upazilaReady, icon: PackageCheck, accent: 'text-status-received', bg: 'bg-status-received-light' },
    { label: 'Total Delivered', value: delivered, icon: CheckCircle2, accent: 'text-status-delivered', bg: 'bg-status-delivered-light' },
    { label: `Govt. Fee (৳50×${total})`, value: `৳${govtFee.toLocaleString()}`, icon: Landmark, accent: 'text-primary', bg: 'bg-accent' },
  ];

    return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(card => (
        <div key={card.label} className="stat-card flex items-center gap-3">
          <div className={`${card.bg} ${card.accent} p-2.5 rounded-lg`}>
            <card.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
            <p className="text-xl font-bold text-foreground">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
