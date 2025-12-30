import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosClient';

export const register = createAsyncThunk('auth/register', async (payload) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
});

export const login = createAsyncThunk('auth/login', async (payload) => {
  const res = await api.post('/auth/login', payload);
  return res.data;
});

const initial = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  status: 'idle',
  error: null
};

const slice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    logout(state){
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;
