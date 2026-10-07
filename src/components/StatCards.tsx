import React from 'react';
import { ArrowDownRight, ArrowUpRight, Wallet, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/constants';

interface Props {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyBudget: number;
  onOpenBudgetModal: () => void;
  prevIncomeDiff?: number;
  prevExpenseDiff?: number;
}

export const StatCards: React.FC<Props> = ({
  totalIncome,
  totalExpense,
  balance,
  monthlyBudget,
  onOpenBudgetModal,
  prevIncomeDiff = 0,
  prevExpenseDiff = 0,
}) => {
  const budgetPercent = monthlyBudget > 0 ? (totalExpense / monthlyBudget) * 100 : 0;
  const isOverBudget = budgetPercent > 100;
  const isNearBudget = budgetPercent >= 80 && !isOverBudget;
  const remainingBudget = monthlyBudget - totalExpense;

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-200 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายรับรวม (Income)
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {prevIncomeDiff !== 0 && (
              <span
                className={`font-medium flex items-center ${
                  prevIncomeDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {prevIncomeDiff >= 0 ? '+' : ''}
                {prevIncomeDiff.toFixed(1)}%
              </span>
            )}
            <span className="text-slate-400">เทียบเดือนก่อน</span>
          </div>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-rose-200 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายจ่ายรวม (Expense)
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight text-rose-600">
            {formatCurrency(totalExpense)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {prevExpenseDiff !== 0 && (
              <span
                className={`font-medium flex items-center ${
                  prevExpenseDiff <= 0 ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {prevExpenseDiff > 0 ? '+' : ''}
                {prevExpenseDiff.toFixed(1)}%
              </span>
            )}
            <span className="text-slate-400">เทียบเดือนก่อน</span>
          </div>
        </div>
      </div>

      {/* 3. Net Balance */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-200 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            คงเหลือสุทธิ (Balance)
          </span>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl font-bold tracking-tight ${
              balance >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(balance)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>
              อัตราการออม{' '}
              <strong className={savingsRate >= 0 ? 'text-indigo-600' : 'text-rose-500'}>
                {savingsRate.toFixed(1)}%
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Monthly Budget Tracker */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:border-amber-200 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              งบประมาณเดือนนี้
            </span>
            <button
              onClick={onOpenBudgetModal}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
              title="แก้ไขงบประมาณ"
            >
              แก้ไข
            </button>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isOverBudget
                ? 'bg-rose-100 text-rose-600 animate-pulse'
                : isNearBudget
                ? 'bg-amber-50 text-amber-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {isOverBudget ? <AlertTriangle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(totalExpense)}
            </span>
            <span className="text-xs text-slate-400">
              / {formatCurrency(monthlyBudget)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : isNearBudget
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] mt-1.5 font-medium">
            <span
              className={
                isOverBudget
                  ? 'text-rose-600'
                  : isNearBudget
                  ? 'text-amber-600'
                  : 'text-slate-500'
              }
            >
              ใช้ไป {budgetPercent.toFixed(0)}%
            </span>
            <span className={remainingBudget < 0 ? 'text-rose-600' : 'text-slate-400'}>
              {remainingBudget >= 0
                ? `เหลือ ${formatCurrency(remainingBudget)}`
                : `เกินงบ ${formatCurrency(Math.abs(remainingBudget))}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
