import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { useState, type ReactNode } from 'react'
import { store } from '../store'
import ToastProvider from '../components/ui/ToastProvider'

interface AppProvidersProps {
  children: ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </Provider>
  )
}

export default AppProviders
