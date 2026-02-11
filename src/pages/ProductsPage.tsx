import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/useStore'
import ProductGrid from '../components/product/ProductGrid'
import SearchBar from '../components/product/SearchBar'
import CategoryFilter from '../components/product/CategoryFilter'
import FilterSidebar from '../components/product/FilterSidebar'
import CatalogToolbar from '../components/product/CatalogToolbar'
import Button from '../components/ui/Button'
import {
  clearFilters,
  fetchCategories,
  fetchProducts,
  selectFilteredProducts,
  selectPriceCap,
  setCategory,
  setMaxPrice,
  setMinRating,
  setOnlyPopular,
  setSearchQuery,
  setSortBy,
  setViewMode,
} from '../store/slices/productsSlice'

function ProductsPage() {
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)

  const {
    status,
    error,
    categories,
    selectedCategory,
    searchQuery,
    sortBy,
    minRating,
    maxPrice,
    onlyPopular,
    viewMode,
    meta,
  } = useAppSelector((state) => state.products)
  const products = useAppSelector(selectFilteredProducts)
  const priceCap = useAppSelector(selectPriceCap)

  useEffect(() => {
    if (categories.length === 0) {
      void dispatch(fetchCategories())
    }
  }, [categories.length, dispatch])

  useEffect(() => {
    void dispatch(
      fetchProducts({
        searchQuery,
        selectedCategory,
        minRating,
        maxPrice,
        sortBy,
        onlyPopular,
        page,
        pageSize: 12,
      }),
    )
  }, [dispatch, searchQuery, selectedCategory, minRating, maxPrice, sortBy, onlyPopular, page])

  const resetAnd = (action: () => void) => {
    setPage(1)
    action()
  }

  return (
    <section className="page-stack">
      <div className="catalog-hero card">
        <h1>Marketplace Catalog</h1>
        <p>Use advanced discovery controls to find products by value, quality, and popularity.</p>
      </div>

      <div className="catalog-controls">
        <SearchBar
          value={searchQuery}
          onChange={(event) =>
            resetAnd(() => {
              dispatch(setSearchQuery(event.target.value))
            })
          }
          onSubmit={(event) => event.preventDefault()}
        />
        <CategoryFilter
          categories={categories}
          activeCategory={selectedCategory}
          onCategoryChange={(category) =>
            resetAnd(() => {
              dispatch(setCategory(category))
            })
          }
        />
      </div>

      <div className="catalog-layout">
        <FilterSidebar
          minRating={minRating}
          maxPrice={Math.min(maxPrice, Math.max(100, priceCap))}
          onlyPopular={onlyPopular}
          priceCap={priceCap}
          onMinRatingChange={(value) =>
            resetAnd(() => {
              dispatch(setMinRating(value))
            })
          }
          onMaxPriceChange={(value) =>
            resetAnd(() => {
              dispatch(setMaxPrice(value))
            })
          }
          onOnlyPopularChange={(value) =>
            resetAnd(() => {
              dispatch(setOnlyPopular(value))
            })
          }
          onClear={() =>
            resetAnd(() => {
              dispatch(clearFilters())
            })
          }
        />

        <div className="catalog-main">
          <CatalogToolbar
            total={meta.total}
            sortBy={sortBy}
            viewMode={viewMode}
            onSortChange={(value) =>
              resetAnd(() => {
                dispatch(setSortBy(value))
              })
            }
            onViewModeChange={(value) => {
              dispatch(setViewMode(value))
            }}
          />

          <ProductGrid
            products={products}
            status={status}
            error={error}
            viewMode={viewMode}
            onRetry={() =>
              dispatch(
                fetchProducts({
                  searchQuery,
                  selectedCategory,
                  minRating,
                  maxPrice,
                  sortBy,
                  onlyPopular,
                  page,
                  pageSize: 12,
                }),
              )
            }
          />

          <div className="catalog-pagination card">
            <Button variant="ghost" disabled={!meta.hasPrevPage || status === 'loading'} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <p>
              Page {meta.page} of {meta.totalPages}
            </p>
            <Button
              variant="secondary"
              disabled={!meta.hasNextPage || status === 'loading'}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductsPage
