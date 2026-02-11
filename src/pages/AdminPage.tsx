import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api'
import type { Order, Product, ReturnRequest } from '../types/models'
import Button from '../components/ui/Button'
import { useToast } from '../hooks/useToast'

function AdminPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const [tab, setTab] = useState<'overview' | 'products' | 'orders' | 'returns' | 'inventory' | 'analytics'>(
    'overview',
  )

  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '0',
    description: '',
    category: '',
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    stock: '100',
  })

  const [inventoryEdits, setInventoryEdits] = useState<Record<number, string>>({})

  const overviewQuery = useQuery({ queryKey: ['admin', 'overview'], queryFn: adminApi.overview })
  const productsQuery = useQuery({ queryKey: ['admin', 'products'], queryFn: adminApi.products })
  const ordersQuery = useQuery({ queryKey: ['admin', 'orders'], queryFn: adminApi.orders })
  const returnsQuery = useQuery({ queryKey: ['admin', 'returns'], queryFn: adminApi.returns })
  const inventoryQuery = useQuery({ queryKey: ['admin', 'inventory'], queryFn: adminApi.inventory })
  const analyticsQuery = useQuery({ queryKey: ['admin', 'analytics'], queryFn: adminApi.analytics })

  const createProduct = useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: () => {
      showToast('Product created', 'success')
      setNewProduct({
        title: '',
        price: '0',
        description: '',
        category: '',
        image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        stock: '100',
      })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error: Error) => showToast(error.message, 'error'),
  })

  const deleteProduct = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => {
      showToast('Product removed/archived', 'info')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const updateOrderStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      showToast('Order status updated', 'success')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      void queryClient.invalidateQueries({ queryKey: ['account', 'orders'] })
    },
  })

  const updateReturnStatus = useMutation({
    mutationFn: ({ returnId, status }: { returnId: string; status: ReturnRequest['status'] }) =>
      adminApi.updateReturnStatus(returnId, status),
    onSuccess: () => {
      showToast('Return status updated', 'success')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'returns'] })
      void queryClient.invalidateQueries({ queryKey: ['account', 'returns'] })
    },
  })

  const updateInventory = useMutation({
    mutationFn: ({ productId, stock }: { productId: number; stock: number }) =>
      adminApi.updateInventory(productId, stock),
    onSuccess: () => {
      showToast('Inventory updated', 'success')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const mostViewedEvents = useMemo(() => {
    const data = analyticsQuery.data
    if (!data) {
      return []
    }

    return Object.entries(data.byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [analyticsQuery.data])

  return (
    <section className="page-stack">
      <h1>Admin Dashboard</h1>

      <div className="view-toggle">
        {(['overview', 'products', 'orders', 'returns', 'inventory', 'analytics'] as const).map((entry) => (
          <button
            key={entry}
            type="button"
            className={tab === entry ? 'chip chip-active' : 'chip'}
            onClick={() => setTab(entry)}
          >
            {entry}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <section className="admin-grid">
          <article className="card admin-stat">
            <h3>Products</h3>
            <p>{overviewQuery.data?.products ?? '-'}</p>
          </article>
          <article className="card admin-stat">
            <h3>Orders</h3>
            <p>{overviewQuery.data?.orders ?? '-'}</p>
          </article>
          <article className="card admin-stat">
            <h3>Returns</h3>
            <p>{overviewQuery.data?.returns ?? '-'}</p>
          </article>
          <article className="card admin-stat">
            <h3>Users</h3>
            <p>{overviewQuery.data?.users ?? '-'}</p>
          </article>
          <article className="card admin-stat admin-stat-wide">
            <h3>Revenue</h3>
            <p>${(overviewQuery.data?.revenue ?? 0).toFixed(2)}</p>
          </article>
        </section>
      ) : null}

      {tab === 'products' ? (
        <section className="page-stack">
          <article className="card tabs-wrap">
            <h3>Create product</h3>
            <input
              className="input"
              placeholder="Title"
              value={newProduct.title}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, title: event.target.value }))}
            />
            <textarea
              className="input"
              placeholder="Description"
              value={newProduct.description}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, description: event.target.value }))}
            />
            <div className="double-grid">
              <input
                className="input"
                placeholder="Price"
                type="number"
                min="0"
                value={newProduct.price}
                onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))}
              />
              <input
                className="input"
                placeholder="Stock"
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(event) => setNewProduct((prev) => ({ ...prev, stock: event.target.value }))}
              />
            </div>
            <input
              className="input"
              placeholder="Category"
              value={newProduct.category}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, category: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Image URL"
              value={newProduct.image}
              onChange={(event) => setNewProduct((prev) => ({ ...prev, image: event.target.value }))}
            />
            <Button
              onClick={() =>
                createProduct.mutate({
                  title: newProduct.title,
                  description: newProduct.description,
                  price: Number(newProduct.price),
                  category: newProduct.category,
                  image: newProduct.image,
                  stock: Number(newProduct.stock),
                })
              }
              disabled={
                createProduct.isPending ||
                !newProduct.title ||
                !newProduct.description ||
                !newProduct.category ||
                !newProduct.image
              }
            >
              Create product
            </Button>
          </article>

          <article className="card tabs-wrap">
            <h3>Managed products</h3>
            {(productsQuery.data || []).map((product: Product) => (
              <div key={product.id} className="admin-row">
                <div>
                  <p>
                    #{product.id} {product.title}
                  </p>
                  <p className="muted-text">
                    ${product.price.toFixed(2)} | {product.category} | stock {product.stock ?? 0} |{' '}
                    {product.isCustom ? 'custom' : 'fakestore'}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => deleteProduct.mutate(product.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </article>
        </section>
      ) : null}

      {tab === 'orders' ? (
        <section className="card tabs-wrap">
          <h3>Order management</h3>
          {(ordersQuery.data || []).map((order) => (
            <div key={order.id} className="admin-row">
              <div>
                <p>
                  #{order.id} | {order.items.length} items | ${order.total.toFixed(2)}
                </p>
                <p className="muted-text">Current: {order.status}</p>
              </div>
              <div className="row-actions">
                {(['processing', 'shipped', 'out_for_delivery', 'delivered'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={order.status === status ? 'chip chip-active' : 'chip'}
                    onClick={() => updateOrderStatus.mutate({ orderId: order.id, status })}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {tab === 'returns' ? (
        <section className="card tabs-wrap">
          <h3>Return management</h3>
          {(returnsQuery.data || []).map((entry) => (
            <div key={entry.id} className="admin-row">
              <div>
                <p>
                  Return #{entry.id} for order #{entry.orderId}
                </p>
                <p className="muted-text">Reason: {entry.reason}</p>
                <p className="muted-text">Status: {entry.status}</p>
              </div>
              <div className="row-actions">
                {(['requested', 'approved', 'refunded'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={entry.status === status ? 'chip chip-active' : 'chip'}
                    onClick={() => updateReturnStatus.mutate({ returnId: entry.id, status })}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {tab === 'inventory' ? (
        <section className="card tabs-wrap">
          <h3>Inventory management</h3>
          {(inventoryQuery.data || []).map((entry) => (
            <div key={entry.id} className="admin-row">
              <div>
                <p>
                  #{entry.id} {entry.title}
                </p>
                <p className="muted-text">
                  SKU: {entry.sku} | source: {entry.source}
                </p>
              </div>
              <div className="row-actions">
                <input
                  className="input inventory-input"
                  type="number"
                  min="0"
                  value={inventoryEdits[entry.id] ?? String(entry.stock)}
                  onChange={(event) =>
                    setInventoryEdits((prev) => ({
                      ...prev,
                      [entry.id]: event.target.value,
                    }))
                  }
                />
                <Button
                  onClick={() => updateInventory.mutate({ productId: entry.id, stock: Number(inventoryEdits[entry.id] ?? entry.stock) })}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {tab === 'analytics' ? (
        <section className="card tabs-wrap">
          <h3>Analytics</h3>
          <p>Total events: {analyticsQuery.data?.totalEvents ?? 0}</p>
          {mostViewedEvents.map(([eventType, count]) => (
            <div key={eventType} className="admin-row">
              <p>{eventType}</p>
              <p>{count}</p>
            </div>
          ))}
        </section>
      ) : null}
    </section>
  )
}

export default AdminPage
