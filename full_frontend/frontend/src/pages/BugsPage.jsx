import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBugs, createBug } from '../features/bugs/bugSlice';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import socket from '../socket';

export default function BugsPage() {
  const dispatch = useDispatch();
  const bugs = useSelector(s => s.bugs.items);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchBugs());
  }, [dispatch]);

  const handleCreateBug = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await dispatch(createBug({
      title,
      description,
      severity,
      stepsToReproduce,
      status: 'Open'
    })).unwrap();

    socket.emit('bugCreated', { ...res, projectId: 'default' });
    setTitle('');
    setDescription('');
    setSeverity('Medium');
    setStepsToReproduce('');
    setShowModal(false);
  };

  const getSeverityColor = (severity) => {
    if (severity === 'Critical') return 'danger';
    if (severity === 'High') return 'warning';
    if (severity === 'Medium') return 'primary';
    return 'info';
  };

  const filtered = bugs.filter(b => {
    if (filter === 'All') return true;
    return b.severity === filter;
  });

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800">Bug Tracker</h1>
        <p className="text-slate-600 mt-2">Report and manage bugs with severity levels and reproduction steps</p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button variant="danger" onClick={() => setShowModal(true)}>
          🐛 Report Bug
        </Button>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
        >
          <option>All</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <div className="ml-auto text-sm text-slate-600">
          {filtered.length} bug{filtered.length !== 1 ? 's' : ''} • {bugs.filter(b => b.severity === 'Critical').length} critical
        </div>
      </div>

      {/* Bug List */}
      <div className="space-y-4">
        {filtered.map(bug => (
          <Card key={bug._id} hover className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-800">{bug.title}</h3>
                  <Badge variant={getSeverityColor(bug.severity)}>
                    {bug.severity}
                  </Badge>
                  <Badge variant="default">
                    {bug.status || 'Open'}
                  </Badge>
                </div>

                {bug.description && (
                  <p className="text-slate-600 mt-2">{bug.description}</p>
                )}

                {bug.stepsToReproduce && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-700">Steps to Reproduce:</h4>
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{bug.stepsToReproduce}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                  <span>📅 {new Date(bug.createdAt).toLocaleDateString()}</span>
                  {bug.assignee && <span>👤 {bug.assignee}</span>}
                </div>
              </div>

              <div className="ml-4 flex items-center gap-2">
                <select
                  defaultValue={bug.status || 'Open'}
                  className="px-2 py-1 text-sm rounded-lg border border-slate-300 bg-white"
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Fixed</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-slate-500 text-lg">No bugs found 🎉</p>
          </Card>
        )}
      </div>

      {/* Report Bug Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Report New Bug" size="lg">
        <form onSubmit={handleCreateBug} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bug Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Brief description of the bug"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Steps to Reproduce</label>
            <textarea
              value={stepsToReproduce}
              onChange={e => setStepsToReproduce(e.target.value)}
              placeholder="1. Step one&#10;2. Step two&#10;3. Expected result"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Severity *</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="danger" className="flex-1">Report Bug</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

