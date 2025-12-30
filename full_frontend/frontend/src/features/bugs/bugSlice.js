import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosClient';

export const fetchBugs = createAsyncThunk('bugs/fetch', async ()=>{
  const res = await api.get('/bugs');
  return res.data;
});

export const createBug = createAsyncThunk('bugs/create', async (payload)=>{
  const res = await api.post('/bugs', payload);
  return res.data;
});

const slice = createSlice({
  name: 'bugs',
  initialState: { items: [] },
  reducers: {
    bugCreatedRealtime: (state, action) => { state.items.unshift(action.payload); }
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchBugs.fulfilled, (state, action)=> state.items = action.payload)
           .addCase(createBug.fulfilled, (state, action)=> state.items.unshift(action.payload));
  }
});

export const { bugCreatedRealtime } = slice.actions;
export default slice.reducer;
