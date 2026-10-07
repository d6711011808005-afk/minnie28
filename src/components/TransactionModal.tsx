import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction, TransactionType } from '../types';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, getTodayDateString } from '../utils/constants';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<string>('transfer');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sync state when editing or opening
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod || 'transfer');
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount('');
      setDate(getTodayDateString());
      setPaymentMethod('promptpay');
      setNote('');
      // Set default category according to type
      const defaultCat = DEFAULT_CATEGORIES.find((c) => c.type === 'expense');
      setCategory(defaultCat ? defaultCat.name : 'อาหารและเครื่องดื่ม');
    }
    setErrorMsg('');
  }, [editingTransaction, isOpen]);

  // When type changes, pick sensible default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = DEFAULT_CATEGORIES.find((c) => c.type === newType);
    if (firstCat) {
      setCategory(firstCat.name);
    }
  };

  const handleAddPreset = (value: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + value).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!category.trim()) {
      setErrorMsg('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setErrorMsg('กรุณาเลือกวันที่');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      await onSubmit({
        type,
        amount: numAmount,
        category: category.trim(),
        date,
        paymentMethod,
        note: note.trim(),
      });

      if (type === 'income') {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💸 รายจ่าย (Expense)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💰 รายรับ (Income)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              จำนวนเงิน (บาท ฿) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl font-bold pl-4 pr-12 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-800 placeholder-slate-300 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                ฿
              </span>
            </div>

            {/* Quick add chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-400 mr-1">เพิ่มด่วน:</span>
              {[50, 100, 500, 1000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleAddPreset(preset)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer font-mono"
                >
                  +{preset.toLocaleString()}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 text-xs rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer ml-auto"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              วันที่ทำรายการ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-800"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              หมวดหมู่ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50">
              {filteredCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition cursor-pointer border ${
                      isSelected
                        ? 'bg-white border-indigo-500 text-indigo-700 font-semibold shadow-xs'
                        : 'border-transparent bg-white/60 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              ช่องทางการชำระเงิน
            </label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CategoryIcon name={pm.icon} className="w-3.5 h-3.5" />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <div className="relative">
              <textarea
                rows={2}
                maxLength={500}
                placeholder="เช่น ข้าวกลางวัน ซื้อของสด หรือโบนัสพิเศษ..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-3.5 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-800 placeholder-slate-300 resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>{editingTransaction ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
