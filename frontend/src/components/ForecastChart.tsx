'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ForecastChartProps {
  forecast: Array<{ hour: string; aqi: number; pm2_5: number }>;
  cityName: string;
  currentColor: string;
  currentAqi: number;
}

const EVEN_2HOUR_TICKS = [
  '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
  '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
];

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecast,
  cityName,
  currentColor,
  currentAqi
}) => {
  const forecastAQIs = forecast?.map(f => f.aqi) || [currentAqi];
  const rawMin = Math.min(...forecastAQIs);
  const rawMax = Math.max(...forecastAQIs);
  const yMin = Math.max(0, Math.floor((rawMin - 15) / 10) * 10);
  const yMax = Math.ceil((rawMax + 15) / 10) * 10;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-800">
              Hourly CPCB AQI Forecast — {cityName}
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Current: {currentAqi} AQI (11:00)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diurnal atmospheric curve: morning peak (07:00–09:00), afternoon dispersion dip (14:00–16:00), evening peak (20:00–22:00)
          </p>
        </div>
      </div>

      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="hour" 
              ticks={EVEN_2HOUR_TICKS}
              interval={0}
              tick={{ fontSize: 11, fill: '#64748b' }} 
            />
            <YAxis 
              domain={[yMin, yMax]} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              label={{ value: 'CPCB AQI', angle: -90, position: 'insideLeft', offset: 5, fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              formatter={(value: number | string | (number | string)[] | undefined) => [
                `${Array.isArray(value) ? value.join(', ') : (value ?? 0)}`,
                'CPCB AQI'
              ]}
            />
            <ReferenceLine 
              x="12:00" 
              stroke="#94a3b8" 
              strokeDasharray="3 3" 
              label={{ value: 'Midday', position: 'top', fill: '#64748b', fontSize: 10 }} 
            />
            <Area 
              type="monotone" 
              dataKey="aqi" 
              stroke={currentColor} 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#aqiGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
