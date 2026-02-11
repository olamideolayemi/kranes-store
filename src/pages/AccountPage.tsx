import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountApi } from '../services/api'
import Button from '../components/ui/Button'
import { useToast } from '../hooks/useToast'

function AccountPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [tab, setTab] = useState<'orders' | 'tracking' | 'returns' | 'addresses' | 'cards'>('orders')
  const [trackingOrderId, setTrackingOrderId] = useState('')
  const [returnForm, setReturnForm] = useState({ orderId: '', reason: '' })
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    country: '',
    postalCode: '',
  })
  const [cardForm, setCardForm] = useState({
    holderName: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
  })

  const ordersQuery = useQuery({ queryKey: ['account', 'orders'], queryFn: accountApi.getOrders })
  const addressesQuery = useQuery({ queryKey: ['account', 'addresses'], queryFn: accountApi.getAddresses })
  const cardsQuery = useQuery({ queryKey: ['account', 'cards'], queryFn: accountApi.getCards })
  const returnsQuery = useQuery({ queryKey: ['account', 'returns'], queryFn: accountApi.getReturns })

  const trackingQuery = useQuery({
    queryKey: ['account', 'tracking', trackingOrderId],
    queryFn: () => accountApi.getTracking(trackingOrderId),
    enabled: trackingOrderId.length > 0,
  })

  const addAddress = useMutation({
    mutationFn: accountApi.addAddress,
    onSuccess: () => {
      showToast('Address saved', 'success')
      setAddressForm({
        label: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        city: '',
        country: '',
        postalCode: '',
      })
      void queryClient.invalidateQueries({ queryKey: ['account', 'addresses'] })
    },
  })

  const removeAddress = useMutation({
    mutationFn: accountApi.deleteAddress,
    onSuccess: () => {
      showToast('Address removed', 'info')
      void queryClient.invalidateQueries({ queryKey: ['account', 'addresses'] })
    },
  })

  const addCard = useMutation({
    mutationFn: accountApi.addCard,
    onSuccess: () => {
      showToast('Card saved', 'success')
      setCardForm({ holderName: '', cardNumber: '', expMonth: '', expYear: '' })
      void queryClient.invalidateQueries({ queryKey: ['account', 'cards'] })
    },
  })

  const removeCard = useMutation({
    mutationFn: accountApi.deleteCard,
    onSuccess: () => {
      showToast('Card removed', 'info')
      void queryClient.invalidateQueries({ queryKey: ['account', 'cards'] })
    },
  })

  const createReturn = useMutation({
    mutationFn: accountApi.requestReturn,
    onSuccess: () => {
      showToast('Return request submitted', 'success')
      setReturnForm({ orderId: '', reason: '' })
      void queryClient.invalidateQueries({ queryKey: ['account', 'returns'] })
    },
  })

  const latestOrders = useMemo(() => ordersQuery.data || [], [ordersQuery.data])

  return (
    <section className="page-stack">
      <h1>My account</h1>

      <div className="view-toggle">
        <button type="button" className={tab === 'orders' ? 'chip chip-active' : 'chip'} onClick={() => setTab('orders')}>
          Orders
        </button>
        <button type="button" className={tab === 'tracking' ? 'chip chip-active' : 'chip'} onClick={() => setTab('tracking')}>
          Tracking
        </button>
        <button type="button" className={tab === 'returns' ? 'chip chip-active' : 'chip'} onClick={() => setTab('returns')}>
          Returns
        </button>
        <button type="button" className={tab === 'addresses' ? 'chip chip-active' : 'chip'} onClick={() => setTab('addresses')}>
          Addresses
        </button>
        <button type="button" className={tab === 'cards' ? 'chip chip-active' : 'chip'} onClick={() => setTab('cards')}>
          Cards
        </button>
      </div>

      {tab === 'orders' ? (
        <section className="card tabs-wrap">
          <h3>Orders</h3>
          {latestOrders.length === 0 ? <p>No orders yet.</p> : null}
          {latestOrders.map((order) => (
            <article key={order.id} className="card p-3">
              <p>Order #{order.id}</p>
              <p>Status: {order.status}</p>
              <p>Total: ${order.total.toFixed(2)}</p>
              <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'tracking' ? (
        <section className="card tabs-wrap">
          <h3>Order tracking</h3>
          <div className="row-actions">
            <input
              className="input"
              placeholder="Paste order id"
              value={trackingOrderId}
              onChange={(event) => setTrackingOrderId(event.target.value)}
            />
          </div>

          {trackingQuery.data ? (
            <div className="stepper">
              {trackingQuery.data.timeline.map((stage) => (
                <span key={stage.stage} className={stage.completed ? 'chip chip-active' : 'chip'}>
                  {stage.stage.replaceAll('_', ' ')}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted-text">Enter an order id to fetch tracking timeline.</p>
          )}
        </section>
      ) : null}

      {tab === 'returns' ? (
        <section className="card tabs-wrap">
          <h3>Return requests</h3>
          <div className="double-grid">
            <input
              className="input"
              placeholder="Order id"
              value={returnForm.orderId}
              onChange={(event) => setReturnForm((prev) => ({ ...prev, orderId: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Reason"
              value={returnForm.reason}
              onChange={(event) => setReturnForm((prev) => ({ ...prev, reason: event.target.value }))}
            />
          </div>
          <Button
            onClick={() => createReturn.mutate(returnForm)}
            disabled={!returnForm.orderId || returnForm.reason.length < 6 || createReturn.isPending}
          >
            Submit return
          </Button>

          {(returnsQuery.data || []).map((entry) => (
            <article key={entry.id} className="card p-3">
              <p>Order #{entry.orderId}</p>
              <p>Status: {entry.status}</p>
              <p>Reason: {entry.reason}</p>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'addresses' ? (
        <section className="card tabs-wrap">
          <h3>Saved addresses</h3>
          <div className="checkout-form">
            <input
              className="input"
              placeholder="Label"
              value={addressForm.label}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Full name"
              value={addressForm.fullName}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Phone"
              value={addressForm.phone}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Address line"
              value={addressForm.addressLine1}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, addressLine1: event.target.value }))}
            />
            <div className="double-grid">
              <input
                className="input"
                placeholder="City"
                value={addressForm.city}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
              />
              <input
                className="input"
                placeholder="Country"
                value={addressForm.country}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))}
              />
            </div>
            <input
              className="input"
              placeholder="Postal code"
              value={addressForm.postalCode}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, postalCode: event.target.value }))}
            />
            <Button
              onClick={() => addAddress.mutate(addressForm)}
              disabled={Object.values(addressForm).some((value) => value.trim().length === 0) || addAddress.isPending}
            >
              Save address
            </Button>
          </div>

          {(addressesQuery.data || []).map((address) => (
            <article key={address.id} className="card p-3">
              <p>{address.label}</p>
              <p>{address.fullName}</p>
              <p>
                {address.addressLine1}, {address.city}, {address.country}
              </p>
              <Button variant="ghost" onClick={() => removeAddress.mutate(address.id)}>
                Delete
              </Button>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'cards' ? (
        <section className="card tabs-wrap">
          <h3>Saved cards</h3>
          <div className="checkout-form">
            <input
              className="input"
              placeholder="Card holder"
              value={cardForm.holderName}
              onChange={(event) => setCardForm((prev) => ({ ...prev, holderName: event.target.value }))}
            />
            <input
              className="input"
              placeholder="Card number"
              value={cardForm.cardNumber}
              onChange={(event) => setCardForm((prev) => ({ ...prev, cardNumber: event.target.value }))}
            />
            <div className="double-grid">
              <input
                className="input"
                placeholder="MM"
                value={cardForm.expMonth}
                onChange={(event) => setCardForm((prev) => ({ ...prev, expMonth: event.target.value }))}
              />
              <input
                className="input"
                placeholder="YYYY"
                value={cardForm.expYear}
                onChange={(event) => setCardForm((prev) => ({ ...prev, expYear: event.target.value }))}
              />
            </div>
            <Button
              onClick={() => addCard.mutate(cardForm)}
              disabled={Object.values(cardForm).some((value) => value.trim().length === 0) || addCard.isPending}
            >
              Save card
            </Button>
          </div>

          {(cardsQuery.data || []).map((card) => (
            <article key={card.id} className="card p-3">
              <p>
                {card.brand} ending in {card.last4}
              </p>
              <p>
                Expires {card.expMonth}/{card.expYear}
              </p>
              <Button variant="ghost" onClick={() => removeCard.mutate(card.id)}>
                Delete
              </Button>
            </article>
          ))}
        </section>
      ) : null}
    </section>
  )
}

export default AccountPage
