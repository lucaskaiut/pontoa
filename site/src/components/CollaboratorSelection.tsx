import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { Collaborator } from "../types";

interface CollaboratorSelectionProps {
  collaborators: Collaborator[];
  onSelect: (collaborator: Collaborator) => void;
  selectedCollaborator: Collaborator | null;
}

export function CollaboratorSelection({ collaborators, onSelect, selectedCollaborator }: CollaboratorSelectionProps) {
  const navigate = useNavigate();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function checkScrollButtons() {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
      setCanScrollRight(!isAtEnd);
    }
  }

  function scrollCollaborators(direction: "left" | "right") {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [collaborators]);

  if (collaborators.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-text-secondary">Nenhum profissional disponível</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-5">Escolha o Profissional</h2>
      
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scrollCollaborators("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-dark/90 hover:bg-primary rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="relative shrink-0 w-64 h-full"
            >
              <button
                onClick={() => onSelect(collaborator)}
                className={`
                  group relative w-full h-full p-6 rounded-xl text-center transition-all duration-300 flex flex-col items-center
                  ${selectedCollaborator?.id === collaborator.id
                    ? "bg-primary/20 border-2 border-primary"
                    : "bg-surface border-2 border-transparent hover:bg-primary/10 hover:border-primary/50"
                  }
                `}
              >
                <div className="w-full mx-2 mb-4 aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shrink-0">
                  {collaborator.image ? (
                    <img
                      src={collaborator.image}
                      alt={collaborator.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {getInitials(collaborator.name)}
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors mb-2 shrink-0">
                  {collaborator.name}
                </h3>
                
                <div className="flex-1 flex items-start min-h-12">
                  {collaborator.description ? (
                    <div 
                      className="text-text-secondary text-sm text-center line-clamp-2 prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: collaborator.description }}
                    />
                  ) : (
                    <div className="text-text-secondary text-sm text-center line-clamp-2" />
                  )}
                </div>
                
                {selectedCollaborator?.id === collaborator.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
              
              {collaborator.url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/${collaborator.url}`);
                  }}
                  className="absolute top-2 left-2 w-7 h-7 bg-accent-soft hover:bg-primary/10 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-all duration-200 shadow-sm z-10"
                  title="Ver perfil do profissional"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollCollaborators("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-dark/90 hover:bg-primary rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
