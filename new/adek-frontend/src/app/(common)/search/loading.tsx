"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-4 rounded-lg" />
          <Skeleton className="h-6 w-96 rounded-lg" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 bg-card rounded-xl border border-border p-3 hover:shadow-md transition-shadow duration-300"
            >
              {/* Product Image Skeleton */}
              <Skeleton className="w-full aspect-square rounded-lg bg-muted/50" />

              {/* Badge & Price Row Skeleton */}
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-lg" />
              </div>

              {/* Product Name Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-full rounded-lg" />
                <Skeleton className="h-5 w-4/5 rounded-lg" />
              </div>

              {/* Category Skeleton */}
              <Skeleton className="h-4 w-24 rounded-lg" />

              {/* Rating & Sales Row Skeleton */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-16 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-20 rounded-lg" />
              </div>

              {/* Button Skeleton */}
              <Skeleton className="h-10 w-full rounded-lg mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
