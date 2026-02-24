import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, UserPlus, Trash2 } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export function RoleManager() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'operator'>('operator');
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    const { data } = await supabase.from('user_roles').select('*');
    if (data) setRoles(data as UserRole[]);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, []);

  const addRole = async () => {
    if (!newUserId.trim()) return;
    const { error } = await supabase.from('user_roles').insert({ user_id: newUserId.trim(), role: newRole });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Role added ✓' });
      setNewUserId('');
      fetchRoles();
    }
  };

  const removeRole = async (id: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Role removed ✓' });
      fetchRoles();
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading...</p>;

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">User Role Management</h3>
      </div>

      <div className="space-y-2 mb-4">
        {roles.map(r => (
          <div key={r.id} className="flex items-center justify-between p-2 rounded-lg border border-border bg-card text-xs">
            <div>
              <span className="font-mono text-muted-foreground">{r.user_id.slice(0, 8)}...</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full font-semibold ${r.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>
                {r.role}
              </span>
            </div>
            <button onClick={() => removeRole(r.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="User ID (UUID)"
          value={newUserId}
          onChange={e => setNewUserId(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs outline-none focus:ring-2 focus:ring-primary font-mono"
        />
        <select
          value={newRole}
          onChange={e => setNewRole(e.target.value as 'admin' | 'operator')}
          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs"
        >
          <option value="operator">Operator</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={addRole} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <UserPlus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
