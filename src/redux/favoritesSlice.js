import { createSlice } from '@reduxjs/toolkit'

const loadFavorites = () => {
  try {
    const data = localStorage.getItem('favorites')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveFavorites = (items) => {
  localStorage.setItem('favorites', JSON.stringify(items))
}

const slice = createSlice({
  name: 'favorites',
  initialState: { items: loadFavorites() },
  reducers: {
    toggleFavorite: (state, action) => {
      const job = action.payload
      const exists = state.items.find(j => j.job_id === job.job_id)
      if (exists) {
        state.items = state.items.filter(j => j.job_id !== job.job_id)
      } else {
        state.items.push(job)
      }
      saveFavorites(state.items)
    },
    clearFavorites: (state) => {
      state.items = []
      saveFavorites([])
    }
  }
})

export const { toggleFavorite, clearFavorites } = slice.actions
export default slice.reducer
