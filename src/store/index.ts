import { configureStore } from '@reduxjs/toolkit'
import productsReducer from './slices/productsSlice'
import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'
import authReducer from './slices/authSlice'
import { saveJSON, STORAGE_KEYS } from '../utils/storage'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

store.subscribe(() => {
  const state = store.getState()
  saveJSON(STORAGE_KEYS.cart, state.cart.items)
  saveJSON(STORAGE_KEYS.wishlist, state.wishlist.items)
})
