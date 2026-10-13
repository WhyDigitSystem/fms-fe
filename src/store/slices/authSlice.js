import { createSlice } from '@reduxjs/toolkit'

// Check if user data exists in localStorage
const getInitialAuthState = () => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  }
  return null
}

const initialState = {
  user: getInitialAuthState(),
  isAuthenticated: !!getInitialAuthState(),
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
      // Save to localStorage ONLY when actually logging in
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    loginFailure: (state) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      localStorage.removeItem('user')
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      localStorage.removeItem('user')
    },
    // ADD THIS: Stop loading without authentication
    stopLoading: (state) => {
      state.loading = false
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, stopLoading } = authSlice.actions
export default authSlice.reducer