import type { ReactNode } from 'react'
import Footer from './Footer'
import Header from './Header'
import ToastContainer from '../ui/ToastContainer'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <Header />
      <main className="container page-content">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default Layout
