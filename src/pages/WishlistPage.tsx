import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/useStore'
import Button from '../components/ui/Button'
import { removeFromWishlist } from '../store/slices/wishlistSlice'
import { addToCart } from '../store/slices/cartSlice'
import { useToast } from '../hooks/useToast'

function WishlistPage() {
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const items = useAppSelector((state) => state.wishlist.items)

  if (items.length === 0) {
    return (
      <div className="state-container">
        <h1>Your wishlist is empty</h1>
        <p>Save products to compare and buy later.</p>
        <Link to="/products">
          <Button>Explore products</Button>
        </Link>
      </div>
    )
  }

  return (
    <section className="page-stack">
      <div className="section-head">
        <h1>Wishlist</h1>
        <p className="muted-text">{items.length} saved products</p>
      </div>

      <div className="product-grid-list">
        {items.map((item) => (
          <article key={item.id} className="card product-card product-card-list">
            <img src={item.image} alt={item.title} className="product-image" />
            <div className="product-content">
              <p className="product-category">{item.category}</p>
              <h2 className="product-title">{item.title}</h2>
              <p className="product-price">${item.price.toFixed(2)}</p>

              <div className="row-actions">
                <Button
                  onClick={() => {
                    dispatch(addToCart(item))
                    showToast('Moved to cart', 'success')
                  }}
                >
                  Add to cart
                </Button>
                <Button variant="ghost" onClick={() => dispatch(removeFromWishlist(item.id))}>
                  Remove
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default WishlistPage
