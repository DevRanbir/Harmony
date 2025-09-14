import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function Loading() {
  const customPricingContent = (
    <div className="space-y-8">
      {/* Pricing header */}
      <div className="text-center space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3 mx-auto animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-2/3 mx-auto animate-pulse"></div>
      </div>
      
      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`bg-white border-2 rounded-lg p-8 ${i === 2 ? 'border-primary' : 'border-gray-200'}`}>
            {/* Plan name */}
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            
            {/* Price */}
            <div className="mb-6">
              <div className="h-12 bg-gray-200 rounded w-2/3 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
            
            {/* Features list */}
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                </div>
              ))}
            </div>
            
            {/* CTA button */}
            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse"></div>
          </div>
        ))}
      </div>
      
      {/* FAQ section */}
      <div className="max-w-3xl mx-auto mt-16">
        <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <LoadingSkeleton 
      header={{ showHeader: false }}
      content={{ 
        layout: 'custom',
        customContent: customPricingContent
      }}
      showAppSidebar={true}
    />
  );
}
