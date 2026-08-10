import { createSlice } from '@reduxjs/toolkit';

const initialUser = (() => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    return null;
  }
})();

const initialToken = localStorage.getItem('token') || null;

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      if (user) localStorage.setItem('user', JSON.stringify(user));
      if (token) localStorage.setItem('token', token);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
