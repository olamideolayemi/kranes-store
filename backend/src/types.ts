export interface Rating {
  rate: number
  count: number
}

export interface ProductRecord {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: Rating
  stock: number
  sku: string
  isCustom?: boolean
  isArchived?: boolean
}

export interface AddressRecord {
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

export interface CardRecord {
  id: string
  brand: string
  last4: string
  expMonth: string
  expYear: string
  holderName: string
  isDefault: boolean
}

export interface UserRecord {
  id: string
  email: string
  name: string
  role: 'customer' | 'admin'
  passwordHash: string
  createdAt: string
  addresses: AddressRecord[]
  cards: CardRecord[]
}

export interface OrderItemRecord {
  productId: number
  title: string
  price: number
  quantity: number
}

export interface PaymentRecord {
  provider: 'stripe'
  status: 'authorized' | 'captured' | 'failed'
  transactionId: string
  amount: number
  currency: string
  cardLast4: string
}

export type OrderStatus = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered'

export interface OrderRecord {
  id: string
  userId: string
  items: OrderItemRecord[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: OrderStatus
  shippingAddress: AddressRecord
  payment: PaymentRecord
  createdAt: string
  updatedAt: string
}

export interface ReturnRecord {
  id: string
  userId: string
  orderId: string
  reason: string
  status: 'requested' | 'approved' | 'refunded'
  createdAt: string
}

export interface AnalyticsEvent {
  id: string
  userId?: string
  sessionId?: string
  eventType: string
  metadata?: Record<string, unknown>
  timestamp: string
}

export interface AuthTokenPayload {
  userId: string
  email: string
  role: 'customer' | 'admin'
}

export interface DatabaseShape {
  products: ProductRecord[]
  users: UserRecord[]
  orders: OrderRecord[]
  returns: ReturnRecord[]
  analytics: AnalyticsEvent[]
}
