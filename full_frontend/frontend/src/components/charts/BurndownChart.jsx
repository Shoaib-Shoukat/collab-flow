import React from 'react';

export default function BurndownChart({ sprints }) {
  const currentSprint = sprints?.[0];
  
  if (!currentSprint) {
    return (
      <div className="text-center text-slate-500 py-8">
        No active sprint
      </div>
    );
  }

  // Mock burndown data
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const burndown = [10, 8, 7, 4, 0];
  const ideal = [10, 8, 6, 4, 2, 0];

  const maxValue = 10;
  const chartHeight = 200;

  return (
    <div>
      <h3 className="font-semibold text-lg text-slate-800 mb-4">Sprint Burndown</h3>
      <div className="flex items-end gap-2" style={{ height: `${chartHeight}px` }}>
        {burndown.map((value, idx) => {
          const barHeight = (value / maxValue) * chartHeight;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-8 bg-linear-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-500"
                  style={{ height: `${barHeight}px` }}
                />
              </div>
              <div className="text-xs text-slate-600 mt-2 text-center">{days[idx]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
