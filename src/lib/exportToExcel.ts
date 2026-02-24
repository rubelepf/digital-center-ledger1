import * as XLSX from 'xlsx';
import type { Transaction } from '@/hooks/useTransactions';

export function exportToExcel(transactions: Transaction[]) {
  const data = transactions.map((t, i) => ({
    '#': i + 1,
    Date: t.date,
    'Applicant Name': t.applicant_name,
    'Mobile No': t.mobile_no,
    'Application ID': t.application_id,
    'Service Type': t.service_type,
    'Total Fee': Number(t.total_fee),
    'Paid Amount': Number(t.paid_amount),
    'Due Amount': Number(t.due_amount),
    'Delivery Status': t.delivery_status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `UP_Digital_Center_${today}.xlsx`);
}
