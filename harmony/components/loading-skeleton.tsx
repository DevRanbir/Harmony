'use client';

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-2/3 animate-pulse"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              </div>
              <div className="mt-4 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
