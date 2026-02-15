'use client';

import { useState } from 'react';
import { LuSearch } from 'react-icons/lu';

export function Search() {
  const [search, setSearch] = useState('');
  return (
    <div className="w-full flex items-stretch gap-2">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Busque produtos, serviços e muito mais..."
        aria-label="Campo de pesquisa"
        className="flex-1 min-w-0 rounded-lg md:rounded-sm bg-white px-3 h-11 sm:h-12 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1"
      />
      <button
        type="submit"
        className="text-white shrink-0 w-14 sm:w-24 h-11 sm:h-12 bg-slate-900 rounded-lg md:rounded-sm flex items-center justify-center gap-1.5 hover:bg-slate-800 active:bg-slate-700 transition-colors font-medium text-sm"
        aria-label="Buscar"
      >
        <LuSearch size={20} className="sm:hidden" />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </div>
  );
}
