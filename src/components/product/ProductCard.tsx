import { Heart, Star, Truck } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Product } from '../../types/models'
import { useAppDispatch, useAppSelector } from '../../hooks/useStore'
import Button from '../ui/Button'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist } from '../../store/slices/wishlistSlice'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useToast } from '../../hooks/useToast'
import type { CatalogViewMode } from '../../store/slices/productsSlice'

interface ProductCardProps {
  product: Product
  mode?: CatalogViewMode
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

function ProductCard({ product, mode = 'grid' }: ProductCardProps) {
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const { track } = useAnalytics()
  const isWishlisted = useAppSelector((state) =>
    state.wishlist.items.some((item) => item.id === product.id),
  )

  const handleAddToCart = () => {
    dispatch(addToCart(product))
    showToast('Added to cart', 'success')
    track('add_to_cart', { productId: product.id, title: product.title, price: product.price })
  }

  const handleWishlist = () => {
    dispatch(toggleWishlist(product))
    showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info')
    track('wishlist_toggle', { productId: product.id, wishlisted: !isWishlisted })
  }

  const oldPrice = product.price * 1.22
  const rating = product.rating?.rate ?? 4.2
  const reviews = product.rating?.count ?? 0
  const savings = Math.round(((oldPrice - product.price) / oldPrice) * 100)

  return (
    <Motion.article
      className={`card product-card ${mode === 'list' ? 'product-card-list' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <button type="button" className="wishlist-toggle" onClick={handleWishlist} aria-label="Toggle wishlist">
        <Heart size={18} className={isWishlisted ? 'heart-active' : ''} />
      </button>

      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img src={product.image} alt={product.title} className="product-image" loading="lazy" />
      </Link>

      <div className="product-content">
        <p className="product-category">{product.category}</p>
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h3>

        <div className="rating-row">
          <span className="rating-pill">
            <Star size={13} /> {rating.toFixed(1)}
          </span>
          <span className="muted-text">{reviews} reviews</span>
        </div>

        <div className="price-block">
          <p className="product-price">{formatCurrency(product.price)}</p>
          <p className="old-price">{formatCurrency(oldPrice)}</p>
          <span className="save-pill">Save {savings}%</span>
        </div>

        <p className="ship-note">
          <Truck size={14} /> Fast delivery and buyer protection
        </p>

        <div className="product-actions">
          <Button onClick={handleAddToCart}>Add to cart</Button>
          <Link to={`/products/${product.id}`}>
            <Button variant="ghost">Quick view</Button>
          </Link>
        </div>
      </div>
    </Motion.article>
  )
}

export default ProductCard
