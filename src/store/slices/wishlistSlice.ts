import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '../../types/models'
import { loadJSON, STORAGE_KEYS } from '../../utils/storage'

interface WishlistState {
  items: Product[]
}

const initialState: WishlistState = {
  items: loadJSON<Product[]>(STORAGE_KEYS.wishlist, []),
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.items.some((item) => item.id === action.payload.id)
      if (!exists) {
        state.items.push(action.payload)
      }
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload
      const exists = state.items.some((item) => item.id === product.id)

      if (exists) {
        state.items = state.items.filter((item) => item.id !== product.id)
      } else {
        state.items.push(product)
      }
    },
    clearWishlist: (state) => {
      state.items = []
    },
  },
})

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer
