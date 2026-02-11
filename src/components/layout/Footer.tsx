function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Krane&apos;s Market</h3>
          <p>Modern marketplace platform inspired by world-class ecommerce experiences.</p>
        </div>

        <div>
          <h4>Shop</h4>
          <p>Electronics</p>
          <p>Fashion</p>
          <p>Home & Living</p>
        </div>

        <div>
          <h4>Customer</h4>
          <p>Help center</p>
          <p>Returns</p>
          <p>Track order</p>
        </div>

        <div>
          <h4>Company</h4>
          <p>About us</p>
          <p>Careers</p>
          <p>Partners</p>
        </div>
      </div>

      <div className="container footer-inner">
        <p>Copyright {new Date().getFullYear()} Krane&apos;s Market. All rights reserved.</p>
        <p>Built with React + TypeScript + Redux Toolkit + React Query.</p>
      </div>
    </footer>
  )
}

export default Footer
