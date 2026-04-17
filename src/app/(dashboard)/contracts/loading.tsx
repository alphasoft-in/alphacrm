import { Skeleton } from "@/components/ui/skeleton"

export default function ContractsLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <header className="flex flex-col gap-1 border-l-[3px] border-zinc-100 pl-4 py-0.5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-64" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-100 p-5 rounded-xl shadow-sm">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 bg-white">
          <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
        </div>
        
        <div className="p-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 border-b border-zinc-50 flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
