import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, formatCurrency, formatThaiDate } from '../utils/constants';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEdit: (item: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  monthLabel: string;
}

export const TransactionList: React.FC<Props> = ({
  transactions,
  onOpenAddModal,
  onEdit,
  onDelete,
  monthLabel,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNote = t.note?.toLowerCase().includes(query);
        const matchCat = t.category.toLowerCase().includes(query);
        const matchMethod = t.paymentMethod?.toLowerCase().includes(query);
        const matchAmount = t.amount.toString().includes(query);
        if (!matchNote && !matchCat && !matchMethod && !matchAmount) return false;
      }
      return true;
    });
  }, [transactions, filterType, selectedCategory, searchQuery]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filtered.forEach((t) => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });

    // Sort dates descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        items: groups[date],
        totalIncome: groups[date]
          .filter((i) => i.type === 'income')
          .reduce((sum, i) => sum + i.amount, 0),
        totalExpense: groups[date]
          .filter((i) => i.type === 'expense')
          .reduce((sum, i) => sum + i.amount, 0),
      }));
  }, [filtered]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(itemToDelete.id);
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryMeta = (catName: string) => {
    return DEFAULT_CATEGORIES.find((c) => c.name === catName) || {
      icon: 'MoreHorizontal',
      color: '#64748b',
    };
  };

  const getPaymentMethodLabel = (pmId?: string) => {
    return PAYMENT_METHODS.find((p) => p.id === pmId)?.label || pmId || 'โอนเงิน';
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col space-y-5">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            รายการบันทึก ({monthLabel})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            พบ {filtered.length} จากทั้งหมด {transactions.length} รายการ
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>บันทึกรายการ</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Type Filter Buttons */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'expense'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            รายจ่าย
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'income'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            รายรับ
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ค้นหาหมวดหมู่, บันทึกย่อ, จำนวนเงิน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Select */}
        <div className="relative min-w-[150px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="เลือกหมวดหมู่เพื่อกรองรายการ"
            className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List Grouped */}
      {groupedByDate.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 text-2xl">
            📝
          </div>
          <h3 className="font-semibold text-slate-700">ไม่พบรายการที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {searchQuery || selectedCategory !== 'all' || filterType !== 'all'
              ? 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่'
              : 'ยังไม่มีข้อมูลในเดือนนี้ กดปุ่มด้านล่างเพื่อเริ่มบันทึกรายการแรก'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มรายการใหม่</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Date Header with Daily Sub-totals */}
              <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatThaiDate(group.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  {group.totalIncome > 0 && (
                    <span className="text-emerald-600 font-medium">
                      +{formatCurrency(group.totalIncome)}
                    </span>
                  )}
                  {group.totalExpense > 0 && (
                    <span className="text-rose-600 font-medium">
                      -{formatCurrency(group.totalExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in this day */}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const meta = getCategoryMeta(item.category);
                  const isExp = item.type === 'expense';

                  return (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xs transition duration-150"
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${meta.color}15`,
                            color: meta.color,
                          }}
                        >
                          <CategoryIcon name={meta.icon} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm truncate">
                              {item.category}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium flex-shrink-0">
                              {getPaymentMethodLabel(item.paymentMethod)}
                            </span>
                          </div>
                          {item.note && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <div className="text-right">
                          <div
                            className={`text-sm font-bold font-mono ${
                              isExp ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isExp ? '-' : '+'}
                            {formatCurrency(item.amount)}
                          </div>
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => onEdit(item)}
                            title="แก้ไข"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            title="ลบ"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-800 text-base">ยืนยันการลบรายการ?</h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณกำลังจะลบ &quot;{itemToDelete.category}&quot; จำนวน{' '}
                <strong className="text-slate-800 font-mono">
                  {formatCurrency(itemToDelete.amount)}
                </strong>
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? 'กำลังลบ...' : 'ลบรายการ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
