import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { productsApi } from '../../services/api'
import type { AsyncStatus, CatalogMeta, Product } from '../../types/models'
import type { RootState } from '../index'

export type SortOption =
  | 'featured'
  | 'price-low-high'
  | 'price-high-low'
  | 'rating-high'
  | 'most-reviewed'

export type CatalogViewMode = 'grid' | 'list'

interface ProductsState {
  items: Product[]
  categories: string[]
  status: AsyncStatus
  categoriesStatus: AsyncStatus
  error: string | null
  selectedCategory: string
  searchQuery: string
  sortBy: SortOption
  minRating: number
  maxPrice: number
  onlyPopular: boolean
  viewMode: CatalogViewMode
  meta: CatalogMeta
}

const defaultMeta: CatalogMeta = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
}

const initialState: ProductsState = {
  items: [],
  categories: [],
  status: 'idle',
  categoriesStatus: 'idle',
  error: null,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'featured',
  minRating: 0,
  maxPrice: 1200,
  onlyPopular: false,
  viewMode: 'grid',
  meta: defaultMeta,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: Partial<Pick<ProductsState, 'searchQuery' | 'selectedCategory' | 'minRating' | 'maxPrice' | 'sortBy' | 'onlyPopular'>> & { page?: number; pageSize?: number } = {}) => {
    return productsApi.getProducts({
      q: params.searchQuery,
      category: params.selectedCategory,
      minRating: params.minRating,
      maxPrice: params.maxPrice,
      sortBy: params.sortBy,
      onlyPopular: params.onlyPopular,
      page: params.page,
      pageSize: params.pageSize,
    })
  },
)

export const fetchCategories = createAsyncThunk('products/fetchCategories', async () => {
  return productsApi.getCategories()
})

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload
    },
    setMinRating: (state, action: PayloadAction<number>) => {
      state.minRating = action.payload
    },
    setMaxPrice: (state, action: PayloadAction<number>) => {
      state.maxPrice = action.payload
    },
    setOnlyPopular: (state, action: PayloadAction<boolean>) => {
      state.onlyPopular = action.payload
    },
    setViewMode: (state, action: PayloadAction<CatalogViewMode>) => {
      state.viewMode = action.payload
    },
    clearFilters: (state) => {
      state.selectedCategory = 'all'
      state.searchQuery = ''
      state.sortBy = 'featured'
      state.minRating = 0
      state.maxPrice = 1200
      state.onlyPopular = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.meta = action.payload.meta
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to load products'
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesStatus = 'failed'
      })
  },
})

export const {
  setCategory,
  setSearchQuery,
  setSortBy,
  setMinRating,
  setMaxPrice,
  setOnlyPopular,
  setViewMode,
  clearFilters,
} = productsSlice.actions

export const selectPriceCap = (state: RootState): number => {
  if (state.products.items.length === 0) {
    return 1200
  }

  return Math.ceil(Math.max(...state.products.items.map((item) => item.price)))
}

export const selectFilteredProducts = (state: RootState): Product[] => state.products.items

export default productsSlice.reducer
