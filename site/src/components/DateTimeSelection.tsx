import { useEffect, useState, useRef } from "react";
import { SchedulesService } from "../services/SchedulesService";
import { CartService } from "../services/CartService";
import type { Service, Collaborator, ScheduleHours } from "../types";
import type { CartResponse } from "../services/CartService";

interface DateTimeSelectionProps {
  service: Service;
  collaborator: Collaborator;
  onSelect: (date: string, time: string) => void;
  selectedDate: string | null;
  selectedTime: string | null;
  onCartUpdate?: () => void;
}

export function DateTimeSelection({
  service,
  collaborator,
  onSelect,
  selectedDate,
  selectedTime,
  onCartUpdate,
}: DateTimeSelectionProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cart, setCart] = useState<CartResponse["data"] | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    loadAvailableHours();
    loadCart();
  }, [service.id]);

  async function loadCart() {
    try {
      const response = await CartService.getCart();
      setCart(response.data);
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    }
  }

  async function loadAvailableHours() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day} ${hours}:${minutes}`;
      const data = await SchedulesService.getAvailableHours(service.id, dateStr, collaborator.id);
      setScheduleData(data);

      const dates = Object.keys(data.schedule);
      if (dates.length > 0) {
        setActiveDate(selectedDate || dates[0]);
      }
      setHasMore(dates.length >= 7);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreDays() {
    if (!scheduleData || isLoadingMoreRef.current || !hasMore) return;
    
    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const currentDates = Object.keys(scheduleData.schedule).sort();
      const lastDate = currentDates[currentDates.length - 1];
      
      const nextDate = new Date(lastDate + "T12:00:00");
      nextDate.setDate(nextDate.getDate() + 1);
      const year = nextDate.getFullYear();
      const month = String(nextDate.getMonth() + 1).padStart(2, '0');
      const day = String(nextDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day} 00:00`;
      
      const newData = await SchedulesService.getAvailableHours(service.id, dateStr, collaborator.id);
      const newDates = Object.keys(newData.schedule);
      
      if (newDates.length > 0) {
        setScheduleData((prev) => {
          if (!prev) return newData;
          return {
            ...prev,
            schedule: {
              ...prev.schedule,
              ...newData.schedule,
            },
          };
        });
        setHasMore(newDates.length >= 7);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erro ao carregar mais dias:", error);
    } finally {
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }

  function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr + "T12:00:00");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Hoje";
    if (isTomorrow) return "Amanhã";

    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  function formatDayNumber(dateStr: string): string {
    const date = new Date(dateStr + "T12:00:00");
    return date.getDate().toString().padStart(2, "0");
  }

  function formatWeekday(dateStr: string): string {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  }

  function formatMonth(dateStr: string): string {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  }

  function handleTimeSelect(time: string) {
    if (activeDate) {
      onSelect(activeDate, time);
    }
  }

  function checkScrollButtons() {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
      setCanScrollRight(!isAtEnd);
      
      const nearEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 100;
      if (nearEnd && hasMore && !loadingMore) {
        loadMoreDays();
      }
    }
  }

  function scrollDates(direction: "left" | "right") {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
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
  }, [scheduleData]);

  function handleMouseDown(e: React.MouseEvent) {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeftStart(container.scrollLeft);
    container.style.cursor = "grabbing";
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    
    if (Math.abs(x - startX) > 5) {
      setHasDragged(true);
    }
    
    container.scrollLeft = scrollLeftStart - walk;
  }

  function handleMouseUp() {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = "grab";
    }
  }

  function handleMouseLeave() {
    if (isDragging) {
      setIsDragging(false);
      const container = scrollContainerRef.current;
      if (container) {
        container.style.cursor = "grab";
      }
    }
  }

  function handleDateClick(date: string) {
    if (hasDragged) return;
    setActiveDate(date);
    if (selectedDate !== date) {
      onSelect(date, "");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!scheduleData || Object.keys(scheduleData.schedule).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-text-secondary">Nenhum horário disponível no momento</p>
      </div>
    );
  }

  const availableDates = Object.keys(scheduleData.schedule).sort();
  const cartSchedulingTimes = CartService.getCartSchedulingTimes(cart);
  
  const availableTimes = activeDate
    ? (scheduleData.schedule[activeDate]?.[collaborator.id.toString()] || []).filter((time) => {
        const userId = collaborator.id.toString();
        const dateKey = activeDate;
        const cartTimes = cartSchedulingTimes[dateKey]?.[userId] || [];
        return !cartTimes.includes(time);
      })
    : [];

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-5">Escolha a Data e Horário</h2>

      <div className="mb-5">
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Data</h3>
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scrollDates("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-dark/90 hover:bg-primary rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onScroll={checkScrollButtons}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1 cursor-grab select-none"
          >
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                className={`
                  shrink-0 flex flex-col items-center px-4 py-3 rounded-xl min-w-[65px] transition-all duration-300
                  ${activeDate === date
                    ? "bg-primary text-white"
                    : "bg-accent-soft text-text-secondary hover:bg-primary/10"
                  }
                `}
              >
                <span className="text-[10px] uppercase">{formatWeekday(date)}</span>
                <span className="text-xl font-bold">{formatDayNumber(date)}</span>
                <span className="text-[10px] uppercase mt-0.5">{formatMonth(date)}</span>
              </button>
            ))}
            
            {loadingMore && (
              <div className="shrink-0 flex items-center justify-center px-4 py-3 min-w-[65px]">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scrollDates("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-dark/90 hover:bg-primary rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
          Horários disponíveis {activeDate && `- ${formatDateLabel(activeDate)}`}
        </h3>
        
        {availableTimes.length === 0 ? (
          <p className="text-text-secondary text-center py-6">
            Nenhum horário disponível para esta data
          </p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`
                  py-2.5 px-2 rounded-lg text-center text-sm font-medium transition-all duration-300
                  ${selectedDate === activeDate && selectedTime === time
                    ? "bg-primary text-white"
                    : "bg-accent-soft text-text-secondary hover:bg-primary/10 hover:text-text-primary"
                  }
                `}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

