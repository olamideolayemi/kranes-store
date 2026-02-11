import { Search } from 'lucide-react'
import type { ChangeEventHandler, FormEventHandler } from 'react'
import Input from '../ui/Input'

interface SearchBarProps {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onSubmit: FormEventHandler<HTMLFormElement>
  placeholder?: string
}

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search for products, brands, and categories',
}: SearchBarProps) {
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <Search size={16} className="search-icon" />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label="Search products"
      />
    </form>
  )
}

export default SearchBar
