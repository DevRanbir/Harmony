import { LoadingSkeleton } from '@/components/loading-skeleton';

export default function Loading() {
  const customSettingsContent = (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Settings Navigation Skeleton */}
      <div className="lg:w-80 space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-full p-4 rounded-lg border bg-white">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mt-0.5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings Content Skeleton */}
      <div className="flex-1">
        <div className="bg-white border rounded-lg p-6">
          <div className="space-y-8">
            {/* Section 1 */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </div>
                    <div className="h-9 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-gray-200 animate-pulse"></div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                    <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-gray-200 animate-pulse"></div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/5 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <LoadingSkeleton 
      header={{ 
        titleWidth: "w-1/4",
        subtitleWidth: "w-1/2"
      }}
      content={{ 
        layout: 'custom',
        customContent: customSettingsContent
      }}
      showAppSidebar={true}
    />
  );
}