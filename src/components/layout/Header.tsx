import { Heart, LogIn, LogOut, Menu, ShoppingBag, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useStore'
import SearchBar from '../product/SearchBar'
import CartIcon from '../cart/CartIcon'
import { logout } from '../../store/slices/authSlice'
import { fetchCategories, setCategory, setSearchQuery } from '../../store/slices/productsSlice'

function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchValue, setSearchValue] = useState('')

  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0),
  )
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length)
  const user = useAppSelector((state) => state.auth.user)
  const { categories, categoriesStatus } = useAppSelector((state) => state.products)

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategories())
    }
  }, [categoriesStatus, dispatch])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(setSearchQuery(searchValue))
    if (location.pathname !== '/products') {
      navigate('/products')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <header className="site-header">
      <div className="utility-strip">
        <div className="container utility-inner">
          <p>
            <ShoppingBag size={14} /> Free shipping over $80
          </p>
          <p>24/7 buyer support</p>
        </div>
      </div>

      <div className="container header-inner header-main">
        <button type="button" className="menu-button" aria-label="Open menu">
          <Menu size={18} />
        </button>

        <NavLink to="/" className="brand">
          Krane&apos;s <span>Market</span>
        </NavLink>

        <SearchBar value={searchValue} onChange={(event) => setSearchValue(event.target.value)} onSubmit={handleSearchSubmit} />

        <nav className="nav-links">
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/wishlist" className="icon-link">
            <Heart size={18} />
            <span>Wishlist</span>
            {wishlistCount > 0 ? <span className="badge">{wishlistCount}</span> : null}
          </NavLink>
          <CartIcon count={cartCount} />

          {user ? (
            <button type="button" className="icon-link plain-button" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <NavLink to="/login" className="icon-link">
              <LogIn size={18} />
              <span>Login</span>
            </NavLink>
          )}

          <NavLink to="/account" className="icon-link account-pill">
            <UserRound size={18} />
            <span>{user ? user.name : 'Guest'}</span>
          </NavLink>
        </nav>
      </div>

      <div className="container category-nav-wrap">
        <nav className="category-nav">
          {categories.slice(0, 8).map((category) => (
            <button
              type="button"
              key={category}
              className="category-nav-link"
              onClick={() => {
                dispatch(setCategory(category))
                navigate('/products')
              }}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
