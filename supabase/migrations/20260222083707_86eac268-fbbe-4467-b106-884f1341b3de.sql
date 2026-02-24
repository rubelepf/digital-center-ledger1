-- Drop old check constraint first
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_delivery_status_check;

-- Update existing data to new statuses
UPDATE public.transactions SET delivery_status = 'UP Pending' WHERE delivery_status = 'Pending';

-- Add new check constraint with updated statuses
ALTER TABLE public.transactions ADD CONSTRAINT transactions_delivery_status_check 
  CHECK (delivery_status IN ('UP Pending', 'Sent to Upazila', 'Upazila Received/Ready', 'Delivered'));