import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { LRUCache } from 'lru-cache'
import { z } from 'zod'
import { CONFIG } from './config'
import { adminMiddleware, authMiddleware, parseToken, signToken } from './auth'
import { db } from './dataStore'
import type {
  AnalyticsEvent,
  CardRecord,
  OrderRecord,
  OrderStatus,
  ProductRecord,
  ReturnRecord,
  UserRecord,
} from './types'

const app = express()
const FAKE_STORE_BASE_URL = 'https://fakestoreapi.com'

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

const productCache = new LRUCache<string, unknown>({ max: 150, ttl: CONFIG.cacheTtlMs })

interface FakeStoreProduct {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

const bySort = (items: ProductRecord[], sortBy: string) => {
  const sorted = [...items]
  switch (sortBy) {
    case 'price-low-high':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-high-low':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'rating-high':
      sorted.sort((a, b) => b.rating.rate - a.rating.rate)
      break
    case 'most-reviewed':
      sorted.sort((a, b) => b.rating.count - a.rating.count)
      break
    default:
      sorted.sort((a, b) => b.rating.rate * 2 + b.rating.count / 10 - (a.rating.rate * 2 + a.rating.count / 10))
      break
  }

  return sorted
}

const orderStatusTimeline = (status: OrderRecord['status']) => {
  const stages = ['processing', 'shipped', 'out_for_delivery', 'delivered']
  const index = stages.indexOf(status)

  return stages.map((stage, stageIndex) => ({
    stage,
    completed: stageIndex <= index,
  }))
}

const variantFromSeed = (seed: string, values: string[]) => {
  const hash = seed.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0)
  return values[hash % values.length]
}

const fetchFakeStoreProductsRaw = async (): Promise<FakeStoreProduct[]> => {
  const cacheKey = '__fakestore_raw_products__'
  const cached = productCache.get(cacheKey)

  if (cached) {
    return cached as FakeStoreProduct[]
  }

  const response = await fetch(`${FAKE_STORE_BASE_URL}/products`)
  if (!response.ok) {
    throw new Error(`Fake Store API failed (${response.status})`)
  }

  const raw = (await response.json()) as FakeStoreProduct[]
  productCache.set(cacheKey, raw)
  return raw
}

const mergeProducts = async (): Promise<ProductRecord[]> => {
  const fakeProducts = await fetchFakeStoreProductsRaw()
  const localProducts = db.read().products
  const localById = new Map(localProducts.map((item) => [item.id, item]))

  const mergedFromFake = fakeProducts
    .map((remote) => {
      const local = localById.get(remote.id)
      const combined: ProductRecord = {
        ...remote,
        ...local,
        rating: local?.rating || remote.rating,
        stock: local?.stock ?? 120,
        sku: local?.sku || `FS-${String(remote.id).padStart(4, '0')}`,
        isCustom: false,
      }

      if (combined.isArchived) {
        return null
      }

      return combined
    })
    .filter(Boolean) as ProductRecord[]

  const fakeIds = new Set(fakeProducts.map((entry) => entry.id))
  const localOnly = localProducts.filter((entry) => !fakeIds.has(entry.id) && !entry.isArchived)

  return [...mergedFromFake, ...localOnly]
}

const getProductById = async (productId: number): Promise<ProductRecord | undefined> => {
  const products = await mergeProducts()
  return products.find((entry) => entry.id === productId)
}

const ensureAdminUser = async (): Promise<void> => {
  const snapshot = db.read()
  const existingAdmin = snapshot.users.find((entry) => entry.role === 'admin')

  if (existingAdmin) {
    return
  }

  const passwordHash = await bcrypt.hash(CONFIG.bootstrapAdminPassword, 10)
  const adminUser: UserRecord = {
    id: nanoid(),
    email: CONFIG.bootstrapAdminEmail,
    name: CONFIG.bootstrapAdminName,
    role: 'admin',
    passwordHash,
    createdAt: new Date().toISOString(),
    addresses: [],
    cards: [],
  }

  snapshot.users.push(adminUser)
  db.saveUsers(snapshot.users)
  console.log(`Bootstrap admin created: ${CONFIG.bootstrapAdminEmail}`)
}

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'kranes-api' })
})

app.get('/api/products/meta/categories', async (_request, response) => {
  try {
    const categories = Array.from(new Set((await mergeProducts()).map((product) => product.category)))
    response.json(categories)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load categories'
    response.status(502).json({ message })
  }
})

app.get('/api/products', async (request, response) => {
  const q = String(request.query.q || '').trim().toLowerCase()
  const category = String(request.query.category || 'all')
  const minRating = Number(request.query.minRating || 0)
  const maxPrice = Number(request.query.maxPrice || Number.MAX_SAFE_INTEGER)
  const sortBy = String(request.query.sortBy || 'featured')
  const page = Math.max(1, Number(request.query.page || 1))
  const pageSize = Math.min(60, Math.max(1, Number(request.query.pageSize || 12)))
  const onlyPopular = String(request.query.onlyPopular || 'false') === 'true'

  const cacheKey = JSON.stringify({ q, category, minRating, maxPrice, sortBy, page, pageSize, onlyPopular })
  const cached = productCache.get(cacheKey)
  if (cached) {
    response.json(cached)
    return
  }

  let allProducts: ProductRecord[]
  try {
    allProducts = await mergeProducts()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load products'
    response.status(502).json({ message })
    return
  }

  const filtered = allProducts.filter((product) => {
    const categoryMatch = category === 'all' || product.category === category
    const queryMatch =
      q.length === 0 ||
      product.title.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q)
    const ratingMatch = (product.rating?.rate ?? 0) >= minRating
    const priceMatch = product.price <= maxPrice
    const popularMatch = !onlyPopular || (product.rating?.count ?? 0) >= 120

    return categoryMatch && queryMatch && ratingMatch && priceMatch && popularMatch
  })

  const sorted = bySort(filtered, sortBy)
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize

  const payload = {
    items: sorted.slice(start, start + pageSize),
    meta: {
      page: safePage,
      pageSize,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  }

  productCache.set(cacheKey, payload)
  response.json(payload)
})

app.get('/api/products/:id', async (request, response) => {
  const productId = Number(request.params.id)

  try {
    const product = await getProductById(productId)

    if (!product) {
      response.status(404).json({ message: 'Product not found' })
      return
    }

    response.json(product)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load product'
    response.status(502).json({ message })
  }
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

app.post('/api/auth/register', async (request, response) => {
  const parsed = registerSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid registration payload' })
    return
  }

  const { email, password, name } = parsed.data
  const snapshot = db.read()
  const exists = snapshot.users.some((user) => user.email.toLowerCase() === email.toLowerCase())

  if (exists) {
    response.status(409).json({ message: 'Email already in use' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user: UserRecord = {
    id: nanoid(),
    email,
    name,
    role: 'customer',
    passwordHash,
    createdAt: new Date().toISOString(),
    addresses: [],
    cards: [],
  }

  const users = [...snapshot.users, user]
  db.saveUsers(users)

  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  response.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

app.post('/api/auth/login', async (request, response) => {
  const parsed = loginSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid login payload' })
    return
  }

  const { email, password } = parsed.data
  const user = db.read().users.find((entry) => entry.email.toLowerCase() === email.toLowerCase())

  if (!user) {
    response.status(401).json({ message: 'Invalid credentials' })
    return
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    response.status(401).json({ message: 'Invalid credentials' })
    return
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role })
  response.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

app.get('/api/auth/me', authMiddleware, (request, response) => {
  const { id, email, name, role } = request.user!
  response.json({ id, email, name, role })
})

app.get('/api/account/addresses', authMiddleware, (request, response) => {
  response.json(request.user!.addresses)
})

const addressSchema = z.object({
  label: z.string().min(2),
  fullName: z.string().min(2),
  phone: z.string().min(5),
  addressLine1: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
  postalCode: z.string().min(2),
})

app.post('/api/account/addresses', authMiddleware, (request, response) => {
  const parsed = addressSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid address payload' })
    return
  }

  const snapshot = db.read()
  const user = snapshot.users.find((entry) => entry.id === request.user!.id)

  if (!user) {
    response.status(404).json({ message: 'User not found' })
    return
  }

  const address = {
    id: nanoid(),
    ...parsed.data,
    isDefault: user.addresses.length === 0,
  }

  user.addresses.push(address)
  db.saveUsers(snapshot.users)
  response.status(201).json(address)
})

app.delete('/api/account/addresses/:id', authMiddleware, (request, response) => {
  const snapshot = db.read()
  const user = snapshot.users.find((entry) => entry.id === request.user!.id)

  if (!user) {
    response.status(404).json({ message: 'User not found' })
    return
  }

  user.addresses = user.addresses.filter((address) => address.id !== request.params.id)
  db.saveUsers(snapshot.users)
  response.status(204).end()
})

app.get('/api/account/cards', authMiddleware, (request, response) => {
  response.json(request.user!.cards)
})

const cardSchema = z.object({
  holderName: z.string().min(2),
  cardNumber: z.string().min(12),
  expMonth: z.string().min(1),
  expYear: z.string().min(2),
})

app.post('/api/account/cards', authMiddleware, (request, response) => {
  const parsed = cardSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid card payload' })
    return
  }

  const snapshot = db.read()
  const user = snapshot.users.find((entry) => entry.id === request.user!.id)

  if (!user) {
    response.status(404).json({ message: 'User not found' })
    return
  }

  const digits = parsed.data.cardNumber.replace(/\s+/g, '')
  const last4 = digits.slice(-4)
  const brand = digits.startsWith('4') ? 'Visa' : digits.startsWith('5') ? 'Mastercard' : 'Card'

  const card: CardRecord = {
    id: nanoid(),
    holderName: parsed.data.holderName,
    last4,
    brand,
    expMonth: parsed.data.expMonth,
    expYear: parsed.data.expYear,
    isDefault: user.cards.length === 0,
  }

  user.cards.push(card)
  db.saveUsers(snapshot.users)
  response.status(201).json(card)
})

app.delete('/api/account/cards/:id', authMiddleware, (request, response) => {
  const snapshot = db.read()
  const user = snapshot.users.find((entry) => entry.id === request.user!.id)

  if (!user) {
    response.status(404).json({ message: 'User not found' })
    return
  }

  user.cards = user.cards.filter((card) => card.id !== request.params.id)
  db.saveUsers(snapshot.users)
  response.status(204).end()
})

app.get('/api/account/orders', authMiddleware, (request, response) => {
  const orders = db
    .read()
    .orders.filter((order) => order.userId === request.user!.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  response.json(orders)
})

const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number(),
        quantity: z.number().min(1),
      }),
    )
    .min(1),
  addressId: z.string(),
  cardId: z.string(),
})

app.post('/api/orders', authMiddleware, async (request, response) => {
  const parsed = placeOrderSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid order payload' })
    return
  }

  const snapshot = db.read()
  let products: ProductRecord[]

  try {
    products = await mergeProducts()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load catalog for order'
    response.status(502).json({ message })
    return
  }

  const user = snapshot.users.find((entry) => entry.id === request.user!.id)

  if (!user) {
    response.status(404).json({ message: 'User not found' })
    return
  }

  const selectedAddress = user.addresses.find((address) => address.id === parsed.data.addressId)
  const selectedCard = user.cards.find((card) => card.id === parsed.data.cardId)

  if (!selectedAddress || !selectedCard) {
    response.status(400).json({ message: 'Select a valid saved address and card' })
    return
  }

  let orderItems: OrderRecord['items']
  try {
    orderItems = parsed.data.items.map((item) => {
      const product = products.find((entry) => entry.id === item.id)

      if (!product) {
        throw new Error(`Product ${item.id} not found`)
      }

      let inventory = snapshot.products.find((entry) => entry.id === item.id)
      if (!inventory) {
        inventory = {
          ...product,
          stock: product.stock ?? 120,
          sku: product.sku || `FS-${String(product.id).padStart(4, '0')}`,
          isCustom: Boolean(product.isCustom),
        }
        snapshot.products.push(inventory)
      }

      if (inventory.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`)
      }

      inventory.stock -= item.quantity

      return {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to place order'
    response.status(400).json({ message })
    return
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.075
  const shipping = subtotal > 80 ? 0 : 6
  const total = subtotal + tax + shipping

  const order: OrderRecord = {
    id: nanoid(),
    userId: user.id,
    items: orderItems,
    subtotal,
    tax,
    shipping,
    total,
    status: 'processing',
    shippingAddress: selectedAddress,
    payment: {
      provider: 'stripe',
      status: 'captured',
      transactionId: `txn_${nanoid(12)}`,
      amount: total,
      currency: 'USD',
      cardLast4: selectedCard.last4,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  snapshot.orders.push(order)
  db.saveOrders(snapshot.orders)
  db.saveProducts(snapshot.products)
  productCache.clear()

  response.status(201).json(order)
})

app.get('/api/account/tracking/:orderId', authMiddleware, (request, response) => {
  const order = db
    .read()
    .orders.find((entry) => entry.id === request.params.orderId && entry.userId === request.user!.id)

  if (!order) {
    response.status(404).json({ message: 'Order not found' })
    return
  }

  response.json({
    orderId: order.id,
    status: order.status,
    timeline: orderStatusTimeline(order.status),
    lastUpdated: order.updatedAt,
  })
})

app.get('/api/account/returns', authMiddleware, (request, response) => {
  const returnsList = db.read().returns.filter((entry) => entry.userId === request.user!.id)
  response.json(returnsList)
})

const returnSchema = z.object({
  orderId: z.string(),
  reason: z.string().min(6),
})

app.post('/api/account/returns', authMiddleware, (request, response) => {
  const parsed = returnSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid return request' })
    return
  }

  const snapshot = db.read()
  const order = snapshot.orders.find((entry) => entry.id === parsed.data.orderId && entry.userId === request.user!.id)

  if (!order) {
    response.status(404).json({ message: 'Order not found' })
    return
  }

  const returnRequest: ReturnRecord = {
    id: nanoid(),
    userId: request.user!.id,
    orderId: order.id,
    reason: parsed.data.reason,
    status: 'requested',
    createdAt: new Date().toISOString(),
  }

  snapshot.returns.push(returnRequest)
  db.saveReturns(snapshot.returns)
  response.status(201).json(returnRequest)
})

app.get('/api/inventory/:productId', async (request, response) => {
  const productId = Number(request.params.productId)

  try {
    const product = await getProductById(productId)

    if (!product) {
      response.status(404).json({ message: 'Product not found' })
      return
    }

    response.json({ productId, sku: product.sku, stock: product.stock })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load inventory'
    response.status(502).json({ message })
  }
})

app.get('/api/admin/overview', authMiddleware, adminMiddleware, async (_request, response) => {
  const snapshot = db.read()
  const allProducts = await mergeProducts()

  response.json({
    products: allProducts.length,
    orders: snapshot.orders.length,
    returns: snapshot.returns.length,
    users: snapshot.users.length,
    revenue: snapshot.orders.reduce((sum, order) => sum + order.total, 0),
  })
})

app.get('/api/admin/products', authMiddleware, adminMiddleware, async (_request, response) => {
  const products = await mergeProducts()
  response.json(products)
})

const adminProductSchema = z.object({
  title: z.string().min(3),
  price: z.number().positive(),
  description: z.string().min(8),
  category: z.string().min(2),
  image: z.string().url(),
  stock: z.number().int().min(0),
})

app.post('/api/admin/products', authMiddleware, adminMiddleware, (request, response) => {
  const parsed = adminProductSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid product payload' })
    return
  }

  const snapshot = db.read()
  const nextId = Math.max(100000, ...snapshot.products.map((entry) => entry.id), 0) + 1

  const product: ProductRecord = {
    id: nextId,
    title: parsed.data.title,
    price: parsed.data.price,
    description: parsed.data.description,
    category: parsed.data.category,
    image: parsed.data.image,
    rating: { rate: 4.5, count: 0 },
    stock: parsed.data.stock,
    sku: `ADM-${String(nextId).padStart(6, '0')}`,
    isCustom: true,
  }

  snapshot.products.push(product)
  db.saveProducts(snapshot.products)
  productCache.clear()
  response.status(201).json(product)
})

const adminProductPatchSchema = z.object({
  title: z.string().min(3).optional(),
  price: z.number().positive().optional(),
  description: z.string().min(8).optional(),
  category: z.string().min(2).optional(),
  image: z.string().url().optional(),
  stock: z.number().int().min(0).optional(),
  isArchived: z.boolean().optional(),
})

app.patch('/api/admin/products/:id', authMiddleware, adminMiddleware, async (request, response) => {
  const parsed = adminProductPatchSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid product update payload' })
    return
  }

  const productId = Number(request.params.id)
  const snapshot = db.read()

  let product = snapshot.products.find((entry) => entry.id === productId)
  if (!product) {
    const merged = await mergeProducts()
    const source = merged.find((entry) => entry.id === productId)

    if (!source) {
      response.status(404).json({ message: 'Product not found' })
      return
    }

    product = { ...source }
    snapshot.products.push(product)
  }

  Object.assign(product, parsed.data)
  db.saveProducts(snapshot.products)
  productCache.clear()

  response.json(product)
})

app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, (request, response) => {
  const productId = Number(request.params.id)
  const snapshot = db.read()
  const product = snapshot.products.find((entry) => entry.id === productId)

  if (!product) {
    response.status(404).json({ message: 'Product not found in local managed catalog' })
    return
  }

  if (product.isCustom) {
    snapshot.products = snapshot.products.filter((entry) => entry.id !== productId)
  } else {
    product.isArchived = true
  }

  db.saveProducts(snapshot.products)
  productCache.clear()
  response.status(204).end()
})

app.get('/api/admin/orders', authMiddleware, adminMiddleware, (request, response) => {
  const snapshot = db.read()
  const orders = snapshot.orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  response.json(orders)
})

const orderStatusSchema = z.object({
  status: z.enum(['processing', 'shipped', 'out_for_delivery', 'delivered']),
})

app.patch('/api/admin/orders/:id/status', authMiddleware, adminMiddleware, (request, response) => {
  const parsed = orderStatusSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid order status payload' })
    return
  }

  const snapshot = db.read()
  const order = snapshot.orders.find((entry) => entry.id === request.params.id)

  if (!order) {
    response.status(404).json({ message: 'Order not found' })
    return
  }

  order.status = parsed.data.status as OrderStatus
  order.updatedAt = new Date().toISOString()
  db.saveOrders(snapshot.orders)

  response.json(order)
})

app.get('/api/admin/returns', authMiddleware, adminMiddleware, (request, response) => {
  const snapshot = db.read()
  response.json(snapshot.returns)
})

const returnStatusSchema = z.object({
  status: z.enum(['requested', 'approved', 'refunded']),
})

app.patch('/api/admin/returns/:id/status', authMiddleware, adminMiddleware, (request, response) => {
  const parsed = returnStatusSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid return status payload' })
    return
  }

  const snapshot = db.read()
  const returnRequest = snapshot.returns.find((entry) => entry.id === request.params.id)

  if (!returnRequest) {
    response.status(404).json({ message: 'Return not found' })
    return
  }

  returnRequest.status = parsed.data.status
  db.saveReturns(snapshot.returns)

  response.json(returnRequest)
})

app.get('/api/admin/inventory', authMiddleware, adminMiddleware, async (_request, response) => {
  const products = await mergeProducts()
  response.json(
    products.map((product) => ({
      id: product.id,
      title: product.title,
      sku: product.sku,
      stock: product.stock,
      category: product.category,
      price: product.price,
      source: product.isCustom ? 'custom' : 'fakestore',
    })),
  )
})

const inventoryPatchSchema = z.object({
  stock: z.number().int().min(0),
})

app.patch('/api/admin/inventory/:productId', authMiddleware, adminMiddleware, async (request, response) => {
  const parsed = inventoryPatchSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid inventory payload' })
    return
  }

  const productId = Number(request.params.productId)
  const snapshot = db.read()
  let product = snapshot.products.find((entry) => entry.id === productId)

  if (!product) {
    const merged = await mergeProducts()
    const source = merged.find((entry) => entry.id === productId)

    if (!source) {
      response.status(404).json({ message: 'Product not found' })
      return
    }

    product = { ...source }
    snapshot.products.push(product)
  }

  product.stock = parsed.data.stock
  db.saveProducts(snapshot.products)
  productCache.clear()

  response.json({ id: product.id, stock: product.stock, sku: product.sku })
})

app.get('/api/admin/analytics', authMiddleware, adminMiddleware, (_request, response) => {
  const events = db.read().analytics
  const byType = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1
    return acc
  }, {})

  response.json({
    totalEvents: events.length,
    byType,
    recentEvents: events.slice(-20).reverse(),
  })
})

const analyticsSchema = z.object({
  eventType: z.string().min(2),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().optional(),
})

app.post('/api/analytics/events', (request, response) => {
  const parsed = analyticsSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({ message: 'Invalid analytics payload' })
    return
  }

  const header = request.headers.authorization
  let userId: string | undefined

  if (header?.startsWith('Bearer ')) {
    const token = header.replace('Bearer ', '')
    const payload = parseToken(token)
    userId = payload?.userId
  }

  const snapshot = db.read()
  const event: AnalyticsEvent = {
    id: nanoid(),
    userId,
    sessionId: parsed.data.sessionId,
    eventType: parsed.data.eventType,
    metadata: parsed.data.metadata,
    timestamp: new Date().toISOString(),
  }

  snapshot.analytics.push(event)
  const capped = snapshot.analytics.slice(-5000)
  db.saveAnalytics(capped)

  response.status(202).json({ accepted: true })
})

app.get('/api/analytics/summary', (_request, response) => {
  const events = db.read().analytics
  const byType = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1
    return acc
  }, {})

  response.json({
    totalEvents: events.length,
    byType,
  })
})

app.get('/api/experiments', (request, response) => {
  const seed =
    (request.headers['x-session-id'] as string | undefined) ||
    request.headers['user-agent'] ||
    String(Date.now())

  response.json({
    heroVariant: variantFromSeed(String(seed), ['control', 'premium']),
    checkoutVariant: variantFromSeed(String(seed) + 'checkout', ['compact', 'guided']),
    recommendationVariant: variantFromSeed(String(seed) + 'rec', ['top-rated', 'frequently-bought']),
  })
})

app.use('/api', (_request, response) => {
  response.status(404).json({ message: 'API route not found' })
})

const start = async () => {
  await ensureAdminUser()

  app.listen(CONFIG.port, () => {
    console.log(`kranes-api running on http://localhost:${CONFIG.port}`)
    console.log(`Admin login email: ${CONFIG.bootstrapAdminEmail}`)
  })
}

void start()
