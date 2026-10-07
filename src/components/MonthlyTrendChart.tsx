import React from 'react';
import { formatCurrency, formatCurrencyShort } from '../utils/constants';

interface MonthComparison {
  label: string;
  income: number;
  expense: number;
  balance: number;
  isCurrent: boolean;
}

interface Props {
  monthsData: MonthComparison[];
}

export const MonthlyTrendChart: React.FC<Props> = ({ monthsData }) => {
  if (!monthsData || monthsData.length === 0) return null;

  const maxVal = Math.max(
    ...monthsData.map((m) => Math.max(m.income, m.expense)),
    1000
  );

  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const stepX = monthsData.length > 1 ? usableWidth / (monthsData.length - 1) : 0;

  // Build SVG polyline points for income and expense
  const incomePoints = monthsData
    .map((m, i) => {
      const x = paddingX + i * stepX;
      const y = paddingY + usableHeight - (m.income / maxVal) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const expensePoints = monthsData
    .map((m, i) => {
      const x = paddingX + i * stepX;
      const y = paddingY + usableHeight - (m.expense / maxVal) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">แนวโน้มรายรับ - รายจ่ายย้อนหลัง</h3>
          <p className="text-xs text-slate-500 mt-0.5">ภาพรวมเปรียบเทียบในรอบ 6 เดือนล่าสุด</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-medium">รายรับ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-600 font-medium">รายจ่าย</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          className="w-full min-w-[460px]"
          height={chartHeight + 30}
          viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.5, 1].map((pct) => {
            const y = paddingY + usableHeight - pct * usableHeight;
            return (
              <g key={pct}>
                <line
                  x1={paddingX - 10}
                  y1={y}
                  x2={chartWidth - paddingX + 10}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 15}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="9"
                  className="font-mono"
                >
                  {formatCurrencyShort(maxVal * pct)}
                </text>
              </g>
            );
          })}

          {/* Income Polyline */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={incomePoints}
          />

          {/* Expense Polyline */}
          <polyline
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={expensePoints}
          />

          {/* Nodes */}
          {monthsData.map((m, i) => {
            const x = paddingX + i * stepX;
            const incY = paddingY + usableHeight - (m.income / maxVal) * usableHeight;
            const expY = paddingY + usableHeight - (m.expense / maxVal) * usableHeight;

            return (
              <g key={m.label}>
                {/* Income point */}
                <circle
                  cx={x}
                  cy={incY}
                  r="5"
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  className="hover:r-7 transition-all cursor-pointer"
                >
                  <title>{`${m.label} รายรับ: ${formatCurrency(m.income)}`}</title>
                </circle>

                {/* Expense point */}
                <circle
                  cx={x}
                  cy={expY}
                  r="5"
                  fill="#ffffff"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  className="hover:r-7 transition-all cursor-pointer"
                >
                  <title>{`${m.label} รายจ่าย: ${formatCurrency(m.expense)}`}</title>
                </circle>

                {/* X Axis Label */}
                <text
                  x={x}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fill={m.isCurrent ? '#0f172a' : '#64748b'}
                  fontWeight={m.isCurrent ? '700' : '400'}
                  fontSize="11"
                >
                  {m.label}
                  {m.isCurrent ? ' (นี้)' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
