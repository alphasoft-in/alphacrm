import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Header Skeleton */}
      <header className="flex flex-col gap-1 border-l-[3px] border-zinc-100 pl-4 py-0.5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-48" />
      </header>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-100 p-5 pt-4 rounded-xl shadow-sm">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid md:grid-cols-3 gap-4 h-[350px]">
        <div className="md:col-span-2 bg-white border border-zinc-100 rounded-2xl p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-sm" />
            <Skeleton className="h-4 w-full max-w-xs" />
          </div>
          <Skeleton className="h-32 w-full mt-8" />
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl flex flex-col p-5 gap-4">
          <Skeleton className="h-6 w-32" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-zinc-50 pb-3">
               <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
               </div>
               <Skeleton className="h-2 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-zinc-100 rounded-2xl p-6 h-[300px]">
           <Skeleton className="h-full w-full" />
        </div>
        <div className="bg-white border border-zinc-100 rounded-2xl p-6 h-[300px]">
           <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}
