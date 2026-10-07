import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { Plus, Database, Sparkles, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from './firebase';
import { transactionService } from './services/transactionService';
import { Transaction, DailyDataPoint, CategoryDataPoint } from './types';
import {
  THAI_MONTHS,
  DEFAULT_CATEGORIES,
  formatCurrency,
  getTodayDateString,
} from './utils/constants';
import { getInitialDemoTransactions } from './utils/sampleData';

import { Navbar } from './components/Navbar';
import { MonthNavigator } from './components/MonthNavigator';
import { StatCards } from './components/StatCards';
import { CategoryDonutChart } from './components/CategoryDonutChart';
import { DailyBarChart } from './components/DailyBarChart';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(20000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Month navigation state
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Helper to show auto-dismiss toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  }, []);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        setIsSyncing(true);
        // Load user budget
        try {
          const budget = await transactionService.getUserBudget(currentUser.uid);
          setMonthlyBudget(budget);
        } catch {
          // fallback
        }
      } else {
        // If not logged in, load from local storage or default demo
        const saved = localStorage.getItem('minnie32_local_transactions');
        if (saved) {
          try {
            setTransactions(JSON.parse(saved));
          } catch {
            setTransactions(getInitialDemoTransactions('guest'));
          }
        } else {
          setTransactions(getInitialDemoTransactions('guest'));
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Transactions Listener when user is authenticated
  useEffect(() => {
    if (!user) return;

    setIsSyncing(true);
    const unsubscribe = transactionService.subscribeUserTransactions(
      user.uid,
      (remoteTransactions) => {
        setTransactions(remoteTransactions);
        setIsSyncing(false);
      },
      (error) => {
        console.error('Subscription error:', error);
        setIsSyncing(false);
        showToast('ไม่สามารถดึงข้อมูลจาก Firebase ได้ โปรดตรวจสอบการเชื่อมต่อ');
      }
    );

    return () => unsubscribe();
  }, [user, showToast]);

  // Save to local storage when not logged in
  useEffect(() => {
    if (!user && transactions.length > 0) {
      localStorage.setItem('minnie32_local_transactions', JSON.stringify(transactions));
    }
  }, [user, transactions]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      setIsSyncing(true);
      await signInWithPopup(auth, googleProvider);
      showToast('เข้าสู่ระบบสำเร็จ ข้อมูลของคุณจะถูกซิงค์กับ Firebase minnie32');
    } catch (err: unknown) {
      console.error('Login error:', err);
      showToast(err instanceof Error ? err.message : 'เข้าสู่ระบบล้มเหลว');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch (err: unknown) {
      console.error('Sign out error:', err);
    }
  };

  // Add / Edit Transaction Handler
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (user) {
      // Authenticated with Firebase
      setIsSyncing(true);
      try {
        if (editingTransaction) {
          await transactionService.updateTransaction(user.uid, editingTransaction.id, data);
          showToast('แก้ไขรายการสำเร็จและบันทึกใน Firebase แล้ว');
        } else {
          await transactionService.addTransaction(user.uid, data);
          showToast('บันทึกรายการสำเร็จใน Firebase (minnie32)');
        }
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Local Guest mode
      if (editingTransaction) {
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === editingTransaction.id
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          )
        );
        showToast('แก้ไขรายการสำเร็จ');
      } else {
        const newItem: Transaction = {
          ...data,
          id: 'local-' + Date.now(),
          userId: 'guest',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTransactions((prev) => [newItem, ...prev]);
        showToast('บันทึกรายการสำเร็จ');
      }
    }
    setEditingTransaction(null);
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      setIsSyncing(true);
      try {
        await transactionService.deleteTransaction(user.uid, id);
        showToast('ลบรายการสำเร็จ');
      } finally {
        setIsSyncing(false);
      }
    } else {
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      showToast('ลบรายการสำเร็จ');
    }
  };

  // Save Budget Handler
  const handleSaveBudget = async (newBudget: number) => {
    setMonthlyBudget(newBudget);
    if (user) {
      await transactionService.setUserBudget(user.uid, newBudget);
      showToast('บันทึกงบประมาณลง Firebase แล้ว');
    } else {
      localStorage.setItem('minnie32_budget', newBudget.toString());
      showToast('บันทึกงบประมาณสำเร็จ');
    }
  };

  // Reset / Populate Demo Data
  const handleResetDemoData = async () => {
    const demoItems = getInitialDemoTransactions(user ? user.uid : 'demo_user');
    if (user) {
      setIsSyncing(true);
      try {
        for (const item of demoItems) {
          await transactionService.addTransaction(user.uid, {
            type: item.type,
            amount: item.amount,
            category: item.category,
            date: item.date,
            note: item.note,
            paymentMethod: item.paymentMethod,
          });
        }
        showToast('เพิ่มชุดข้อมูลตัวอย่างไปยัง Firebase เรียบร้อย');
      } catch (err: unknown) {
        showToast('ไม่สามารถเพิ่มข้อมูลตัวอย่างได้: ' + (err instanceof Error ? err.message : ''));
      } finally {
        setIsSyncing(false);
      }
    } else {
      setTransactions(demoItems);
      showToast('โหลดข้อมูลตัวอย่างเรียบร้อย');
    }
  };

  // Filter transactions for Selected Month
  const selectedMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonthStr));
  }, [transactions, selectedMonthStr]);

  // Compute Summary Statistics
  const { totalIncome, totalExpense, balance, categoryData, dailyData } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    const catMap: { [cat: string]: { amount: number; count: number } } = {};

    // Days in current selected month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dayMap: { [day: number]: { income: number; expense: number } } = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dayMap[d] = { income: 0, expense: 0 };
    }

    monthTransactions.forEach((t) => {
      const dayNum = parseInt(t.date.split('-')[2], 10);
      if (t.type === 'income') {
        inc += t.amount;
        if (dayMap[dayNum]) {
          dayMap[dayNum].income += t.amount;
        }
      } else {
        exp += t.amount;
        if (dayMap[dayNum]) {
          dayMap[dayNum].expense += t.amount;
        }
        if (!catMap[t.category]) {
          catMap[t.category] = { amount: 0, count: 0 };
        }
        catMap[t.category].amount += t.amount;
        catMap[t.category].count += 1;
      }
    });

    // Category data with colors
    const catList: CategoryDataPoint[] = Object.keys(catMap).map((catName) => {
      const meta = DEFAULT_CATEGORIES.find((c) => c.name === catName);
      const amount = catMap[catName].amount;
      const count = catMap[catName].count;
      const percentage = exp > 0 ? (amount / exp) * 100 : 0;
      return {
        name: catName,
        amount,
        count,
        color: meta?.color || '#94a3b8',
        percentage,
        icon: meta?.icon,
      };
    });

    catList.sort((a, b) => b.amount - a.amount);

    // Daily data array
    const dailyList: DailyDataPoint[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dData = dayMap[d] || { income: 0, expense: 0 };
      dailyList.push({
        day: d,
        dateStr: `${selectedMonthStr}-${String(d).padStart(2, '0')}`,
        income: dData.income,
        expense: dData.expense,
        net: dData.income - dData.expense,
      });
    }

    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp,
      categoryData: catList,
      dailyData: dailyList,
    };
  }, [monthTransactions, selectedYear, selectedMonth, selectedMonthStr]);

  // Compute Previous Month Diff
  const { prevIncomeDiff, prevExpenseDiff } = useMemo(() => {
    const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const prevMonthItems = transactions.filter((t) => t.date.startsWith(prevMonthStr));
    const prevInc = prevMonthItems
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const prevExp = prevMonthItems
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const incDiff = prevInc > 0 ? ((totalIncome - prevInc) / prevInc) * 100 : 0;
    const expDiff = prevExp > 0 ? ((totalExpense - prevExp) / prevExp) * 100 : 0;

    return { prevIncomeDiff: incDiff, prevExpenseDiff: expDiff };
  }, [transactions, selectedYear, selectedMonth, totalIncome, totalExpense]);

  // Compute Multi-Month Trend (Last 6 Months)
  const monthlyTrendData = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const mStr = `${y}-${String(m).padStart(2, '0')}`;
      const items = transactions.filter((t) => t.date.startsWith(mStr));
      const inc = items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      result.push({
        label: `${THAI_MONTHS[m - 1].slice(0, 3)}`,
        income: inc,
        expense: exp,
        balance: inc - exp,
        isCurrent: y === selectedYear && m === selectedMonth,
      });
    }
    return result;
  }, [transactions, selectedYear, selectedMonth]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (monthTransactions.length === 0) {
      showToast('ไม่มีข้อมูลในเดือนนี้สำหรับการส่งออก');
      return;
    }

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน(บาท)', 'ช่องทางชำระเงิน', 'บันทึกช่วยจำ'];
    const rows = monthTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.paymentMethod || 'โอนเงิน').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานรายรับรายจ่าย_${THAI_MONTHS[selectedMonth - 1]}_${selectedYear + 543}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว');
  };

  const monthLabel = `${THAI_MONTHS[selectedMonth - 1]} ${selectedYear + 543}`;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 text-slate-800">
      {/* Navbar */}
      <Navbar
        user={user}
        onLogin={handleGoogleLogin}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Banner if not signed in */}
        {!user && !authLoading && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  คุณกำลังใช้งานโหมดทดลอง / จำลองข้อมูล
                </span>
                <span className="text-slate-600">
                  เข้าสู่ระบบด้วย Google เพื่อบันทึกข้อมูลอย่างถาวรใน Firebase โปรเจกต์ [minnie32]
                </span>
              </div>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition cursor-pointer flex-shrink-0 shadow-sm"
            >
              เข้าสู่ระบบเพื่อซิงค์ Firebase
            </button>
          </div>
        )}

        {/* Month Navigator Bar */}
        <MonthNavigator
          currentYear={selectedYear}
          currentMonth={selectedMonth}
          onChangeMonth={(y, m) => {
            setSelectedYear(y);
            setSelectedMonth(m);
          }}
          onExportCSV={handleExportCSV}
          onResetDemoData={handleResetDemoData}
        />

        {/* 1. Monthly Stat Metric Cards */}
        <StatCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
          monthlyBudget={monthlyBudget}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          prevIncomeDiff={prevIncomeDiff}
          prevExpenseDiff={prevExpenseDiff}
        />

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart: Expenses by Category */}
          <CategoryDonutChart
            data={categoryData}
            totalAmount={totalExpense}
            title={`สัดส่วนรายจ่าย (${monthLabel})`}
          />

          {/* Monthly Historical Trend Chart */}
          <MonthlyTrendChart monthsData={monthlyTrendData} />
        </div>

        {/* 3. Daily Cashflow Bar Chart (Full Width) */}
        <DailyBarChart data={dailyData} monthName={THAI_MONTHS[selectedMonth - 1]} />

        {/* 4. Transactions List with Filters, Grouping, Edit/Delete */}
        <TransactionList
          transactions={monthTransactions}
          monthLabel={monthLabel}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          onEdit={(item) => {
            setEditingTransaction(item);
            setIsAddModalOpen(true);
          }}
          onDelete={handleDeleteTransaction}
        />
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-300 flex items-center justify-center cursor-pointer transition active:scale-95"
          title="บันทึกรายการ"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Budget Setting Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        currentBudget={monthlyBudget}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
