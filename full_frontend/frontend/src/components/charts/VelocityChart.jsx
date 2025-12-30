import React from 'react';

export default function VelocityChart({ sprints }) {
  if (!sprints || sprints.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8">
        No sprint data
      </div>
    );
  }

  const velocityData = sprints.slice(0, 5).map(s => ({
    name: s.name || 'Sprint',
    velocity: s.velocity || 0
  }));

  const maxVelocity = Math.max(...velocityData.map(d => d.velocity), 1);

  return (
    <div>
      <h3 className="font-semibold text-lg text-slate-800 mb-4">Velocity Trend</h3>
      <div className="space-y-2">
        {velocityData.map((sprint, idx) => {
          const percentage = (sprint.velocity / maxVelocity) * 100 || 5;
          return (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-700">{sprint.name}</span>
                <span className="text-sm font-semibold text-indigo-600">{sprint.velocity} pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-green-600 to-emerald-500 transition-all duration-500"
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
