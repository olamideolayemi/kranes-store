import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi } from '../../services/api'
import type { AsyncStatus, User } from '../../types/models'
import { getAuthToken, setAuthToken } from '../../utils/storage'

export const hydrateSession = createAsyncThunk('auth/hydrateSession', async () => {
  const token = getAuthToken()

  if (!token) {
    return { user: null, token: null as string | null }
  }

  try {
    const user = await authApi.me()
    return { user, token }
  } catch {
    setAuthToken(null)
    return { user: null, token: null as string | null }
  }
})

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const payload = await authApi.register({ name, email, password })
    setAuthToken(payload.token)
    return payload
  },
)

export const login = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }) => {
  const payload = await authApi.login({ email, password })
  setAuthToken(payload.token)
  return payload
})

interface AuthState {
  user: User | null
  token: string | null
  status: AsyncStatus
  hydrateStatus: AsyncStatus
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: getAuthToken(),
  status: 'idle',
  hydrateStatus: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
      setAuthToken(null)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateSession.pending, (state) => {
        state.hydrateStatus = 'loading'
      })
      .addCase(hydrateSession.fulfilled, (state, action) => {
        state.hydrateStatus = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(hydrateSession.rejected, (state) => {
        state.hydrateStatus = 'failed'
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Registration failed'
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Login failed'
      })
  },
})

export const { logout } = authSlice.actions

export default authSlice.reducer
