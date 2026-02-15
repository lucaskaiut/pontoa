export function ProductCardSkeleton() {
    return (
      <div className="flex flex-col min-w-0 w-full max-w-[320px] mx-auto sm:max-w-none sm:min-w-[200px] lg:min-w-[288px] min-h-[420px] sm:min-h-[480px] lg:h-[510px] bg-white rounded-xl sm:rounded-lg shadow-lg sm:shadow-xl animate-pulse">
        <div className="w-full aspect-square max-h-[240px] sm:max-h-[288px] lg:h-72 shrink-0">
          <div className="w-full h-full bg-slate-200 rounded-t-xl sm:rounded-t-lg" />
        </div>
  
        <div className="flex flex-col px-3 sm:px-2 pt-3 sm:pt-2 flex-1 min-h-0">
          <div className="h-4 sm:h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-3 sm:h-4 bg-slate-200 rounded w-full mt-2" />
          <div className="h-3 sm:h-4 bg-slate-200 rounded w-5/6 mt-1" />
  
          <div className="h-3 sm:h-4 bg-slate-200 rounded w-2/3 mt-2" />
          <div className="h-3 sm:h-4 bg-slate-200 rounded w-1/2 mt-1" />
  
          <div className="h-5 sm:h-6 bg-slate-200 rounded w-1/3 mt-3" />
  
          <div className="flex-1 min-h-2" />
  
          <div className="w-full h-10 sm:h-9 mb-2 bg-slate-200 rounded-lg sm:rounded-md mt-auto" />
        </div>
      </div>
    );
  }
  