/**
 * TrendChart Component
 * 
 * Line chart showing score trends over time
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TrendData {
  date: Date;
  scores: Record<string, number>;
  composite: number;
}

interface TrendChartProps {
  data: TrendData[];
  className?: string;
  dateRange?: '7d' | '30d' | 'all';
  onDateRangeChange?: (range: '7d' | '30d' | 'all') => void;
}

const constructColors = {
  EAI: '#3b82f6',
  RF: '#8b5cf6', 
  SA: '#10b981',
  ARD: '#f59e0b',
  composite: '#f97316'
};

export function TrendChart({ 
  data, 
  className, 
  dateRange = 'all',
  onDateRangeChange 
}: TrendChartProps) {
  // Format data for recharts
  const chartData = data.map(item => ({
    date: format(item.date, 'MMM dd'),
    fullDate: item.date,
    EAI: item.scores.EAI,
    RF: item.scores.RF,
    SA: item.scores.SA,
    ARD: item.scores.ARD,
    Composite: item.composite
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Date Range Selector */}
      {onDateRangeChange && (
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => onDateRangeChange(range)}
              className={cn(
                'px-3 py-1 rounded-lg text-sm transition-all',
                dateRange === range
                  ? 'bg-violet-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="#9ca3af"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              type="monotone"
              dataKey="EAI"
              stroke={constructColors.EAI}
              strokeWidth={2}
              dot={{ fill: constructColors.EAI, strokeWidth: 2, r: 4 }}
              name="Epistemic Autonomy"
            />
            <Line
              type="monotone"
              dataKey="RF"
              stroke={constructColors.RF}
              strokeWidth={2}
              dot={{ fill: constructColors.RF, strokeWidth: 2, r: 4 }}
              name="Reflective Flexibility"
            />
            <Line
              type="monotone"
              dataKey="SA"
              stroke={constructColors.SA}
              strokeWidth={2}
              dot={{ fill: constructColors.SA, strokeWidth: 2, r: 4 }}
              name="Source Awareness"
            />
            <Line
              type="monotone"
              dataKey="ARD"
              stroke={constructColors.ARD}
              strokeWidth={2}
              dot={{ fill: constructColors.ARD, strokeWidth: 2, r: 4 }}
              name="Affect Regulation"
            />
            <Line
              type="monotone"
              dataKey="Composite"
              stroke={constructColors.composite}
              strokeWidth={3}
              dot={{ fill: constructColors.composite, strokeWidth: 2, r: 5 }}
              name="Composite Autonomy"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {Object.entries(constructColors).map(([construct, color]) => (
          <div key={construct} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-slate-400">
              {construct === 'composite' ? 'Composite' : construct}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
