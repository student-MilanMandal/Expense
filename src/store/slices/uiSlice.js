import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: false,
  searchQuery: '',
  notificationCount: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setGlobalSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setNotificationCount: (state, action) => {
      state.notificationCount = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setGlobalSearchQuery, setNotificationCount } = uiSlice.actions;
export default uiSlice.reducer;
