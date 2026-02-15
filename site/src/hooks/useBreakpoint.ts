'use client';
import { useEffect, useState } from 'react';

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('sm');

  useEffect(() => {
    const sm = window.matchMedia('(min-width: 640px)');
    const md = window.matchMedia('(min-width: 768px)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const xl = window.matchMedia('(min-width: 1280px)');

    const update = () => {
      if (xl.matches) setBreakpoint('xl');
      else if (lg.matches) setBreakpoint('lg');
      else if (md.matches) setBreakpoint('md');
      else setBreakpoint('sm');
    };

    update();

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return breakpoint;
}
