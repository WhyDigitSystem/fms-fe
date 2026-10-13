import { createSlice } from '@reduxjs/toolkit'

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: getInitialTheme(),
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.mode)
    },
    setTheme: (state, action) => {
      state.mode = action.payload
      localStorage.setItem('theme', action.payload)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer