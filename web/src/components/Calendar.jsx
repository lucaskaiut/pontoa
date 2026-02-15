import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import moment from "moment";
import "moment/locale/pt-br";
import { parseUTCDate, now, formatTime } from "../utils/dateUtils";

moment.locale("pt-br");
moment.updateLocale("pt-br", {
  weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  weekdaysMin: ["D", "S", "T", "Q", "Q", "S", "S"],
  weekdays: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
  months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
  monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
});

const safeString = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return String(value);
  } catch {
    return "";
  }
};

const SafeRender = ({ children }) => {
  if (children === null || children === undefined) return null;
  if (
    typeof children === "string" ||
    typeof children === "number" ||
    typeof children === "boolean"
  ) {
    return <>{children}</>;
  }
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, idx) => (
          <SafeRender key={idx}>{child}</SafeRender>
        ))}
      </>
    );
  }
  if (React.isValidElement(children)) {
    return children;
  }
  return null;
};

export const Calendar = ({
  events = [],
  onSlotClick,
  storeHours = [],
  onEventClick,
  onEventDrop,
}) => {
  const safeEvents = Array.isArray(events) ? events : [];
  const safeStoreHours = Array.isArray(storeHours) ? storeHours : [];

  const [currentDate, setCurrentDate] = useState(() => {
    try {
      const date = now();
      return date.isValid() ? date : now();
    } catch {
      return now();
    }
  });
  const [isMobile, setIsMobile] = useState(false);
  const [view, setView] = useState("week");
  const scrollContainerRef = useRef(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (view !== "month" && view !== "week") {
      setHasInitialized(false);
      return;
    }

    if (hasInitialized || !safeEvents || safeEvents.length === 0) {
      return;
    }

    if (safeEvents.length >= 1) {
      try {
        let firstEventDate = null;
        
        safeEvents.forEach((event) => {
          if (!event || !event.start) return;
          try {
            const eventDate = parseUTCDate(event.start);
            if (!eventDate || !eventDate.isValid()) return;
            
            if (!firstEventDate || eventDate.isBefore(firstEventDate)) {
              firstEventDate = eventDate;
            }
          } catch {
            return;
          }
        });

        if (firstEventDate && firstEventDate.isValid()) {
          const today = now().startOf("day");
          const eventDay = firstEventDate.clone().startOf("day");
          
          if (eventDay.isAfter(today)) {
            if (view === "month") {
              setCurrentDate(firstEventDate.clone().startOf("month"));
            } else if (view === "week") {
              setCurrentDate(firstEventDate.clone().startOf("isoWeek"));
            }
            setHasInitialized(true);
          } else {
            setHasInitialized(true);
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar data do calendário:", error);
      }
    }
  }, [safeEvents, hasInitialized, view]);

  const getMinTime = useCallback(() => {
    try {
      if (
        !safeStoreHours ||
        !Array.isArray(safeStoreHours) ||
        safeStoreHours.length === 0
      ) {
        return { hour: 0, minute: 0 };
      }
      const firstHour = safeStoreHours[0];
      if (!firstHour || typeof firstHour.start_at !== "string") {
        return { hour: 0, minute: 0 };
      }
      const firstStart = firstHour.start_at.split(":");
      if (!firstStart || firstStart.length < 2) {
        return { hour: 0, minute: 0 };
      }
      const hour = parseInt(firstStart[0], 10) || 0;
      const minute = parseInt(firstStart[1], 10) || 0;
      return { hour, minute };
    } catch {
      return { hour: 0, minute: 0 };
    }
  }, [safeStoreHours]);

  const getMaxTime = useCallback(() => {
    try {
      if (
        !safeStoreHours ||
        !Array.isArray(safeStoreHours) ||
        safeStoreHours.length === 0
      ) {
        return { hour: 23, minute: 59 };
      }
      
      let maxHour = 0;
      let maxMinute = 0;
      
      safeStoreHours.forEach((hourItem) => {
        if (!hourItem || typeof hourItem.end_at !== "string") return;
        
        const endParts = hourItem.end_at.split(":");
        if (!endParts || endParts.length < 2) return;
        
        const hour = parseInt(endParts[0], 10);
        const minute = parseInt(endParts[1], 10);
        
        if (isNaN(hour) || isNaN(minute)) return;
        
        const totalMinutes = hour * 60 + minute;
        const maxTotalMinutes = maxHour * 60 + maxMinute;
        
        if (totalMinutes > maxTotalMinutes) {
          maxHour = hour;
          maxMinute = minute;
        }
      });
      
      if (maxHour === 0 && maxMinute === 0) {
        return { hour: 23, minute: 59 };
      }
      
      return { hour: maxHour, minute: maxMinute };
    } catch {
      return { hour: 23, minute: 59 };
    }
  }, [safeStoreHours]);

  const getAvailableDays = useCallback(() => {
    try {
      if (
        !safeStoreHours ||
        !Array.isArray(safeStoreHours) ||
        safeStoreHours.length === 0
      ) {
        return [0, 1, 2, 3, 4, 5, 6];
      }
      const days = new Set();
      safeStoreHours.forEach((hour) => {
        if (hour && typeof hour.days === "string" && hour.days) {
          hour.days.split(",").forEach((day) => {
            const dayNum = parseInt(day, 10);
            if (!isNaN(dayNum)) {
              days.add(dayNum);
            }
          });
        }
      });
      const result = Array.from(days).sort((a, b) => a - b);
      return result.length > 0 ? result : [0, 1, 2, 3, 4, 5, 6];
    } catch {
      return [0, 1, 2, 3, 4, 5, 6];
    }
  }, [safeStoreHours]);

  const minTime = getMinTime();
  const maxTime = getMaxTime();
  const availableDays = getAvailableDays();
  
  useEffect(() => {
    console.log('[Calendar] StoreHours:', safeStoreHours);
    console.log('[Calendar] MinTime:', minTime);
    console.log('[Calendar] MaxTime:', maxTime);
  }, [safeStoreHours, minTime, maxTime]);

  const getDaysInView = useMemo(() => {
      try {
        if (!currentDate || !currentDate.isValid()) {
          const today = now();
          if (view === "day") return [today.clone()];
          if (view === "week") {
            const startOfWeek = today.clone().startOf("isoWeek");
            return Array.from({ length: 7 }, (_, i) =>
              startOfWeek.clone().add(i, "days")
            );
          }
          const startOfMonth = today.clone().startOf("month");
          const startOfCalendar = startOfMonth.clone().startOf("isoWeek");
          const endOfMonth = today.clone().endOf("month");
          const endOfCalendar = endOfMonth.clone().endOf("isoWeek");
          const days = [];
          let day = startOfCalendar.clone();
          while (day.isSameOrBefore(endOfCalendar, "day")) {
            days.push(day.clone());
            day.add(1, "day");
          }
          return days;
        }
      if (view === "day") return [currentDate.clone()];
      if (view === "week") {
        const startOfWeek = currentDate.clone().startOf("isoWeek");
        return Array.from({ length: 7 }, (_, i) =>
          startOfWeek.clone().add(i, "days")
        );
      }
      const startOfMonth = currentDate.clone().startOf("month");
      const startOfCalendar = startOfMonth.clone().startOf("isoWeek");
      const endOfMonth = currentDate.clone().endOf("month");
      const endOfCalendar = endOfMonth.clone().endOf("isoWeek");
      const days = [];
      let day = startOfCalendar.clone();
      while (day.isSameOrBefore(endOfCalendar, "day")) {
        days.push(day.clone());
        day.add(1, "day");
      }
      return days;
    } catch {
      const today = now();
      return [today.clone()];
    }
  }, [currentDate, view]);

  const getTimeSlots = useMemo(() => {
    const slots = [];
    const startHour = minTime.hour;
    const endHour = maxTime.hour;
    const endMinute = maxTime.minute;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      let maxMin = 59;
      if (hour === endHour) {
        maxMin = endMinute;
        if (endMinute < 59 && endMinute % 15 !== 0) {
          maxMin = Math.ceil(endMinute / 15) * 15;
        }
      }
      
      for (let minute = 0; minute <= maxMin; minute += 15) {
        if (hour === endHour && minute > endMinute) {
          break;
        }
        slots.push({ hour, minute });
      }
    }
    
    return slots;
  }, [minTime, maxTime]);

  const getEventsForDay = useCallback(
    (day) => {
      if (!safeEvents || !Array.isArray(safeEvents)) return [];
      return safeEvents.filter((event) => {
        if (!event || !event.start) return false;
        try {
          const eventDate = parseUTCDate(event.start);
          if (!eventDate || !eventDate.isValid()) return false;
          return eventDate.isSame(day, "day");
        } catch {
          return false;
        }
      });
    },
    [safeEvents]
  );

  const getEventPosition = useCallback(
    (event) => {
      if (!event || !event.start || !event.end)
        return { top: "0%", height: "0%" };
      try {
        const eventStart = parseUTCDate(event.start);
        const eventEnd = parseUTCDate(event.end);
        if (!eventStart || !eventEnd || !eventStart.isValid() || !eventEnd.isValid())
          return { top: "0%", height: "0%" };
        const startMinutes = eventStart.hours() * 60 + eventStart.minutes();
        const endMinutes = eventEnd.hours() * 60 + eventEnd.minutes();
        const dayStartMinutes = minTime.hour * 60 + minTime.minute;
        const dayEndMinutes = maxTime.hour * 60 + maxTime.minute;
        const totalMinutes = dayEndMinutes - dayStartMinutes;
        if (totalMinutes <= 0) return { top: "0%", height: "0%" };
        const top = ((startMinutes - dayStartMinutes) / totalMinutes) * 100;
        const height = ((endMinutes - startMinutes) / totalMinutes) * 100;
        return {
          top: `${Math.max(0, top)}%`,
          height: `${Math.min(100, Math.max(0, height))}%`,
        };
      } catch {
        return { top: "0%", height: "0%" };
      }
    },
    [minTime, maxTime]
  );

  const eventsOverlap = useCallback((event1, event2) => {
    if (!event1 || !event2 || !event1.start || !event1.end || !event2.start || !event2.end) {
      return false;
    }
    try {
      const start1 = parseUTCDate(event1.start);
      const end1 = parseUTCDate(event1.end);
      const start2 = parseUTCDate(event2.start);
      const end2 = parseUTCDate(event2.end);
      
      if (!start1 || !end1 || !start2 || !end2) return false;
      
      
      return start1.isBefore(end2) && start2.isBefore(end1);
    } catch {
      return false;
    }
  }, []);

  const getOverlappingGroups = useCallback((events) => {
    if (!events || !Array.isArray(events) || events.length === 0) {
      return [];
    }
    
    const validEvents = events.filter(e => e && e.id && e.start && e.end);
    if (validEvents.length === 0) {
      return [];
    }
    
    const groups = [];
    const processed = new Set();
    
    validEvents.forEach((event) => {
      if (processed.has(event.id)) {
        return;
      }
      
      const group = [event];
      processed.add(event.id);
      let foundNew = true;
      
      while (foundNew) {
        foundNew = false;
        validEvents.forEach((otherEvent) => {
          if (processed.has(otherEvent.id)) {
            return;
          }
          
          const overlapsWithGroup = group.some(groupEvent => eventsOverlap(groupEvent, otherEvent));
          if (overlapsWithGroup) {
            group.push(otherEvent);
            processed.add(otherEvent.id);
            foundNew = true;
          }
        });
      }
      
      groups.push(group);
    });
    
    return groups;
  }, [eventsOverlap]);

  const getEventLayout = useCallback((event, allEvents) => {
    if (!event || !allEvents || !Array.isArray(allEvents)) {
      return { top: "0%", height: "0%", left: "0%", width: "100%" };
    }
    
    const position = getEventPosition(event);
    const overlappingGroups = getOverlappingGroups(allEvents);
    
    let left = "0%";
    let width = "100%";
    
    for (const group of overlappingGroups) {
      if (group.some(e => e.id === event.id)) {
        const groupSize = group.length;
        
        if (groupSize > 1) {
          const sortedGroup = [...group].sort((a, b) => {
            try {
            const startA = parseUTCDate(a.start);
            const startB = parseUTCDate(b.start);
            
            if (!startA || !startB || !startA.isValid() || !startB.isValid()) return 0;
              if (!startA.isValid() || !startB.isValid()) return 0;
              return startA.valueOf() - startB.valueOf();
            } catch {
              return 0;
            }
          });
          
          const eventIndex = sortedGroup.findIndex(e => e.id === event.id);
          
          width = `${100 / groupSize}%`;
          left = `${(eventIndex * 100) / groupSize}%`;
        }
        break;
      }
    }
    
    return {
      ...position,
      left,
      width,
    };
  }, [getEventPosition, getOverlappingGroups]);

  useEffect(() => {
    if (view !== "day" && view !== "week") return;
    if (!scrollContainerRef.current) return;

    const findFirstEvent = () => {
      let firstEvent = null;
      let firstEventTime = null;
      getDaysInView.forEach((day) => {
        const dayEvents = getEventsForDay(day);
        dayEvents.forEach((event) => {
          if (!event || !event.start) return;
          try {
            const eventStart = parseUTCDate(event.start);
            if (!eventStart || !eventStart.isValid()) return;
            if (!firstEventTime || eventStart.isBefore(firstEventTime)) {
              firstEventTime = eventStart;
              firstEvent = event;
            }
          } catch {}
        });
      });
      return firstEvent;
    };

    const scrollToFirstEvent = () => {
      const firstEvent = findFirstEvent();
      if (!firstEvent || !firstEvent.start) return;
      try {
        const eventStart = parseUTCDate(firstEvent.start);
        if (!eventStart || !eventStart.isValid()) return;
        const startMinutes = eventStart.hours() * 60 + eventStart.minutes();
        const dayStartMinutes = minTime.hour * 60 + minTime.minute;
        const dayEndMinutes = maxTime.hour * 60 + maxTime.minute;
        const totalMinutes = dayEndMinutes - dayStartMinutes;
        if (totalMinutes <= 0) return;
        const container = scrollContainerRef.current;
        if (!container) return;
        const headerHeight = 48;
        const calculateScroll = () => {
          const scrollHeight = container.scrollHeight || 0;
          const contentHeight = scrollHeight - headerHeight;
          const eventPosition =
            ((startMinutes - dayStartMinutes) / totalMinutes) * contentHeight;
          const scrollPosition = Math.max(0, eventPosition - headerHeight);
          return scrollPosition;
        };
        setTimeout(() => {
          if (container) container.scrollTop = calculateScroll();
        }, 150);
      } catch (error) {
        console.error("Erro ao fazer scroll para o primeiro evento:", error);
      }
    };

    scrollToFirstEvent();
  }, [view, getDaysInView, safeEvents, minTime, maxTime, getEventsForDay]);

  const handleDragStart = useCallback((e, event) => {
    if (!event || !event.id) return;
    e.dataTransfer.setData("eventId", String(event.id));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e, day, slot) => {
      e.preventDefault();
      e.stopPropagation();
      const eventId = e.dataTransfer.getData("eventId");
      if (!eventId) return;
      const event = safeEvents?.find((ev) => ev && ev.id === parseInt(eventId));
      if (!event || !event.start || !event.end) return;
      if (!onEventDrop) return;
      try {
        const newStart = day
          .clone()
          .hours(slot.hour)
          .minutes(slot.minute)
          .seconds(0)
          .milliseconds(0);
        if (!newStart.isValid()) return;
        const eventStart = parseUTCDate(event.start);
        const eventEnd = parseUTCDate(event.end);
        if (!eventStart || !eventEnd || !eventStart.isValid() || !eventEnd.isValid()) return;
        const duration = eventEnd.diff(eventStart, "minutes");
        const newEnd = newStart.clone().add(duration, "minutes");
        if (!newEnd.isValid()) return;
        onEventDrop(parseInt(eventId), newStart.toDate(), newEnd.toDate());
      } catch (error) {
        console.error("Erro ao processar drop:", error);
      }
    },
    [safeEvents, onEventDrop]
  );

  const navigateDate = useCallback(
    (direction) => {
      if (view === "day")
        setCurrentDate((prev) => prev.clone().add(direction, "days"));
      else if (view === "week")
        setCurrentDate((prev) => prev.clone().add(direction, "weeks"));
      else setCurrentDate((prev) => prev.clone().add(direction, "months"));
    },
    [view]
  );

  const goToToday = useCallback(() => setCurrentDate(now()), []);

  const formatDateRange = () => {
    try {
      if (!currentDate || !currentDate.isValid()) return "";
      if (view === "day") return currentDate.locale("pt-br").format("DD [de] MMMM [de] YYYY");
      if (view === "week") {
        const start = currentDate.clone().startOf("isoWeek");
        const end = currentDate.clone().endOf("isoWeek");
        if (start.isValid() && end.isValid())
          return `${start.locale("pt-br").format("DD/MM")} - ${end.locale("pt-br").format("DD/MM/YYYY")}`;
        return "";
      }
      return currentDate.locale("pt-br").format("MMMM [de] YYYY");
    } catch {
      return "";
    }
  };

  const renderTimeColumn = () => {
    return (
      <div className="w-16 md:w-20 shrink-0 border-r border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-hover sticky left-0 z-20">
        <div className="h-10 md:h-12 border-b border-gray-200 dark:border-dark-border" />
        <div className="overflow-hidden">
          {getTimeSlots.map((slot, idx) => (
            <div
              key={idx}
              className={`h-12 md:h-16 flex items-start justify-end pr-1 md:pr-2 pt-0.5 md:pt-1 ${
                slot.minute === 0
                  ? "border-b-2 border-gray-300 dark:border-dark-border"
                  : "border-b border-gray-200 dark:border-dark-border"
              }`}
            >
              <span className="text-[10px] md:text-xs text-gray-600 dark:text-dark-text-secondary font-medium">
                {(() => {
                  try {
                    const hour = String(slot.hour).padStart(2, '0');
                    const minute = String(slot.minute).padStart(2, '0');
                    return `${hour}:${minute}`;
                  } catch {
                    return "";
                  }
                })()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayColumn = (day, index) => {
    const dayEvents = getEventsForDay(day);
    const isAvailable = availableDays.includes(day.day());
    const isToday = day.isSame(now(), "day");

    return (
      <div
        key={
          day && day.isValid() ? day.format("YYYY-MM-DD") : `day-col-${index}`
        }
        className={`shrink-0 min-w-[120px] flex-1 border-r border-gray-200 dark:border-dark-border last:border-r-0 ${
          !isAvailable ? "bg-gray-50 dark:bg-dark-surface" : "bg-white dark:bg-dark-surface"
        }`}
      >
        <div
          className={`h-10 md:h-12 border-b border-gray-200 dark:border-dark-border flex items-center justify-center font-semibold sticky top-0 z-10 ${
            isToday ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" : "bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text"
          }`}
        >
          <div className="text-center">
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-dark-text-secondary uppercase">
              {day.isValid() ? day.locale("pt-br").format("ddd") : ""}
            </div>
            <div
              className={`text-sm md:text-lg ${
                isToday ? "text-purple-700 font-bold" : ""
              }`}
            >
              {day.isValid() ? day.format("D") : ""}
            </div>
          </div>
        </div>

        <div
          className="relative calendar-day-content"
          style={{ minHeight: `${String(getTimeSlots.length * 64)}px` }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const scrollContainer = e.currentTarget.closest(
              ".calendar-scroll-container"
            );
            const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
            const headerHeight = 48;
            const y = e.clientY - rect.top + scrollTop - headerHeight;
            const height = rect.height - headerHeight;
            const totalMinutes =
              (maxTime.hour - minTime.hour) * 60 +
              (maxTime.minute - minTime.minute);
            const minutesFromTop = Math.max(0, (y / height) * totalMinutes);
            const slotHour = Math.min(
              maxTime.hour,
              Math.floor(minutesFromTop / 60) + minTime.hour
            );
            const slotMinute = Math.floor((minutesFromTop % 60) / 15) * 15;
            handleDrop(e, day, { hour: slotHour, minute: slotMinute });
          }}
        >
          {dayEvents
            .map((event) => {
              if (!event || !event.id) return null;
              const layout = getEventLayout(event, dayEvents);
              const safeLayout =
                layout && typeof layout === "object"
                  ? {
                      top: String(layout.top || "0%"),
                      height: String(layout.height || "0%"),
                      left: String(layout.left || "0%"),
                      width: String(layout.width || "100%"),
                    }
                  : { top: "0%", height: "0%", left: "0%", width: "100%" };
              
              const leftPercent = parseFloat(safeLayout.left.replace("%", ""));
              const widthPercent = parseFloat(safeLayout.width.replace("%", ""));
              const isFirst = leftPercent === 0;
              const isLast = leftPercent + widthPercent >= 99.9;
              
              const gap = 2;
              const sideMargin = 4;
              
              let finalLeft = safeLayout.left;
              let finalWidth = safeLayout.width;
              
              if (!isFirst && !isLast) {
                finalLeft = `calc(${safeLayout.left} + ${gap / 2}px)`;
                finalWidth = `calc(${safeLayout.width} - ${gap}px)`;
              } else if (isFirst && !isLast) {
                finalLeft = `${sideMargin}px`;
                finalWidth = `calc(${safeLayout.width} - ${sideMargin + gap / 2}px)`;
              } else if (!isFirst && isLast) {
                finalLeft = `calc(${safeLayout.left} + ${gap / 2}px)`;
                finalWidth = `calc(${safeLayout.width} - ${sideMargin + gap / 2}px)`;
              } else {
                finalLeft = `${sideMargin}px`;
                finalWidth = `calc(100% - ${sideMargin * 2}px)`;
              }
              
              return (
                <div
                  key={String(event.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, event)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEventClick && event.id != null) {
                      const eventId =
                        typeof event.id === "number"
                          ? event.id
                          : parseInt(String(event.id), 10);
                      if (!isNaN(eventId)) onEventClick(eventId);
                    }
                  }}
                  className="absolute bg-primary text-white p-1 md:p-2 rounded-md shadow-sm cursor-move hover:brightness-90 transition-all z-10"
                  style={{
                    top: safeLayout.top,
                    height: safeLayout.height,
                    left: finalLeft,
                    width: finalWidth,
                  }}
                >
                  <div className="font-semibold text-[10px] md:text-sm truncate">
                    {String(event.title || "")}
                  </div>
                  <div className="text-[9px] md:text-xs opacity-90 mt-0.5">
                    {(() => {
                      try {
                        const start = parseUTCDate(event.start);
                        const end = parseUTCDate(event.end);
                        if (start && end && start.isValid() && end.isValid())
                          return `${formatTime(start.toISOString())} - ${formatTime(end.toISOString())}`;
                        return "";
                      } catch {
                        return "";
                      }
                    })()}
                  </div>
                </div>
              );
            })
            .filter(Boolean)}

          {getTimeSlots.map((slot, idx) => {
            const isHourMark = slot.minute === 0;
            return (
              <div
                key={idx}
                className={`h-12 md:h-16 hover:bg-gray-50 dark:hover:bg-dark-surface-hover cursor-pointer transition-colors ${
                  isHourMark
                    ? "border-b-2 border-gray-300 dark:border-dark-border"
                    : "border-b border-gray-200 dark:border-dark-border"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDrop(e, day, slot);
                }}
                onClick={() => {
                  if (onSlotClick) {
                    const slotDate = day
                      .clone()
                      .hours(slot.hour)
                      .minutes(slot.minute)
                      .seconds(0)
                      .milliseconds(0);
                    onSlotClick({
                      start: slotDate.toDate(),
                      end: slotDate.clone().add(15, "minutes").toDate(),
                    });
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const weekDaysLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const renderMonthView = () => {
    return (
      <div className="grid grid-cols-7 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-surface">
        {weekDaysLabels.map((d) => (
          <div
            key={d}
            className="border-b border-r border-gray-200 dark:border-dark-border p-1 md:p-3 bg-gray-50 dark:bg-dark-surface-hover font-semibold text-center text-xs md:text-sm text-gray-700 dark:text-dark-text last:border-r-0"
          >
            {d}
          </div>
        ))}

        {getDaysInView
          .filter((day) => day && day.isValid())
          .map((day) => {
            if (!day || !day.isValid()) return null;
            const dayEvents = getEventsForDay(day);
            const isAvailable = availableDays.includes(day.day());
            const isToday = day.isSame(now(), "day");
            const isCurrentMonth = day.isSame(currentDate, "month");
            return (
              <div
                key={String(day.format("YYYY-MM-DD") || "invalid-day")}
                className={`min-h-[60px] md:min-h-[120px] border-b border-r border-gray-200 dark:border-dark-border p-1 md:p-2 last:border-r-0 ${
                  !isAvailable ? "bg-gray-50 dark:bg-dark-surface" : "bg-white dark:bg-dark-surface"
                } ${!isCurrentMonth ? "opacity-40" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const eventId = e.dataTransfer.getData("eventId");
                  if (!eventId) return;
                  const event = safeEvents.find(
                    (ev) => ev.id === parseInt(eventId)
                  );
                  if (!event || !onEventDrop) return;
                  const newStart = day
                    .clone()
                    .hours(parseUTCDate(event.start)?.hours() || 0)
                    .minutes(parseUTCDate(event.start)?.minutes() || 0)
                    .seconds(0)
                    .milliseconds(0);
                  const eventStart = parseUTCDate(event.start);
                  const eventEnd = parseUTCDate(event.end);
                  if (!eventStart || !eventEnd || !eventStart.isValid() || !eventEnd.isValid()) return;
                  const duration = eventEnd.diff(eventStart, "minutes");
                  const newEnd = newStart.clone().add(duration, "minutes");
                  onEventDrop(
                    parseInt(eventId),
                    newStart.toDate(),
                    newEnd.toDate()
                  );
                }}
              >
                <div
                  className={`text-xs md:text-sm font-semibold mb-0.5 md:mb-1 ${
                    isToday
                      ? "bg-purple-600 dark:bg-purple-500 text-white rounded-full w-5 h-5 md:w-7 md:h-7 flex items-center justify-center text-[10px] md:text-sm"
                      : "text-gray-700 dark:text-dark-text"
                  }`}
                >
                  {day.isValid() ? day.format("D") : ""}
                </div>
                <div className="space-y-0.5 md:space-y-1">
                  {dayEvents.slice(0, isMobile ? 1 : 3).map((event) => {
                    if (!event || !event.id) return null;
                    return (
                      <div
                        key={String(event.id)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEventClick) onEventClick(event.id);
                        }}
                        className="bg-primary text-white p-0.5 md:p-1.5 rounded text-[9px] md:text-xs cursor-move hover:brightness-90 transition-colors"
                      >
                        <div className="font-semibold truncate">
                          {String(event.title || "")}
                        </div>
                        {!isMobile && (
                          <div className="text-xs opacity-90">
                            {(() => {
                              try {
                                const start = parseUTCDate(event.start);
                                return start && start.isValid()
                                  ? formatTime(start.toISOString())
                                  : "";
                              } catch {
                                return "";
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {dayEvents.length > (isMobile ? 1 : 3) && (
                    <div className="text-[9px] md:text-xs text-gray-500 dark:text-dark-text-secondary font-medium">
                      +{String(dayEvents.length - (isMobile ? 1 : 3))} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="p-2 md:p-6 bg-gray-50 dark:bg-dark-bg rounded-lg w-full overflow-hidden">
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 dark:bg-blue-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm md:text-base"
            >
              Hoje
            </button>
            <div className="flex items-center gap-1 md:gap-2 flex-1">
              <button
                onClick={() => navigateDate(-1)}
                className="px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-white dark:hover:bg-dark-surface-hover hover:border-purple-300 dark:hover:border-blue-400 transition-colors font-medium bg-white dark:bg-dark-surface shadow-sm text-xs md:text-sm"
              >
                ←
              </button>
              <button
                onClick={() => navigateDate(1)}
                className="px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-white dark:hover:bg-dark-surface-hover hover:border-purple-300 dark:hover:border-blue-400 transition-colors font-medium bg-white dark:bg-dark-surface shadow-sm text-xs md:text-sm"
              >
                →
              </button>
            </div>
          </div>
          <div className="text-base md:text-xl font-bold text-gray-800 dark:text-dark-text text-center md:text-left">
            {String(formatDateRange() || "")}
          </div>
        </div>

        <div className="flex gap-1 md:gap-2 bg-white dark:bg-dark-surface p-0.5 md:p-1 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border">
          <button
            onClick={() => setView("day")}
            className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md transition-all font-medium text-xs md:text-sm ${
              view === "day"
                ? "bg-purple-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 shadow-sm"
                : "text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover"
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md transition-all font-medium text-xs md:text-sm ${
              view === "week"
                ? "bg-purple-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 shadow-sm"
                : "text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setView("month")}
            className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md transition-all font-medium text-xs md:text-sm ${
              view === "month"
                ? "bg-purple-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 shadow-sm"
                : "text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover"
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {view === "month" ? (
        renderMonthView()
      ) : (
        <div className="border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface shadow-sm w-full overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="calendar-scroll-container overflow-auto"
            style={{
              height: isMobile ? "500px" : "600px",
            }}
          >
            <div className="flex min-w-max">
              {renderTimeColumn()}
              <div className="flex flex-1">
                {getDaysInView
                  .filter((day) => day && day.isValid())
                  .map((day, index) => renderDayColumn(day, index))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
