// Reusable shimmer skeleton blocks
const shimmer = 'animate-pulse bg-gray-200 rounded';

export const SkeletonLine  = ({ w = 'w-full', h = 'h-4' }) => <div className={`${shimmer} ${w} ${h}`} />;
export const SkeletonBox   = ({ className = '' }) => <div className={`${shimmer} ${className}`} />;
export const SkeletonCard  = ({ rows = 3 }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
    <SkeletonLine w="w-1/2" h="h-5" />
    {Array.from({ length: rows }).map((_, i) => <SkeletonLine key={i} w={i % 2 === 0 ? 'w-full' : 'w-3/4'} />)}
  </div>
);

// 4 stat cards in a row
export const SkeletonStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <SkeletonBox className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonLine w="w-2/3" h="h-3" />
          <SkeletonLine w="w-1/2" h="h-6" />
        </div>
      </div>
    ))}
  </div>
);

// Hero banner skeleton
export const SkeletonBanner = ({ color = 'from-gray-200 to-gray-300' }) => (
  <div className={`bg-gradient-to-r ${color} rounded-2xl p-6 animate-pulse`}>
    <div className="h-3 w-24 bg-white/40 rounded mb-2" />
    <div className="h-7 w-48 bg-white/40 rounded mb-2" />
    <div className="h-3 w-64 bg-white/40 rounded mb-4" />
    <div className="flex gap-3">
      <div className="h-9 w-32 bg-white/40 rounded-lg" />
      <div className="h-9 w-32 bg-white/40 rounded-lg" />
    </div>
  </div>
);

// Table rows skeleton
export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="bg-gray-50 border-b border-gray-100 p-4 flex gap-4">
      {[...Array(cols)].map((_, i) => <SkeletonLine key={i} w="w-20" h="h-4" />)}
    </div>
    {[...Array(rows)].map((_, r) => (
      <div key={r} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
        <SkeletonBox className="w-9 h-9 rounded-full flex-shrink-0" />
        {[...Array(cols - 1)].map((_, c) => (
          <SkeletonLine key={c} w={c === 0 ? 'w-32' : 'w-20'} h="h-4" />
        ))}
      </div>
    ))}
  </div>
);

// Grid of cards skeleton
export const SkeletonGrid = ({ count = 6, rows = 3 }) => (
  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {[...Array(count)].map((_, i) => <SkeletonCard key={i} rows={rows} />)}
  </div>
);

// List rows inside a card
export const SkeletonList = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4">
        <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine w="w-1/3" h="h-4" />
          <SkeletonLine w="w-1/2" h="h-3" />
        </div>
        <SkeletonLine w="w-16" h="h-5" />
      </div>
    ))}
  </div>
);
