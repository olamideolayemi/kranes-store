export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating?: {
    rate: number
    count: number
  }
  stock?: number
  sku?: string
}

export interface CartItem {
  id: number
  title: string
  image: string
  price: number
  quantity: number
  category?: string
}

export interface User {
  id: string
  email: string
  name: string
}

export interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  addressLine1: string
  city: string
  country: string
  postalCode: string
  isDefault: boolean
}

export interface SavedCard {
  id: string
  brand: string
  last4: string
  expMonth: string
  expYear: string
  holderName: string
  isDefault: boolean
}

export interface OrderItem {
  productId: number
  title: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered'
  shippingAddress: Address
  payment: {
    provider: 'stripe'
    status: 'authorized' | 'captured' | 'failed'
    transactionId: string
    amount: number
    currency: string
    cardLast4: string
  }
  createdAt: string
  updatedAt: string
}

export interface ReturnRequest {
  id: string
  userId: string
  orderId: string
  reason: string
  status: 'requested' | 'approved' | 'refunded'
  createdAt: string
}

export interface CatalogMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedProducts {
  items: Product[]
  meta: CatalogMeta
}

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

export type ToastType = 'info' | 'success' | 'error'
