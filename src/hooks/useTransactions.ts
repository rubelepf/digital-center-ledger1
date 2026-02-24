import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  date: string;
  applicant_name: string;
  mobile_no: string;
  application_id: string;
  service_type: string;
  total_fee: number;
  paid_amount: number;
  due_amount: number;
  delivery_status: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading data', description: error.message, variant: 'destructive' });
    }
    if (data) {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (defaults?: Partial<Transaction>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...defaults, user_id: user.id } as any)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding row', description: error.message, variant: 'destructive' });
    } else if (data) {
      setTransactions(prev => [data as Transaction, ...prev]);
      toast({ title: 'New row added ✓' });
    }
    return { data, error };
  };

  const updateTransaction = async (id: string, field: string, value: string | number) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: value };
        if (field === 'total_fee' || field === 'paid_amount') {
          const totalFee = field === 'total_fee' ? Number(value) : t.total_fee;
          const paidAmount = field === 'paid_amount' ? Number(value) : t.paid_amount;
          updated.due_amount = totalFee - paidAmount;
        }
        return updated;
      })
    );

    const { error } = await supabase
      .from('transactions')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      fetchTransactions();
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      fetchTransactions();
    } else {
      toast({ title: 'Record deleted ✓' });
    }
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, refetch: fetchTransactions };
}
