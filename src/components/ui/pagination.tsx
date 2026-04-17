import { Button } from "./button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-zinc-100">
      <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
        Página {currentPage} de {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-zinc-100 text-zinc-400 hover:text-zinc-900"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-zinc-100 text-zinc-400 hover:text-zinc-900"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={14} />
        </Button>
        <div className="flex items-center gap-1 px-2">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1
            // Mostrar solo algunas páginas si hay muchas
            if (
              totalPages > 7 &&
              page !== 1 &&
              page !== totalPages &&
              Math.abs(page - currentPage) > 1
            ) {
              if (page === 2 || page === totalPages - 1) return <span key={page} className="text-zinc-300 text-[10px]">...</span>
              return null
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                className={`h-8 w-8 rounded-lg text-[10px] font-bold ${
                  currentPage === page 
                    ? "bg-zinc-900 text-white hover:bg-black" 
                    : "border-zinc-100 text-zinc-500 hover:text-zinc-900"
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-zinc-100 text-zinc-400 hover:text-zinc-900"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-zinc-100 text-zinc-400 hover:text-zinc-900"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight size={14} />
        </Button>
      </div>
    </div>
  )
}
