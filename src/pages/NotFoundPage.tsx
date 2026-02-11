import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

function NotFoundPage() {
  return (
    <div className="state-container">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/">
        <Button>Back home</Button>
      </Link>
    </div>
  )
}

export default NotFoundPage
