export function Skeleton({ className = "", variant = "default", ...props }) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200/80 via-gray-300/60 to-gray-200/80 rounded-lg";
  const variants = {
    default: "bg-gradient-to-r from-gray-200/80 via-gray-300/60 to-gray-200/80",
    orange: "bg-gradient-to-r from-orange-100/80 via-orange-200/60 to-orange-100/80",
    card: "bg-gradient-to-r from-background-card-secondary/50 via-background-card-primary/30 to-background-card-secondary/50 backdrop-blur-sm",
  };
  
  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-gradient-to-br from-background-card-primary/95 via-background-card-secondary/90 to-background-card-primary/95 backdrop-blur-2xl rounded-2xl border border-stroke-default-primary-v2/30 p-lg relative overflow-hidden group shadow-lg">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/20 to-transparent animate-pulse" />
      
      <div className="relative z-10 space-y-md">
        {/* Header with status */}
        <div className="flex justify-between items-start">
          <div className="space-y-xs">
            <Skeleton className="h-6 w-48" variant="orange" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" variant="orange" />
        </div>
        
        {/* Description */}
        <div className="space-y-xs">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-sm border-t border-stroke-default-primary-v2/20">
          <div className="flex items-center gap-xs">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonUpdateList({ count = 3 }) {
  return (
    <div className="space-y-lg">
      {/* Date separator skeleton */}
      <div className="flex items-center gap-md py-sm">
        <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-300/30 to-gray-200/20" />
        <Skeleton className="h-8 w-20 rounded-xl" variant="orange" />
        <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-200/20 via-gray-300/30 to-transparent" />
      </div>
      
      {/* Update cards skeletons */}
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonFeedback() {
  return (
    <div className="bg-gradient-to-br from-background-card-primary/95 via-background-card-secondary/90 to-background-card-primary/95 backdrop-blur-2xl rounded-2xl border border-stroke-default-primary-v2/30 p-lg relative overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent animate-pulse" />
      
      <div className="relative z-10 space-y-md">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-xs">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center gap-xs">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="space-y-xs">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-sm border-t border-stroke-default-primary-v2/20">
          <div className="flex items-center gap-xs">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}