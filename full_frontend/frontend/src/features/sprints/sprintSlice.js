import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosClient';

export const fetchSprints = createAsyncThunk('sprints/fetch', async ()=>{
  const res = await api.get('/sprints');
  return res.data;
});

export const createSprint = createAsyncThunk('sprints/create', async (payload)=>{
  const res = await api.post('/sprints', payload);
  return res.data;
});

export const updateSprint = createAsyncThunk('sprints/update', async ({id, payload})=>{
  const res = await api.put(`/sprints/${id}`, payload);
  return res.data;
});

const slice = createSlice({
  name: 'sprints',
  initialState: { items: [] },
  reducers: {
    sprintUpdatedRealtime: (state, action) => {
      const idx = state.items.findIndex(s=>s._id===action.payload._id);
      if(idx!==-1) state.items[idx]=action.payload;
      else state.items.unshift(action.payload);
    }
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchSprints.fulfilled, (state, action)=>{ state.items = action.payload; })
           .addCase(createSprint.fulfilled, (state, action)=> state.items.unshift(action.payload))
           .addCase(updateSprint.fulfilled, (state, action)=> { const idx = state.items.findIndex(s=>s._id===action.payload._id); if(idx!==-1) state.items[idx]=action.payload; });
  }
});

export const { sprintUpdatedRealtime } = slice.actions;
export default slice.reducer;

