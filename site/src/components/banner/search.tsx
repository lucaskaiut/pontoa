'use client';
import { useState } from 'react';
import { LuSearch } from 'react-icons/lu';

export function Search() {
  const [search, setSearch] = useState('');
  return (
    <div className="w-full flex items-center gap-2">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Busque produtos, serviços e muito mais..."
        aria-label="Campo de pesquisa"
        className="w-10/12 rounded-sm bg-white px-3 h-12 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
      <button type="submit" className="text-white w-2/12 h-12 bg-slate-900 rounded-sm flex items-center justify-center hover:bg-slate-800 transition-colors">
        <span>Buscar</span>
      </button>
    </div>
  );
}
