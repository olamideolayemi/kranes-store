import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CartIconProps {
  count: number
}

function CartIcon({ count }: CartIconProps) {
  return (
    <Link to="/cart" className="icon-link" aria-label="View cart">
      <ShoppingBag size={18} />
      <span>Cart</span>
      {count > 0 ? <span className="badge">{count}</span> : null}
    </Link>
  )
}

export default CartIcon
