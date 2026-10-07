import React, { useState } from 'react';
import { X, Target, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/constants';

interface Props {
  isOpen: boolean;
  currentBudget: number;
  onClose: () => void;
  onSave: (newBudget: number) => Promise<void>;
}

export const BudgetModal: React.FC<Props> = ({ isOpen, currentBudget, onClose, onSave }) => {
  const [budgetVal, setBudgetVal] = useState<string>(currentBudget.toString());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetVal);
    if (isNaN(val) || val < 0) {
      setErrorMsg('กรุณากรอกงบประมาณที่ถูกต้อง');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave(val);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกงบประมาณ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presets = [10000, 15000, 20000, 30000, 50000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-800">ตั้งเป้างบประมาณรายเดือน</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            กำหนดเพดานรายจ่ายที่คุณต้องการควบคุมในแต่ละเดือน ระบบจะคำนวณสัดส่วนและแจ้งเตือนเมื่อใกล้ถึงขีดจำกัด
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              งบประมาณต่อเดือน (บาท ฿)
            </label>
            <div className="relative">
              <input
                type="number"
                step="500"
                min="0"
                required
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="w-full text-xl font-bold pl-4 pr-12 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-800 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                ฿
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1.5">งบประมาณแนะนำ:</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setBudgetVal(p.toString())}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                    budgetVal === p.toString()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {formatCurrency(p)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
