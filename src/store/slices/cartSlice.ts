import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, Product } from '../../types/models'
import { loadJSON, STORAGE_KEYS } from '../../utils/storage'

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: loadJSON<CartItem[]>(STORAGE_KEYS.cart, []),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product | CartItem>) => {
      const product = action.payload
      const existingItem = state.items.find((item) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: 1,
          category: product.category,
        })
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload
      const item = state.items.find((entry) => entry.id === productId)

      if (!item) {
        return
      }

      if (quantity <= 0) {
        state.items = state.items.filter((entry) => entry.id !== productId)
      } else {
        item.quantity = quantity
      }
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

export default cartSlice.reducer
