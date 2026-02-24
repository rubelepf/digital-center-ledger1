import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History } from 'lucide-react';

interface AuditEntry {
  id: string;
  user_id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  changed_at: string;
}

export function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(100);
      if (data) setLogs(data as AuditEntry[]);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const getChangedFields = (old_data: Record<string, any> | null, new_data: Record<string, any> | null) => {
    if (!old_data || !new_data) return [];
    return Object.keys(new_data).filter(k => 
      !['updated_at', 'created_at'].includes(k) && JSON.stringify(old_data[k]) !== JSON.stringify(new_data[k])
    );
  };

  const actionColors: Record<string, string> = {
    INSERT: 'bg-status-delivered-light text-status-delivered',
    UPDATE: 'bg-status-up-pending-light text-status-up-pending',
    DELETE: 'bg-destructive/10 text-destructive',
  };

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading audit logs...</p>;

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Audit Log (Recent 100)</h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {logs.length === 0 && <p className="text-sm text-muted-foreground">No audit records found.</p>}
          {logs.map(log => {
            const changedFields = log.action === 'UPDATE' ? getChangedFields(log.old_data, log.new_data) : [];
            const name = log.new_data?.applicant_name || log.old_data?.applicant_name || 'Unknown';
            return (
              <div key={log.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${actionColors[log.action] || ''}`}>{log.action}</span>
                    <span className="font-medium text-foreground">{name}</span>
                  </div>
                  <span className="text-muted-foreground">{new Date(log.changed_at).toLocaleString('bn-BD')}</span>
                </div>
                {log.action === 'UPDATE' && changedFields.length > 0 && (
                  <div className="text-muted-foreground">
                    {changedFields.map(f => (
                      <span key={f} className="inline-block mr-2">
                        <span className="font-medium">{f}:</span>{' '}
                        <span className="line-through text-destructive/70">{String(log.old_data?.[f] ?? '')}</span>{' → '}
                        <span className="text-status-delivered">{String(log.new_data?.[f] ?? '')}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
