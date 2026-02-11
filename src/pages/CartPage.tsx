import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, TicketPercent, Truck } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks/useStore'
import Button from '../components/ui/Button'
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice'
import { addToCart } from '../store/slices/cartSlice'
import { useToast } from '../hooks/useToast'
import { fetchProducts } from '../store/slices/productsSlice'

function CartPage() {
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const items = useAppSelector((state) => state.cart.items)
  const products = useAppSelector((state) => state.products.items)

  useEffect(() => {
    if (products.length === 0) {
      void dispatch(fetchProducts({ pageSize: 30 }))
    }
  }, [dispatch, products.length])

  const [coupon, setCoupon] = useState('')
  const [shippingMode, setShippingMode] = useState<'standard' | 'express'>('standard')

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const discount = coupon.trim().toUpperCase() === 'MEGA10' ? subtotal * 0.1 : 0
  const shipping = shippingMode === 'express' ? 12 : subtotal > 80 ? 0 : 6
  const tax = (subtotal - discount) * 0.075
  const grandTotal = subtotal - discount + shipping + tax

  const recommendations = useMemo(() => {
    if (products.length === 0) {
      return []
    }

    const cartIds = new Set(items.map((item) => item.id))
    return products.filter((item) => !cartIds.has(item.id)).slice(0, 3)
  }, [items, products])

  if (items.length === 0) {
    return (
      <div className="state-container">
        <h1>Your cart is empty</h1>
        <p>Browse products and add items to get started.</p>
        <Link to="/products">
          <Button>Shop products</Button>
        </Link>
      </div>
    )
  }

  return (
    <section className="page-stack">
      <h1>Shopping cart</h1>

      <div className="cart-layout">
        <div className="list-stack">
          {items.map((item) => (
            <article key={item.id} className="list-item cart-item">
              <img src={item.image} alt={item.title} className="list-image" />
              <div className="list-content">
                <h2>{item.title}</h2>
                <p className="product-category">{item.category}</p>
                <p className="product-price">${item.price.toFixed(2)}</p>
              </div>

              <div className="qty-controls">
                <button
                  type="button"
                  onClick={() => dispatch(updateQuantity({ productId: item.id, quantity: item.quantity - 1 }))}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => dispatch(updateQuantity({ productId: item.id, quantity: item.quantity + 1 }))}
                >
                  +
                </button>
              </div>

              <Button variant="ghost" onClick={() => dispatch(removeFromCart(item.id))}>
                Remove
              </Button>
            </article>
          ))}

          {recommendations.length > 0 ? (
            <section className="card recommendations">
              <h3>Customers also bought</h3>
              <div className="mini-grid">
                {recommendations.map((item) => (
                  <article key={item.id} className="mini-card">
                    <img src={item.image} alt={item.title} className="product-image" />
                    <h4>{item.title}</h4>
                    <p className="product-price">${item.price.toFixed(2)}</p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        dispatch(addToCart(item))
                        showToast('Added recommended item', 'success')
                      }}
                    >
                      Add
                    </Button>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="summary-box cart-summary">
          <h3>Order summary</h3>

          <label className="filter-field">
            <span>
              <TicketPercent size={14} /> Coupon code
            </span>
            <input
              className="input"
              type="text"
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              placeholder="Use MEGA10"
            />
          </label>

          <div className="shipping-options">
            <label>
              <input
                type="radio"
                checked={shippingMode === 'standard'}
                onChange={() => setShippingMode('standard')}
              />
              Standard delivery
            </label>
            <label>
              <input
                type="radio"
                checked={shippingMode === 'express'}
                onChange={() => setShippingMode('express')}
              />
              Express delivery
            </label>
          </div>

          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Discount: -${discount.toFixed(2)}</p>
          <p>Shipping: ${shipping.toFixed(2)}</p>
          <p>Tax: ${tax.toFixed(2)}</p>
          <h2>Total: ${grandTotal.toFixed(2)}</h2>

          <p className="muted-text">
            <ShieldCheck size={14} /> Encrypted checkout and secure payment processing.
          </p>

          <Link to="/checkout">
            <Button>Proceed to checkout</Button>
          </Link>
          <Link to="/products">
            <Button variant="ghost">Continue shopping</Button>
          </Link>
        </aside>
      </div>

      <div className="card benefits-row">
        <p>
          <Truck size={15} /> Free standard shipping above $80
        </p>
        <p>
          <ShieldCheck size={15} /> Easy returns within 30 days
        </p>
      </div>
    </section>
  )
}

export default CartPage
