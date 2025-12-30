import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [] },
  reducers: {
    addNotification: (state, action) => {
      const id = Date.now();
      state.list.push({
        id,
        ...action.payload
      });
      // Auto-remove after 4 seconds
      setTimeout(() => {
        state.list = state.list.filter(n => n.id !== id);
      }, action.payload.duration || 4000);
    },
    removeNotification: (state, action) => {
      state.list = state.list.filter(n => n.id !== action.payload);
    }
  }
});

export const { addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
