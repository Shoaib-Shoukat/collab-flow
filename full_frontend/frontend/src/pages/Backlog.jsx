import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, updateTask, deleteTask } from '../features/tasks/taskSlice';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import socket from '../socket';

export default function Backlog() {
  const dispatch = useDispatch();
  const tasks = useSelector(s => s.tasks.items);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [storyPoints, setStoryPoints] = useState(5);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await dispatch(createTask({
      title,
      description,
      status: 'To Do',
      priority,
      storyPoints
    })).unwrap();

    socket.emit('taskCreated', { ...res, projectId: 'default' });
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setStoryPoints(5);
    setShowModal(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      await dispatch(deleteTask(taskId)).unwrap();
      socket.emit('taskDeleted', taskId);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    const updated = await dispatch(updateTask({
      id: task._id,
      payload: { ...task, status: newStatus }
    })).unwrap();
    socket.emit('taskUpdated', { ...updated, projectId: 'default' });
  };

  // Filter & Sort
  const filtered = tasks.filter(t => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'priority') {
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    }
    if (sortBy === 'storyPoints') return (b.storyPoints || 0) - (a.storyPoints || 0);
    return 0;
  });

  const getPriorityColor = (priority) => {
    if (priority === 'Critical') return 'danger';
    if (priority === 'High') return 'warning';
    if (priority === 'Medium') return 'primary';
    return 'info';
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800">Backlog</h1>
        <p className="text-slate-600 mt-2">Manage tasks, set priorities, and assign story points</p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          ➕ Add Task
        </Button>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
        >
          <option>All</option>
          <option>To Do</option>
          <option>In Progress</option>
          <option>Review</option>
          <option>Done</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
        >
          <option value="recent">Most Recent</option>
          <option value="priority">Priority</option>
          <option value="storyPoints">Story Points</option>
        </select>

        <div className="ml-auto text-sm text-slate-600">
          {sorted.length} task{sorted.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sorted.map(task => (
          <Card key={task._id} hover className="flex items-center justify-between p-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge variant="default">
                  {task.status}
                </Badge>
                {task.storyPoints && (
                  <Badge variant="info">
                    {task.storyPoints} pts
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <select
                value={task.status}
                onChange={e => handleStatusChange(task, e.target.value)}
                className="px-2 py-1 text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Done</option>
              </select>

              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDeleteTask(task._id)}
              >
                🗑️
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Task Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Task details (optional)"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Story Points</label>
              <input
                type="number"
                value={storyPoints}
                onChange={e => setStoryPoints(parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-full px-4 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="primary" className="flex-1">Create Task</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

