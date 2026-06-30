export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Navbar Skeleton */}
      <div className="h-20 border-b border-gray-100 bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="hidden md:flex gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Hero Skeleton */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <div className="w-32 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-3">
              <div className="w-full md:w-3/4 h-12 md:h-16 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-2/3 md:w-1/2 h-12 md:h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-full md:w-2/3 h-20 bg-gray-200 rounded-lg animate-pulse mt-6"></div>
            <div className="flex gap-4 mt-8">
              <div className="w-40 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-40 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="w-full lg:w-[420px] h-[400px] bg-gray-200 rounded-3xl animate-pulse"></div>
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="w-full h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse mt-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-full h-16 bg-gray-200 rounded animate-pulse mt-4"></div>
              <div className="flex gap-3 mt-4">
                <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
