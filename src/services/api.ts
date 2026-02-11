import type {
  Address,
  Order,
  PaginatedProducts,
  Product,
  ReturnRequest,
  SavedCard,
  User,
} from '../types/models'
import { getAuthToken } from '../utils/storage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (options.auth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ message: 'Request failed' }))) as {
      message?: string
    }
    throw new Error(payload.message || `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const authApi = {
  register: (payload: { email: string; password: string; name: string }) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: payload }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: payload }),
  me: () => request<User>('/auth/me', { auth: true }),
}

interface ProductQuery {
  q?: string
  category?: string
  minRating?: number
  maxPrice?: number
  sortBy?: string
  page?: number
  pageSize?: number
  onlyPopular?: boolean
}

const toQueryString = (params: ProductQuery): string => {
  const urlParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    urlParams.set(key, String(value))
  })

  const query = urlParams.toString()
  return query ? `?${query}` : ''
}

export const productsApi = {
  getProducts: (params: ProductQuery = {}): Promise<PaginatedProducts> =>
    request<PaginatedProducts>(`/products${toQueryString(params)}`),
  getProductById: (id: string | number): Promise<Product> => request<Product>(`/products/${id}`),
  getCategories: (): Promise<string[]> => request<string[]>('/products/meta/categories'),
}

export const accountApi = {
  getOrders: (): Promise<Order[]> => request<Order[]>('/account/orders', { auth: true }),
  getTracking: (orderId: string): Promise<{ orderId: string; status: string; timeline: Array<{ stage: string; completed: boolean }> }> =>
    request(`/account/tracking/${orderId}`, { auth: true }),
  getAddresses: (): Promise<Address[]> => request<Address[]>('/account/addresses', { auth: true }),
  addAddress: (payload: Omit<Address, 'id' | 'isDefault'>): Promise<Address> =>
    request<Address>('/account/addresses', { method: 'POST', body: payload, auth: true }),
  deleteAddress: (addressId: string): Promise<void> =>
    request<void>(`/account/addresses/${addressId}`, { method: 'DELETE', auth: true }),
  getCards: (): Promise<SavedCard[]> => request<SavedCard[]>('/account/cards', { auth: true }),
  addCard: (payload: { holderName: string; cardNumber: string; expMonth: string; expYear: string }): Promise<SavedCard> =>
    request<SavedCard>('/account/cards', { method: 'POST', body: payload, auth: true }),
  deleteCard: (cardId: string): Promise<void> => request<void>(`/account/cards/${cardId}`, { method: 'DELETE', auth: true }),
  getReturns: (): Promise<ReturnRequest[]> => request<ReturnRequest[]>('/account/returns', { auth: true }),
  requestReturn: (payload: { orderId: string; reason: string }): Promise<ReturnRequest> =>
    request<ReturnRequest>('/account/returns', { method: 'POST', body: payload, auth: true }),
}

export const ordersApi = {
  placeOrder: (payload: { items: Array<{ id: number; quantity: number }>; addressId: string; cardId: string }) =>
    request<Order>('/orders', {
      method: 'POST',
      body: payload,
      auth: true,
    }),
}

export const inventoryApi = {
  getStock: (productId: number): Promise<{ productId: number; sku: string; stock: number }> =>
    request(`/inventory/${productId}`),
}

export const analyticsApi = {
  track: (event: { eventType: string; metadata?: Record<string, unknown>; sessionId?: string }) =>
    request('/analytics/events', {
      method: 'POST',
      body: event,
      auth: true,
    }),
}

export const experimentsApi = {
  getAssignments: (): Promise<{
    heroVariant: 'control' | 'premium'
    checkoutVariant: 'compact' | 'guided'
    recommendationVariant: 'top-rated' | 'frequently-bought'
  }> => request('/experiments'),
}
