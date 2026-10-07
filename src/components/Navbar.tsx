import React from 'react';
import { User } from 'firebase/auth';
import { LogIn, LogOut, Wallet, Database, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isSyncing: boolean;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  user,
  onLogin,
  onLogout,
  isSyncing,
  onOpenAddModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg leading-tight">
                MoneyTracker Pro
              </h1>
              {/* Firebase badge */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-semibold">
                <Database className="w-3 h-3 text-amber-600" />
                <span>minnie32</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ระบบบันทึกรายรับรายจ่าย & วิเคราะห์ข้อมูล
            </p>
          </div>
        </div>

        {/* Right side: Cloud Sync status & Auth */}
        <div className="flex items-center gap-3">
          {/* Sync indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
            {isSyncing ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[11px]">กำลังซิงค์...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px]">เชื่อมต่อ Firebase แล้ว</span>
              </>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-100 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ บันทึกด่วน</span>
          </button>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-indigo-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="ออกจากระบบ"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบ Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
