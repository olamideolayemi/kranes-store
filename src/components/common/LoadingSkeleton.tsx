interface LoadingSkeletonProps {
  count?: number
}

function LoadingSkeleton({ count = 8 }: LoadingSkeletonProps) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`skeleton-${index}`} className="card skeleton-card" />
      ))}
    </div>
  )
}

export default LoadingSkeleton
