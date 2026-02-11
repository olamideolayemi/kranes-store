import { useEffect, useMemo, useState } from 'react'
import { Heart, ShieldCheck, Star, Truck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/useStore'
import Button from '../components/ui/Button'
import { productsApi } from '../services/api'
import { addToCart } from '../store/slices/cartSlice'
import { fetchProducts } from '../store/slices/productsSlice'
import { toggleWishlist } from '../store/slices/wishlistSlice'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import ErrorState from '../components/common/ErrorState'
import { useToast } from '../hooks/useToast'

function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  const productId = Number(id)
  const [tab, setTab] = useState<'overview' | 'specs' | 'reviews'>('overview')

  const catalogItems = useAppSelector((state) => state.products.items)
  const isWishlisted = useAppSelector((state) => state.wishlist.items.some((item) => item.id === productId))

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id ?? ''),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (catalogItems.length === 0) {
      dispatch(fetchProducts({ pageSize: 40 }))
    }
  }, [catalogItems.length, dispatch])

  const relatedProducts = useMemo(() => {
    if (!product) {
      return []
    }

    return catalogItems.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)
  }, [catalogItems, product])

  if (isLoading) {
    return <LoadingSkeleton count={1} />
  }

  if (isError || !product) {
    return <ErrorState message={error?.message || 'Product not found'} onRetry={() => void refetch()} />
  }

  const rating = product.rating?.rate ?? 4.1
  const reviews = product.rating?.count ?? 180

  return (
    <section className="page-stack">
      <p className="breadcrumbs">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.category}</span>
      </p>

      <article className="product-detail card product-detail-advanced">
        <div className="detail-image-wrap">
          <img src={product.image} alt={product.title} className="detail-image" />
          <span className="save-pill">Top rated</span>
        </div>

        <div className="detail-content">
          <p className="product-category">{product.category}</p>
          <h1>{product.title}</h1>

          <div className="rating-row">
            <span className="rating-pill">
              <Star size={13} /> {rating.toFixed(1)}
            </span>
            <p className="muted-text">{reviews} verified ratings</p>
          </div>

          <p className="detail-price">${product.price.toFixed(2)}</p>

          <div className="trust-row">
            <p>
              <Truck size={15} /> Express shipping available
            </p>
            <p>
              <ShieldCheck size={15} /> Secure payments and refund guarantee
            </p>
          </div>

          <div className="detail-actions">
            <Button
              onClick={() => {
                dispatch(addToCart(product))
                showToast('Added to cart', 'success')
              }}
            >
              Add to cart
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(toggleWishlist(product))
                showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info')
              }}
            >
              <Heart size={16} />
              {isWishlisted ? 'Remove wishlist' : 'Add wishlist'}
            </Button>
          </div>
        </div>
      </article>

      <section className="card tabs-wrap">
        <div className="view-toggle">
          <button
            type="button"
            className={tab === 'overview' ? 'chip chip-active' : 'chip'}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={tab === 'specs' ? 'chip chip-active' : 'chip'}
            onClick={() => setTab('specs')}
          >
            Specs
          </button>
          <button
            type="button"
            className={tab === 'reviews' ? 'chip chip-active' : 'chip'}
            onClick={() => setTab('reviews')}
          >
            Reviews
          </button>
        </div>

        {tab === 'overview' ? <p className="detail-description">{product.description}</p> : null}

        {tab === 'specs' ? (
          <div className="spec-grid">
            <article>
              <h4>Category</h4>
              <p>{product.category}</p>
            </article>
            <article>
              <h4>Average rating</h4>
              <p>{rating.toFixed(1)} / 5</p>
            </article>
            <article>
              <h4>Review count</h4>
              <p>{reviews}</p>
            </article>
            <article>
              <h4>Delivery</h4>
              <p>1-3 business days</p>
            </article>
          </div>
        ) : null}

        {tab === 'reviews' ? (
          <div className="review-list">
            <article>
              <p className="rating-pill">
                <Star size={13} /> 5.0
              </p>
              <p>Excellent value and high quality build. Fast shipping and secure packaging.</p>
            </article>
            <article>
              <p className="rating-pill">
                <Star size={13} /> 4.6
              </p>
              <p>Product matches description. Customer support was quick and helpful.</p>
            </article>
          </div>
        ) : null}
      </section>

      {relatedProducts.length > 0 ? (
        <section className="page-stack">
          <div className="section-head">
            <h2>Related products</h2>
            <Link to="/products">Browse all</Link>
          </div>

          <div className="product-grid">
            {relatedProducts.map((related) => (
              <article key={related.id} className="card related-card">
                <img src={related.image} alt={related.title} className="product-image" />
                <div>
                  <p className="product-category">{related.category}</p>
                  <h3 className="product-title">{related.title}</h3>
                  <p className="product-price">${related.price.toFixed(2)}</p>
                  <Link to={`/products/${related.id}`} className="text-link">
                    View product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  )
}

export default ProductDetailPage
