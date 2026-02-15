import { useState, useRef, useEffect } from "react";

export function SwipeableListItem({ children, onDelete, className = "", showHint = false }) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasShownHint, setHasShownHint] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const itemRef = useRef(null);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    if (diff > 0 && diff <= 100) {
      setOffset(diff);
    } else if (diff < 0) {
      setOffset(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (offset > 50) {
      setOffset(100);
    } else {
      setOffset(0);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (itemRef.current && !itemRef.current.contains(e.target)) {
        setOffset(0);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showHint && !hasShownHint && window.innerWidth < 768) {
      const hintTimer = setTimeout(() => {
        setOffset(70);
        const resetTimer = setTimeout(() => {
          setOffset(0);
          setHasShownHint(true);
        }, 1000);
        return () => clearTimeout(resetTimer);
      }, 500);
      
      return () => clearTimeout(hintTimer);
    }
  }, [showHint, hasShownHint]);

  return (
    <div ref={itemRef} className="relative overflow-hidden">
      <div
        className={`relative z-10 ${isDragging ? "" : "transition-transform duration-300"} ${className}`}
        style={{
          transform: `translateX(-${offset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
        
        <button
          onClick={handleDeleteClick}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-red-100 rounded-lg transition-all group z-20"
          aria-label="Excluir"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div
        className="md:hidden absolute right-0 top-0 h-full flex items-center justify-center bg-red-500 rounded-r-lg"
        style={{ width: "100px", zIndex: 1 }}
      >
        <button
          onClick={handleDeleteClick}
          className="w-full h-full flex items-center justify-center"
          aria-label="Excluir"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

