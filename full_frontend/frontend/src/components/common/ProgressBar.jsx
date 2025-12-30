import React from 'react';

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  color = 'indigo',
  showLabel = true,
  animated = true 
}) {
  const percentage = (value / max) * 100;
  
  const colors = {
    indigo: 'from-indigo-600 to-purple-600',
    green: 'from-green-600 to-emerald-500',
    red: 'from-red-600 to-rose-500',
    yellow: 'from-amber-500 to-orange-500'
  };

  return (
    <div className="w-full">
      <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} transition-all duration-500 ${
            animated ? 'ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-slate-700">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
