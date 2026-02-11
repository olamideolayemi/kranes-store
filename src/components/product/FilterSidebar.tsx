import type { ChangeEvent } from 'react'
import Button from '../ui/Button'

interface FilterSidebarProps {
  minRating: number
  maxPrice: number
  onlyPopular: boolean
  priceCap: number
  onMinRatingChange: (value: number) => void
  onMaxPriceChange: (value: number) => void
  onOnlyPopularChange: (value: boolean) => void
  onClear: () => void
}

function FilterSidebar({
  minRating,
  maxPrice,
  onlyPopular,
  priceCap,
  onMinRatingChange,
  onMaxPriceChange,
  onOnlyPopularChange,
  onClear,
}: FilterSidebarProps) {
  const handleRating = (event: ChangeEvent<HTMLSelectElement>) => {
    onMinRatingChange(Number(event.target.value))
  }

  const handlePrice = (event: ChangeEvent<HTMLInputElement>) => {
    onMaxPriceChange(Number(event.target.value))
  }

  return (
    <aside className="filter-panel card">
      <div className="filter-head">
        <h3>Refine results</h3>
        <Button variant="ghost" onClick={onClear}>
          Reset
        </Button>
      </div>

      <label className="filter-field">
        <span>Minimum rating</span>
        <select className="input" value={minRating} onChange={handleRating}>
          <option value={0}>All ratings</option>
          <option value={3}>3 stars and up</option>
          <option value={4}>4 stars and up</option>
          <option value={4.5}>4.5 stars and up</option>
        </select>
      </label>

      <label className="filter-field">
        <span>Maximum price: ${maxPrice}</span>
        <input
          type="range"
          min={10}
          max={Math.max(100, priceCap)}
          value={Math.min(maxPrice, Math.max(100, priceCap))}
          onChange={handlePrice}
        />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={onlyPopular}
          onChange={(event) => onOnlyPopularChange(event.target.checked)}
        />
        <span>Only best sellers (120+ reviews)</span>
      </label>
    </aside>
  )
}

export default FilterSidebar
