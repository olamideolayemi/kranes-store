import { useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useExperiment } from '../hooks/useExperiment'
import { useAppDispatch, useAppSelector } from '../hooks/useStore'
import ProductGrid from '../components/product/ProductGrid'
import Button from '../components/ui/Button'
import { fetchCategories, fetchProducts } from '../store/slices/productsSlice'

function HomePage() {
  const dispatch = useAppDispatch()
  const { items, categories, status, error } = useAppSelector((state) => state.products)
  const { data: experiments } = useExperiment()

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts({ pageSize: 24 }))
      dispatch(fetchCategories())
    }
  }, [dispatch, status])

  const featuredProducts = items.slice(0, 8)
  const bestDeals = [...items].sort((a, b) => a.price - b.price).slice(0, 3)

  return (
    <Motion.section
      className="page-stack"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="top-strip card">
        <p>
          <Sparkles size={14} /> Mega Saving Week: up to 40% off selected categories
        </p>
        <p>
          <Truck size={14} /> Same-day dispatch for top-rated products
        </p>
        <p>
          <ShieldCheck size={14} /> Buyer protection and secure checkout
        </p>
      </div>

      <Motion.div
        className={`hero hero-advanced ${experiments?.heroVariant === 'premium' ? 'hero-premium' : ''}`}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <div className="hero-copy">
          <p className="eyebrow">Global marketplace experience</p>
          <h1>
            {experiments?.heroVariant === 'premium'
              ? 'Premium marketplace shopping at global scale.'
              : 'Everything you need, delivered with speed and trust.'}
          </h1>
          <p>
            Discover premium electronics, fashion, and essentials with competitive pricing, verified
            ratings, and intelligent shopping tools.
          </p>
          <div className="hero-actions">
            <Link to="/products">
              <Button>Start shopping</Button>
            </Link>
            <Link to="/cart">
              <Button variant="secondary">Go to cart</Button>
            </Link>
          </div>
        </div>

        <div className="hero-metrics">
          <div>
            <p className="metric-label">Catalog depth</p>
            <h3>10K+ SKUs</h3>
          </div>
          <div>
            <p className="metric-label">Repeat buyers</p>
            <h3>86%</h3>
          </div>
          <div>
            <p className="metric-label">Avg. fulfillment</p>
            <h3>24 hours</h3>
          </div>
        </div>
      </Motion.div>

      <section className="section-head">
        <h2>Browse departments</h2>
        <Link to="/products">Explore all</Link>
      </section>

      <div className="category-tiles">
        {categories.slice(0, 6).map((category) => (
          <Link key={category} to="/products" className="category-tile card">
            <p>{category}</p>
            <ArrowRight size={16} />
          </Link>
        ))}
      </div>

      <section className="section-head">
        <h2>Flash deals</h2>
        <Link to="/products">View deal zone</Link>
      </section>

      <div className="deal-grid">
        {bestDeals.map((deal) => {
          const discount = Math.round(((deal.price * 1.2 - deal.price) / (deal.price * 1.2)) * 100)
          return (
            <article key={deal.id} className="deal-card card">
              <img src={deal.image} alt={deal.title} />
              <div>
                <p className="save-pill">-{discount}%</p>
                <h3>{deal.title}</h3>
                <p className="product-price">${deal.price.toFixed(2)}</p>
              </div>
            </article>
          )
        })}
      </div>

      <section className="section-head">
        <h2>Trending now</h2>
        <Link to="/products">View full catalog</Link>
      </section>

      <ProductGrid
        products={featuredProducts}
        status={status}
        error={error}
        onRetry={() => dispatch(fetchProducts({ pageSize: 24 }))}
      />
    </Motion.section>
  )
}

export default HomePage
