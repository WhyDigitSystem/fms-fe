import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme, setTheme } from '../store/slices/themeSlice'

export const useTheme = () => {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.theme.mode)

  const toggle = () => {
    dispatch(toggleTheme())
    // Update DOM immediately
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  const set = (newTheme) => {
    dispatch(setTheme(newTheme))
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return { 
    theme, 
    toggleTheme: toggle,
    setTheme: set
  }
}