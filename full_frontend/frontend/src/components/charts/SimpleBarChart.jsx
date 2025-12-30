import React from 'react';

export default function SimpleBarChart({ data, title, xLabel, yLabel }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-500 py-8">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div>
      {title && <h3 className="font-semibold text-lg text-slate-800 mb-4">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, idx) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-sm text-slate-600">{item.value}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
