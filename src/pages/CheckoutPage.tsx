import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks/useStore'
import Button from '../components/ui/Button'
import { clearCart } from '../store/slices/cartSlice'
import { accountApi, ordersApi } from '../services/api'
import { useToast } from '../hooks/useToast'

function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const user = useAppSelector((state) => state.auth.user)
  const items = useAppSelector((state) => state.cart.items)

  const addressesQuery = useQuery({
    queryKey: ['account', 'addresses'],
    queryFn: accountApi.getAddresses,
    enabled: Boolean(user),
  })

  const cardsQuery = useQuery({
    queryKey: ['account', 'cards'],
    queryFn: accountApi.getCards,
    enabled: Boolean(user),
  })

  const placeOrder = useMutation({
    mutationFn: ordersApi.placeOrder,
    onSuccess: async () => {
      dispatch(clearCart())
      showToast('Order placed successfully', 'success')
      await queryClient.invalidateQueries({ queryKey: ['account', 'orders'] })
      navigate('/account')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (items.length === 0) {
    return (
      <div className="state-container">
        <h1>No items to checkout</h1>
        <p>Add products to your cart first.</p>
        <Link to="/products">
          <Button>Browse products</Button>
        </Link>
      </div>
    )
  }

  const addresses = addressesQuery.data || []
  const cards = cardsQuery.data || []

  if (addressesQuery.isLoading || cardsQuery.isLoading) {
    return <div className="state-container">Loading saved checkout data...</div>
  }

  if (addresses.length === 0 || cards.length === 0) {
    return (
      <div className="state-container">
        <h1>Complete your account setup</h1>
        <p>
          Add at least one saved address and card before placing an order.
          This powers tracking, returns, and faster checkout.
        </p>
        <Link to="/account">
          <Button>Go to account setup</Button>
        </Link>
      </div>
    )
  }

  const defaultAddress = addresses.find((entry) => entry.isDefault) || addresses[0]
  const defaultCard = cards.find((entry) => entry.isDefault) || cards[0]

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.075
  const shipping = subtotal > 80 ? 0 : 6
  const total = subtotal + tax + shipping

  return (
    <section className="page-stack">
      <h1>Checkout</h1>
      <p>Signed in as {user.email}</p>

      <div className="checkout-layout">
        <div className="card checkout-main checkout-form">
          <h3>Delivery address</h3>
          <p>
            {defaultAddress.fullName} ({defaultAddress.label})
          </p>
          <p>
            {defaultAddress.addressLine1}, {defaultAddress.city}, {defaultAddress.country}
          </p>

          <h3>Payment method</h3>
          <p>
            {defaultCard.brand} ending in {defaultCard.last4}
          </p>
          <p className="muted-text">
            <ShieldCheck size={14} /> Real backend order + payment record will be created.
          </p>

          <Button
            disabled={placeOrder.isPending}
            onClick={() =>
              placeOrder.mutate({
                items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
                addressId: defaultAddress.id,
                cardId: defaultCard.id,
              })
            }
          >
            {placeOrder.isPending ? 'Placing order...' : 'Place order'}
          </Button>

          <Link to="/account">
            <Button variant="ghost">Manage addresses/cards</Button>
          </Link>
        </div>

        <aside className="summary-box">
          <h3>Order summary</h3>
          <p>Items: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax: ${tax.toFixed(2)}</p>
          <p>Shipping: ${shipping.toFixed(2)}</p>
          <h2>Total: ${total.toFixed(2)}</h2>
        </aside>
      </div>
    </section>
  )
}

export default CheckoutPage
