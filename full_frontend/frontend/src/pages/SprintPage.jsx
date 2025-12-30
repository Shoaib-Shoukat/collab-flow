import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSprints, createSprint, updateSprint } from '../features/sprints/sprintSlice';
import { fetchTasks } from '../features/tasks/taskSlice';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import socket from '../socket';

const SPRINT_STATUSES = ['Planning', 'Active', 'Completed'];

export default function SprintPage() {
  const dispatch = useDispatch();
  const sprints = useSelector(s => s.sprints.items);
  const tasks = useSelector(s => s.tasks.items);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(7);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSprints());
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await dispatch(createSprint({
      name,
      goal,
      duration,
      startDate: new Date(),
      status: 'Planning'
    })).unwrap();

    socket.emit('sprintUpdated', { ...res, projectId: 'default' });
    setName('');
    setGoal('');
    setDuration(7);
    setShowModal(false);
  };

  const getSprintTasks = (sprintId) => {
    return tasks.filter(t => t.sprintId === sprintId);
  };

  const getCompletionRate = (sprintId) => {
    const sprintTasks = getSprintTasks(sprintId);
    if (sprintTasks.length === 0) return 0;
    return Math.round((sprintTasks.filter(t => t.status === 'Done').length / sprintTasks.length) * 100);
  };

  const getTotalStoryPoints = (sprintId) => {
    return getSprintTasks(sprintId).reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800">Sprint Management</h1>
        <p className="text-slate-600 mt-2">Create and manage sprints with goals and velocity tracking</p>
      </header>

      {/* Create Sprint Button */}
      <div className="mb-8">
        <Button variant="success" onClick={() => setShowModal(true)}>
          🚀 Create Sprint
        </Button>
      </div>

      {/* Sprints Grid */}
      <div className="space-y-6">
        {sprints.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-500 text-lg">No sprints yet. Create one to get started! 🚀</p>
          </Card>
        ) : (
          sprints.map(sprint => {
            const sprintTasks = getSprintTasks(sprint._id);
            const completionRate = getCompletionRate(sprint._id);
            const totalPoints = getTotalStoryPoints(sprint._id);
            const completedPoints = sprintTasks
              .filter(t => t.status === 'Done')
              .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

            return (
              <Card key={sprint._id} className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-800">{sprint.name}</h2>
                      <Badge variant={
                        sprint.status === 'Active' ? 'success' :
                        sprint.status === 'Planning' ? 'warning' :
                        'default'
                      }>
                        {sprint.status}
                      </Badge>
                    </div>
                    {sprint.goal && (
                      <p className="text-slate-600 mt-2">Goal: {sprint.goal}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <select
                      defaultValue={sprint.status}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {SPRINT_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sprint Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-sm text-slate-600">Tasks</div>
                    <div className="text-2xl font-bold text-indigo-600">{sprintTasks.length}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-sm text-slate-600">Story Points</div>
                    <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-sm text-slate-600">Completed</div>
                    <div className="text-2xl font-bold text-green-600">{sprintTasks.filter(t => t.status === 'Done').length}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-sm text-slate-600">Velocity</div>
                    <div className="text-2xl font-bold text-emerald-600">{completedPoints} pts</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-800">Completion</span>
                    <span className="text-sm text-slate-600">{completionRate}%</span>
                  </div>
                  <ProgressBar 
                    value={sprintTasks.filter(t => t.status === 'Done').length}
                    max={sprintTasks.length || 1}
                    color="green"
                    showLabel={false}
                  />
                </div>

                {/* Sprint Tasks */}
                {sprintTasks.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="font-semibold text-slate-800 mb-3">Sprint Tasks</h3>
                    <div className="space-y-2">
                      {sprintTasks.slice(0, 5).map(task => (
                        <div key={task._id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="font-medium text-slate-800">{task.title}</span>
                          <Badge variant={task.status === 'Done' ? 'success' : 'info'}>
                            {task.status}
                          </Badge>
                        </div>
                      ))}
                      {sprintTasks.length > 5 && (
                        <p className="text-sm text-slate-600 pt-2">+{sprintTasks.length - 5} more tasks</p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Create Sprint Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Sprint" size="lg">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sprint Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sprint 1, Q1 Sprint"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sprint Goal</label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="What do we want to achieve in this sprint?"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Duration (days)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value))}
              min="1"
              max="30"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="success" className="flex-1">Create Sprint</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

