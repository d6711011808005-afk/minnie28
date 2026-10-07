import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, RefreshCw } from 'lucide-react';
import { THAI_MONTHS } from '../utils/constants';

interface Props {
  currentYear: number;
  currentMonth: number; // 1-12
  onChangeMonth: (year: number, month: number) => void;
  onExportCSV: () => void;
  onResetDemoData: () => void;
}

export const MonthNavigator: React.FC<Props> = ({
  currentYear,
  currentMonth,
  onChangeMonth,
  onExportCSV,
  onResetDemoData,
}) => {
  const now = new Date();
  const isThisMonth =
    now.getFullYear() === currentYear && now.getMonth() + 1 === currentMonth;

  const handlePrev = () => {
    if (currentMonth === 1) {
      onChangeMonth(currentYear - 1, 12);
    } else {
      onChangeMonth(currentYear, currentMonth - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 12) {
      onChangeMonth(currentYear + 1, 1);
    } else {
      onChangeMonth(currentYear, currentMonth + 1);
    }
  };

  const handleJumpToday = () => {
    onChangeMonth(now.getFullYear(), now.getMonth() + 1);
  };

  // Generate Year options around current year
  const years = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Month & Year Selectors */}
      <div className="flex items-center gap-2">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          title="เดือนก่อนหน้า"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Month Dropdown */}
        <select
          value={currentMonth}
          onChange={(e) => onChangeMonth(currentYear, parseInt(e.target.value))}
          aria-label="เลือกเดือน"
          className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          {THAI_MONTHS.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {name}
            </option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          value={currentYear}
          onChange={(e) => onChangeMonth(parseInt(e.target.value), currentMonth)}
          aria-label="เลือกปี"
          className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y + 543} ({y})
            </option>
          ))}
        </select>

        {/* Next Button */}
        <button
          onClick={handleNext}
          title="เดือนถัดไป"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* This Month shortcut */}
        {!isThisMonth && (
          <button
            onClick={handleJumpToday}
            className="ml-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>เดือนนี้</span>
          </button>
        )}
      </div>

      {/* Right actions: Export CSV & Reset Demo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetDemoData}
          title="โหลดข้อมูลตัวอย่างสำหรับทดสอบ"
          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>ใส่ข้อมูลตัวอย่าง</span>
        </button>

        <button
          onClick={onExportCSV}
          title="ดาวน์โหลดรายงานเป็นไฟล์ CSV (Excel)"
          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>ส่งออก CSV</span>
        </button>
      </div>
    </div>
  );
};
