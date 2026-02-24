
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  applicant_name TEXT NOT NULL DEFAULT '',
  mobile_no TEXT NOT NULL DEFAULT '',
  application_id TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL DEFAULT 'New Birth Reg' CHECK (service_type IN ('New Birth Reg', 'Correction', 'Reprint', 'Other Certificate')),
  total_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  due_amount NUMERIC(10,2) GENERATED ALWAYS AS (total_fee - paid_amount) STORED,
  delivery_status TEXT NOT NULL DEFAULT 'Pending' CHECK (delivery_status IN ('Pending', 'Delivered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access since this is an internal tool
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to transactions"
ON public.transactions
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
