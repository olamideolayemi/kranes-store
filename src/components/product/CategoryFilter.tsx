interface CategoryFilterProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="chip-list">
      <button
        type="button"
        className={`chip ${activeCategory === 'all' ? 'chip-active' : ''}`}
        onClick={() => onCategoryChange('all')}
      >
        All departments
      </button>

      {categories.map((category) => (
        <button
          type="button"
          key={category}
          className={`chip ${activeCategory === category ? 'chip-active' : ''}`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
