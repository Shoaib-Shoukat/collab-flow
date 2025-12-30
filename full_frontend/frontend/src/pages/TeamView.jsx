import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTasks } from '../features/tasks/taskSlice';
import { fetchSprints } from '../features/sprints/sprintSlice';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';

export default function TeamView() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchSprints());
  }, [dispatch]);

  // Mock team members
  const teamMembers = [
    { id: 1, name: 'Alice Johnson', role: 'Frontend Lead', assignedTasks: 5, capacity: 10 },
    { id: 2, name: 'Bob Smith', role: 'Backend Dev', assignedTasks: 7, capacity: 10 },
    { id: 3, name: 'Carol Davis', role: 'QA Engineer', assignedTasks: 3, capacity: 8 },
    { id: 4, name: 'David Wilson', role: 'DevOps', assignedTasks: 4, capacity: 8 },
  ];

  const getWorkloadStatus = (assigned, capacity) => {
    const percentage = (assigned / capacity) * 100;
    if (percentage > 100) return 'overloaded';
    if (percentage > 80) return 'busy';
    if (percentage < 30) return 'idle';
    return 'healthy';
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800">Team Capacity</h1>
        <p className="text-slate-600 mt-2">Monitor team workload and capacity</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teamMembers.map(member => {
          const status = getWorkloadStatus(member.assignedTasks, member.capacity);
          return (
            <Card key={member.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{member.name}</h3>
                  <p className="text-sm text-slate-600">{member.role}</p>
                </div>
                <Badge variant={status === 'overloaded' ? 'danger' : status === 'busy' ? 'warning' : status === 'idle' ? 'info' : 'success'}>
                  {status === 'overloaded' ? '⚠️ Overloaded' : status === 'busy' ? '🔥 Busy' : status === 'idle' ? '😴 Idle' : '✅ Healthy'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Workload</span>
                    <span className="font-semibold text-slate-800">{member.assignedTasks}/{member.capacity}</span>
                  </div>
                  <ProgressBar 
                    value={member.assignedTasks} 
                    max={member.capacity}
                    color={status === 'overloaded' ? 'red' : status === 'busy' ? 'yellow' : status === 'idle' ? 'blue' : 'green'}
                    showLabel={false}
                  />
                </div>

                <div className="text-sm text-slate-600">
                  <span className="font-medium">{member.capacity - member.assignedTasks}</span> slots available
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Heatmap */}
      <Card className="mt-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Team Heatmap</h2>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, idx) => {
            const intensity = Math.random();
            const color = intensity > 0.7 ? 'bg-red-400' : intensity > 0.4 ? 'bg-amber-300' : 'bg-green-300';
            return (
              <div 
                key={idx}
                className={`w-8 h-8 rounded-lg ${color} opacity-70 hover:opacity-100 transition-opacity cursor-pointer`}
                title={`Week ${Math.ceil((idx + 1) / 7)}, Day ${(idx % 7) + 1}`}
              />
            );
          })}
        </div>
        <p className="text-sm text-slate-600 mt-4">Activity heatmap (darker = more activity)</p>
      </Card>
    </div>
  );
}
