import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTask } from '../features/tasks/taskSlice';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import socket from '../socket';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];
const COLUMN_COLORS = {
  'To Do': 'from-slate-500 to-slate-600',
  'In Progress': 'from-blue-500 to-blue-600',
  'Review': 'from-amber-500 to-orange-600',
  'Done': 'from-green-500 to-emerald-600'
};

export default function KanbanView() {
  const dispatch = useDispatch();
  const tasks = useSelector(s => s.tasks.items);
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const task = localTasks.find(t => t._id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;
    const updatedTask = { ...task, status: newStatus };

    // Optimistic update
    setLocalTasks(prev =>
      prev.map(t => t._id === task._id ? updatedTask : t)
    );

    try {
      const res = await dispatch(updateTask({ id: task._id, payload: updatedTask })).unwrap();
      socket.emit('taskUpdated', { ...res, projectId: 'default' });
    } catch (err) {
      // Revert on error
      setLocalTasks(tasks);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-800">Kanban Board</h1>
        <p className="text-slate-600 mt-2">Drag tasks across columns to update their status</p>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-6">
          {COLUMNS.map(column => (
            <div key={column}>
              <div className={`bg-linear-to-r ${COLUMN_COLORS[column]} text-white px-4 py-3 rounded-xl font-semibold mb-4 shadow-lg`}>
                {column}
              </div>
              
              <Droppable droppableId={column}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-96 p-3 rounded-xl transition-all duration-300 ${
                      snapshot.isDraggingOver
                        ? 'bg-white/50 shadow-lg border-2 border-indigo-400'
                        : 'bg-white/20'
                    }`}
                  >
                    {localTasks
                      .filter(t => t.status === column)
                      .map((task, idx) => (
                        <Draggable key={task._id} draggableId={task._id} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                snapshot.isDragging
                                  ? 'shadow-2xl scale-105'
                                  : 'shadow-md'
                              }`}
                            >
                              <Card className="cursor-move hover:shadow-lg transition-all">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800">{task.title}</h3>
                                    <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                  </div>
                                  <div className="text-xs text-slate-400">#{task._id?.slice(-4)}</div>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                  <Badge variant="primary">{task.priority || 'Medium'}</Badge>
                                  <div className="text-xs text-slate-500">{task.assignee || 'Unassigned'}</div>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
