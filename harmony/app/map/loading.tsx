import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function Loading() {
  const customMapContent = (
    <div className="space-y-4">
      {/* Map controls skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
          ))}
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
      </div>
      
      {/* Map area skeleton */}
      <div className="h-[70vh] bg-gray-200 rounded-lg animate-pulse relative">
        <div className="absolute inset-4 bg-gray-300 rounded animate-pulse opacity-50"></div>
        <div className="absolute top-4 right-4 space-y-2">
          <div className="h-10 w-10 bg-gray-300 rounded-lg animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>
        <div className="absolute bottom-4 left-4 h-8 bg-gray-300 rounded w-32 animate-pulse"></div>
      </div>
      
      {/* Legend/Info panel skeleton */}
      <div className="bg-white border rounded-lg p-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <LoadingSkeleton 
      header={{ 
        titleWidth: "w-1/4",
        subtitleWidth: "w-1/3"
      }}
      content={{ 
        layout: 'custom',
        customContent: customMapContent
      }}
      showAppSidebar={true}
    />
  );
}