import type { CatalogViewMode, SortOption } from '../../store/slices/productsSlice'

interface CatalogToolbarProps {
  total: number
  sortBy: SortOption
  viewMode: CatalogViewMode
  onSortChange: (value: SortOption) => void
  onViewModeChange: (value: CatalogViewMode) => void
}

function CatalogToolbar({ total, sortBy, viewMode, onSortChange, onViewModeChange }: CatalogToolbarProps) {
  return (
    <div className="catalog-toolbar card">
      <p>
        <strong>{total}</strong> products found
      </p>

      <div className="catalog-toolbar-controls">
        <select value={sortBy} className="input" onChange={(event) => onSortChange(event.target.value as SortOption)}>
          <option value="featured">Featured</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="rating-high">Top Rated</option>
          <option value="most-reviewed">Most Reviewed</option>
        </select>

        <div className="view-toggle">
          <button
            type="button"
            className={viewMode === 'grid' ? 'chip chip-active' : 'chip'}
            onClick={() => onViewModeChange('grid')}
          >
            Grid
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'chip chip-active' : 'chip'}
            onClick={() => onViewModeChange('list')}
          >
            List
          </button>
        </div>
      </div>
    </div>
  )
}

export default CatalogToolbar
