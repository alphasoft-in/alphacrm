import { Skeleton } from "@/components/ui/skeleton"

export default function CustomersLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <header className="flex flex-col gap-1 border-l-[3px] border-zinc-100 pl-4 py-0.5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-64" />
      </header>

      <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white">
          <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {[...Array(5)].map((_, i) => (
                  <th key={i} className="p-4 text-left">
                    <Skeleton className="h-3 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-zinc-50">
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
