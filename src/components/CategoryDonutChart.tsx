import React, { useState } from 'react';
import { formatCurrency } from '../utils/constants';
import { CategoryDataPoint } from '../types';

interface Props {
  data: CategoryDataPoint[];
  title?: string;
  totalAmount: number;
}

export const CategoryDonutChart: React.FC<Props> = ({
  data,
  title = 'สัดส่วนรายจ่ายตามหมวดหมู่',
  totalAmount,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0 || totalAmount === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[340px] text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 text-2xl">
          📊
        </div>
        <h3 className="font-semibold text-slate-700">{title}</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          ยังไม่มีรายการรายจ่ายในเดือนนี้ เริ่มบันทึกเพื่อดูสถิติ
        </p>
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 260;
  const strokeWidth = 38;
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 8;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const slices = data.map((item, idx) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">แบ่งตามหมวดหมู่ ({data.length} รายการ)</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
          รายจ่ายทั้งหมด
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center my-2">
        {/* SVG Donut */}
        <div className="relative w-[240px] h-[240px] flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredIdx === slice.idx;
              return (
                <circle
                  key={slice.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-200 cursor-pointer origin-center"
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            {activeItem ? (
              <>
                <span className="text-xs text-slate-500 font-medium truncate max-w-[140px]">
                  {activeItem.name}
                </span>
                <span className="text-lg font-bold text-slate-800 mt-0.5">
                  {formatCurrency(activeItem.amount)}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 mt-1">
                  {activeItem.percentage.toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-slate-400 font-medium">รวมรายจ่าย</span>
                <span className="text-xl font-bold text-slate-850 text-rose-600 mt-0.5">
                  {formatCurrency(totalAmount)}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">แตะเพื่อดูรายละเอียด</span>
              </>
            )}
          </div>
        </div>

        {/* Legend list */}
        <div className="w-full max-h-[220px] overflow-y-auto pr-1 space-y-2">
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                  isHovered ? 'bg-slate-100 shadow-xs' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-700 truncate">{item.name}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-semibold text-slate-800">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.percentage.toFixed(1)}% ({item.count} ครั้ง)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
