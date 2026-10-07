import { CategoryItem } from '../types';

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  // Expenses
  { id: 'food', name: 'อาหารและเครื่องดื่ม', icon: 'Utensils', color: '#f59e0b', type: 'expense' },
  { id: 'transport', name: 'การเดินทาง / ยานพาหนะ', icon: 'Car', color: '#3b82f6', type: 'expense' },
  { id: 'shopping', name: 'ช้อปปิ้ง / ของใช้', icon: 'ShoppingBag', color: '#ec4899', type: 'expense' },
  { id: 'housing', name: 'ที่พัก / ค่าน้ำค่าไฟ / เน็ต', icon: 'Home', color: '#06b6d4', type: 'expense' },
  { id: 'entertainment', name: 'ความบันเทิง / สังสรรค์', icon: 'Film', color: '#8b5cf6', type: 'expense' },
  { id: 'health', name: 'สุขภาพ / ยารักษาโรค', icon: 'HeartPulse', color: '#10b981', type: 'expense' },
  { id: 'education', name: 'การศึกษา / พัฒนาตนเอง', icon: 'BookOpen', color: '#6366f1', type: 'expense' },
  { id: 'bills', name: 'บิล / ภาระหนี้สิน / ผ่อนชำระ', icon: 'Receipt', color: '#f43f5e', type: 'expense' },
  { id: 'family', name: 'ครอบครัว / พ่อแม่ / บุตร', icon: 'Users', color: '#fb7185', type: 'expense' },
  { id: 'other_exp', name: 'รายจ่ายอื่นๆ', icon: 'MoreHorizontal', color: '#64748b', type: 'expense' },

  // Incomes
  { id: 'salary', name: 'เงินเดือนประจำ', icon: 'Briefcase', color: '#10b981', type: 'income' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', icon: 'Laptop', color: '#0ea5e9', type: 'income' },
  { id: 'bonus', name: 'โบนัส / เงินรางวัล', icon: 'Gift', color: '#eab308', type: 'income' },
  { id: 'investment', name: 'ปันผล / ดอกเบี้ย / กำไรหุ้น', icon: 'TrendingUp', color: '#8b5cf6', type: 'income' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', icon: 'Store', color: '#f97316', type: 'income' },
  { id: 'gift', name: 'ของขวัญ / ช่วยเหลือ', icon: 'Heart', color: '#f43f5e', type: 'income' },
  { id: 'other_inc', name: 'รายรับอื่นๆ', icon: 'CircleDollarSign', color: '#14b8a6', type: 'income' },
];

export const PAYMENT_METHODS = [
  { id: 'transfer', label: 'โอนเงิน / บัญชีธนาคาร', icon: 'Send' },
  { id: 'promptpay', label: 'พร้อมเพย์ (PromptPay)', icon: 'QrCode' },
  { id: 'cash', label: 'เงินสด', icon: 'Banknote' },
  { id: 'credit_card', label: 'บัตรเครดิต / เดบิต', icon: 'CreditCard' },
  { id: 'ewallet', label: 'E-Wallet / วอลเล็ท', icon: 'Smartphone' },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ฿`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}k ฿`;
  }
  return `${amount.toLocaleString()} ฿`;
}

export function formatThaiDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const thaiYear = year + 543;
    return `${day} ${THAI_MONTHS_SHORT[month - 1]} ${thaiYear}`;
  } catch {
    return dateStr;
  }
}

export function formatThaiDateFull(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const thaiYear = year + 543;
    return `${day} ${THAI_MONTHS[month - 1]} พ.ศ. ${thaiYear}`;
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
