import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/useStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { login, register } from '../store/slices/authSlice'
import { useToast } from '../hooks/useToast'

function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const { user, status, error } = useAppSelector((state) => state.auth)

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const destination = (location.state as { from?: string } | undefined)?.from || '/account'

  if (user) {
    return <Navigate to={destination} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const action =
      mode === 'login'
        ? login({ email, password })
        : register({ name: name.trim() || email.split('@')[0], email, password })

    const result = await dispatch(action)

    if (login.fulfilled.match(result) || register.fulfilled.match(result)) {
      showToast(mode === 'login' ? 'Logged in successfully' : 'Account created successfully', 'success')
      navigate(destination)
    }
  }

  return (
    <section className="auth-wrap page-stack">
      <div className="section-head">
        <h1>{mode === 'login' ? 'Login' : 'Create account'}</h1>
      </div>
      <p>Sign in to access orders, saved cards, addresses, tracking, and returns.</p>
      <p className="muted-text">Default admin demo credentials: admin@kranes.market / Admin123!</p>

      <div className="view-toggle">
        <button type="button" className={mode === 'login' ? 'chip chip-active' : 'chip'} onClick={() => setMode('login')}>
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'chip chip-active' : 'chip'}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'register' ? (
          <Input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        ) : null}

        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={mode === 'register' ? 'At least 8 characters' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={mode === 'register' ? 8 : undefined}
          required
        />

        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>

        {error ? <p className="error-text">{error}</p> : null}
      </form>

      <p className="muted-text">
        You can continue shopping from the <Link to="/products">catalog</Link> any time.
      </p>
    </section>
  )
}

export default LoginPage
