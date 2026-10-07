import React, { useState } from 'react';
import { DailyDataPoint } from '../types';
import { formatCurrency, formatCurrencyShort } from '../utils/constants';

interface Props {
  data: DailyDataPoint[];
  monthName: string;
}

export const DailyBarChart: React.FC<Props> = ({ data, monthName }) => {
  const [hoveredDay, setHoveredDay] = useState<DailyDataPoint | null>(null);

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1000 // avoid divide by zero
  );

  const chartHeight = 180;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">การเคลื่อนไหวรายวัน ({monthName})</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            เปรียบเทียบรายรับและรายจ่ายในแต่ละวันของเดือน
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-medium">รายรับ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
            <span className="text-slate-600 font-medium">รายจ่าย</span>
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      <div className="min-h-[28px] mb-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
        {hoveredDay ? (
          <>
            <span className="font-semibold text-slate-700">
              วันที่ {hoveredDay.day} {monthName}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 font-medium">
                รับ: {formatCurrency(hoveredDay.income)}
              </span>
              <span className="text-rose-600 font-medium">
                จ่าย: {formatCurrency(hoveredDay.expense)}
              </span>
              <span className={`font-semibold ${hoveredDay.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                สุทธิ: {formatCurrency(hoveredDay.net)}
              </span>
            </div>
          </>
        ) : (
          <span className="text-slate-400 italic">
            ชี้ที่แท่งกราฟเพื่อดูรายรับรายจ่ายของแต่ละวัน
          </span>
        )}
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          <svg className="w-full" height={chartHeight + 35} viewBox={`0 0 ${data.length * 24 + 40} ${chartHeight + 35}`}>
            {/* Background grid lines */}
            {[0.25, 0.5, 0.75, 1].map((pct) => {
              const y = chartHeight - pct * chartHeight + 10;
              return (
                <g key={pct}>
                  <line
                    x1="35"
                    y1={y}
                    x2={data.length * 24 + 35}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x="2"
                    y={y + 4}
                    fill="#94a3b8"
                    fontSize="9"
                    className="font-mono"
                  >
                    {formatCurrencyShort(maxVal * pct)}
                  </text>
                </g>
              );
            })}

            {/* Baseline */}
            <line
              x1="35"
              y1={chartHeight + 10}
              x2={data.length * 24 + 35}
              y2={chartHeight + 10}
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Day Bars */}
            {data.map((item, idx) => {
              const xCenter = 45 + idx * 24;
              const barWidth = 7;
              const incomeHeight = Math.max((item.income / maxVal) * chartHeight, item.income > 0 ? 3 : 0);
              const expenseHeight = Math.max((item.expense / maxVal) * chartHeight, item.expense > 0 ? 3 : 0);
              const incomeY = chartHeight + 10 - incomeHeight;
              const expenseY = chartHeight + 10 - expenseHeight;
              const isHovered = hoveredDay?.day === item.day;

              return (
                <g
                  key={item.day}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredDay(item)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Hover background column */}
                  <rect
                    x={xCenter - 10}
                    y={10}
                    width={20}
                    height={chartHeight}
                    fill={isHovered ? '#f1f5f9' : 'transparent'}
                    rx="4"
                  />

                  {/* Income Bar (Green) */}
                  {item.income > 0 && (
                    <rect
                      x={xCenter - barWidth - 1}
                      y={incomeY}
                      width={barWidth}
                      height={incomeHeight}
                      fill={isHovered ? '#059669' : '#10b981'}
                      rx="2"
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Expense Bar (Red) */}
                  {item.expense > 0 && (
                    <rect
                      x={xCenter + 1}
                      y={expenseY}
                      width={barWidth}
                      height={expenseHeight}
                      fill={isHovered ? '#e11d48' : '#f43f5e'}
                      rx="2"
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Day label on X Axis */}
                  {(item.day === 1 || item.day % 5 === 0 || item.day === data.length) && (
                    <text
                      x={xCenter}
                      y={chartHeight + 26}
                      textAnchor="middle"
                      fill={isHovered ? '#0f172a' : '#64748b'}
                      fontSize="10"
                      fontWeight={isHovered ? '600' : '400'}
                    >
                      {item.day}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
