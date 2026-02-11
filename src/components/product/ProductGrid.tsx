import type { Product } from '../../types/models'
import type { AsyncStatus } from '../../types/models'
import type { CatalogViewMode } from '../../store/slices/productsSlice'
import LoadingSkeleton from '../common/LoadingSkeleton'
import ErrorState from '../common/ErrorState'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  status: AsyncStatus
  error: string | null
  viewMode?: CatalogViewMode
  onRetry?: () => void
}

function ProductGrid({ products, status, error, viewMode = 'grid', onRetry }: ProductGridProps) {
  if (status === 'loading') {
    return <LoadingSkeleton count={10} />
  }

  if (status === 'failed') {
    return <ErrorState message={error || 'Unknown error'} onRetry={onRetry} />
  }

  if (products.length === 0) {
    return (
      <div className="state-container">
        <h2>No products found</h2>
        <p>Try another combination of category, search, or price range.</p>
      </div>
    )
  }

  return (
    <div className={viewMode === 'list' ? 'product-grid-list' : 'product-grid'}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} mode={viewMode} />
      ))}
    </div>
  )
}

export default ProductGrid
