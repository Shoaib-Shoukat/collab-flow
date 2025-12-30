import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../features/tasks/taskSlice';
import { fetchSprints } from '../features/sprints/sprintSlice';
import { fetchBugs } from '../features/bugs/bugSlice';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import BurndownChart from '../components/charts/BurndownChart';
import VelocityChart from '../components/charts/VelocityChart';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const dispatch = useDispatch();
  const tasks = useSelector(s => s.tasks.items);
  const sprints = useSelector(s => s.sprints.items);
  const bugs = useSelector(s => s.bugs.items);
  const user = useSelector(s => s.auth.user);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchSprints());
    dispatch(fetchBugs());
  }, [dispatch]);

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const openBugs = bugs.filter(b => b.status !== 'Resolved' && b.status !== 'Closed').length;
  const criticalBugs = bugs.filter(b => b.severity === 'Critical').length;
  const currentSprint = sprints[0];
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Health indicator
  const getHealthStatus = () => {
    if (openBugs > 5) return { status: 'Critical', color: 'danger', icon: '🔴' };
    if (openBugs > 2 || inProgressTasks > totalTasks * 0.5) return { status: 'Warning', color: 'warning', icon: '🟠' };
    return { status: 'Healthy', color: 'success', icon: '🟢' };
  };

  const health = getHealthStatus();

  // Task status breakdown
  const taskBreakdown = [
    { label: 'To Do', value: tasks.filter(t => t.status === 'To Do').length },
    { label: 'In Progress', value: inProgressTasks },
    { label: 'Review', value: tasks.filter(t => t.status === 'Review').length },
    { label: 'Done', value: completedTasks }
  ];

  // Bug severity breakdown
  const bugBreakdown = [
    { label: 'Low', value: bugs.filter(b => b.severity === 'Low').length },
    { label: 'Medium', value: bugs.filter(b => b.severity === 'Medium').length },
    { label: 'High', value: bugs.filter(b => b.severity === 'High').length },
    { label: 'Critical', value: criticalBugs }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
            <p className="text-slate-600 mt-1">Here's your project overview</p>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Completion Rate */}
        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Completion Rate</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-indigo-600">{completionRate}%</div>
          <p className="text-sm text-slate-600 mt-2">{completedTasks} of {totalTasks} tasks</p>
          <div className="mt-3">
            <ProgressBar value={completedTasks} max={totalTasks} color="indigo" showLabel={false} />
          </div>
        </Card>

        {/* Open Bugs */}
        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Open Bugs</h3>
            <span className="text-2xl">🐛</span>
          </div>
          <div className="text-3xl font-bold text-rose-600">{openBugs}</div>
          <p className="text-sm text-slate-600 mt-2">{criticalBugs} critical</p>
          <Badge variant={criticalBugs > 0 ? 'danger' : 'success'} className="mt-3">
            {criticalBugs > 0 ? '⚠️ Action needed' : '✅ No critical bugs'}
          </Badge>
        </Card>

        {/* Active Sprint */}
        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Active Sprint</h3>
            <span className="text-2xl">🏃</span>
          </div>
          <div className="text-xl font-bold text-slate-800">{currentSprint?.name || 'No sprint'}</div>
          <p className="text-sm text-slate-600 mt-2">
            {currentSprint ? `${currentSprint.status}` : 'Create a sprint to start'}
          </p>
          <Link to="/sprint">
            <Button size="sm" variant="secondary" className="mt-3 w-full text-center justify-center">
              View Sprint →
            </Button>
          </Link>
        </Card>

        {/* Project Health */}
        <Card hover>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Project Health</h3>
            <span className="text-2xl">{health.icon}</span>
          </div>
          <div className={`text-xl font-bold ${
            health.color === 'danger' ? 'text-rose-600' : 
            health.color === 'warning' ? 'text-amber-600' : 
            'text-green-600'
          }`}>
            {health.status}
          </div>
          <Badge variant={health.color} className="mt-3">
            {health.status}
          </Badge>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Burndown Chart */}
        <Card>
          <BurndownChart sprints={sprints} />
        </Card>

        {/* Velocity Chart */}
        <Card>
          <VelocityChart sprints={sprints} />
        </Card>

        {/* Task Status */}
        <Card>
          <SimpleBarChart 
            data={taskBreakdown}
            title="Task Status Distribution"
          />
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Recent Tasks</h2>
              <Link to="/backlog">
                <Button size="sm" variant="ghost">View all →</Button>
              </Link>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 6).map(task => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{task.title}</h4>
                    <p className="text-sm text-slate-600">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{task.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bug Severity */}
        <Card>
          <SimpleBarChart 
            data={bugBreakdown}
            title="Bug Severity"
          />
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/kanban">
            <Button size="md" variant="primary" className="w-full justify-center">
              📋 Kanban Board
            </Button>
          </Link>
          <Link to="/backlog">
            <Button size="md" variant="secondary" className="w-full justify-center">
              📑 Backlog
            </Button>
          </Link>
          <Link to="/bugs">
            <Button size="md" variant="danger" className="w-full justify-center">
              🐛 Bug Tracker
            </Button>
          </Link>
          <Link to="/team">
            <Button size="md" variant="success" className="w-full justify-center">
              👥 Team View
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

