import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosClient';

export const fetchTasks = createAsyncThunk('tasks/fetch', async ()=>{
  const res = await api.get('/tasks');
  return res.data;
});

export const createTask = createAsyncThunk('tasks/create', async (payload)=>{
  const res = await api.post('/tasks', payload);
  return res.data;
});

export const updateTask = createAsyncThunk('tasks/update', async ({id,payload})=>{
  const res = await api.put(`/tasks/${id}`, payload);
  return res.data;
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id)=>{
  await api.delete(`/tasks/${id}`);
  return id;
});

const slice = createSlice({
  name: 'tasks',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    taskAddedRealtime(state, action){ state.items.unshift(action.payload); },
    taskUpdatedRealtime(state, action){ const idx = state.items.findIndex(t=>t._id===action.payload._id); if(idx!==-1) state.items[idx]=action.payload; },
    taskDeletedRealtime(state, action){ state.items = state.items.filter(t=>t._id!==action.payload); }
  },
  extraReducers: (builder)=>{
    builder
      .addCase(fetchTasks.fulfilled, (state, action)=>{ state.items = action.payload; state.status='succeeded'; })
      .addCase(createTask.fulfilled, (state, action)=> state.items.unshift(action.payload))
      .addCase(updateTask.fulfilled, (state, action)=> { const idx = state.items.findIndex(t=>t._id===action.payload._id); if(idx!==-1) state.items[idx]=action.payload; })
      .addCase(deleteTask.fulfilled, (state, action)=> state.items = state.items.filter(t=>t._id!==action.payload));
  }
});

export const { taskAddedRealtime, taskUpdatedRealtime, taskDeletedRealtime } = slice.actions;
export default slice.reducer;
