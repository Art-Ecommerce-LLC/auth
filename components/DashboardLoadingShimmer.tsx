'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function DashboardLoadingShimmer() {
  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Panel */}
        <div className="w-full md:w-1/4 space-y-4">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-3/4" />
          ))}
        </div>

        {/* Table + Map */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table */}
          <Card className="h-[600px] overflow-hidden">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-full">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
