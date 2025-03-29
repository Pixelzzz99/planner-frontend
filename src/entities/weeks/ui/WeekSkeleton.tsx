export const WeekSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 bg-background z-10 border-b">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 h-48 animate-pulse" />
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 h-64 animate-pulse" />
          </div>

          <div className="lg:col-span-9">
            <div className="flex gap-4 overflow-x-auto">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[300px]">
                  <div className="h-12 bg-muted mb-4 rounded animate-pulse" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <div
                        key={j}
                        className="h-24 bg-muted rounded animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
