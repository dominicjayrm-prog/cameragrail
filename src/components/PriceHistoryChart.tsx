'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PriceHistoryPoint } from '@/lib/types';
import { formatFromPenceGBP, type Currency } from '@/lib/currency';

interface Props {
  points: PriceHistoryPoint[];
  currency: Currency;
}

export function PriceHistoryChart({ points, currency }: Props) {
  const data = points.map((p) => ({
    date: p.recorded_at,
    value: (p.median_value ?? 0) / 100,
  }));
  return (
    <div className="bg-white border border-line rounded-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-head text-base font-semibold text-navy">
          Median value, last 12 months
        </h3>
        <p className="text-xs text-slate">Sourced from sold listings</p>
      </div>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="cg-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D6CDF" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2D6CDF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#E4EAF2" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#5A6B82' }}
              tickFormatter={(d: string) =>
                new Date(d).toLocaleDateString('en-GB', { month: 'short' })
              }
              stroke="#E4EAF2"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#5A6B82' }}
              tickFormatter={(v: number) =>
                formatFromPenceGBP(Math.round(v * 100), currency)
              }
              stroke="#E4EAF2"
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: '#0E1A2B',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: 13,
              }}
              labelFormatter={(d: string) =>
                new Date(d).toLocaleDateString('en-GB', {
                  month: 'short',
                  year: 'numeric',
                })
              }
              formatter={(v: number) => [
                formatFromPenceGBP(Math.round(v * 100), currency),
                'Median',
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2D6CDF"
              strokeWidth={2}
              fill="url(#cg-area)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
