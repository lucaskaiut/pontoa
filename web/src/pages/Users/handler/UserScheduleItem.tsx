import React, { useState } from "react";
import { Icon } from "@mdi/react";
import { mdiDelete, mdiChevronDown, mdiChevronUp } from "@mdi/js";
import Multiselect from "multiselect-react-dropdown";
import { UserScheduleFormValue, Day, Service } from "../types";

interface UserScheduleItemProps {
  schedule: UserScheduleFormValue;
  index: number;
  days: Day[];
  services: Service[];
  onChange: (index: number, field: keyof UserScheduleFormValue, value: any) => void;
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const getMultiselectStyle = (isDark: boolean) => ({
  chips: { background: isDark ? '#3b82f6' : '#7b2cbf' },
  searchBox: { 
    border: isDark ? '1px solid #334155' : '1px solid #d1d5db', 
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: isDark ? '#1e293b' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#6b7280'
  },
  optionContainer: { 
    borderRadius: '0.375rem',
    background: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '1px solid #334155' : '1px solid #d1d5db'
  },
  option: { 
    color: isDark ? '#e2e8f0' : '#6b7280',
    background: isDark ? '#1e293b' : '#ffffff'
  },
  highlightOption: {
    background: isDark ? '#3b82f6' : '#7b2cbf'
  }
});

export function UserScheduleItem({
  schedule,
  index,
  days,
  services,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: UserScheduleItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');
  const multiselectStyle = getMultiselectStyle(isDark);
  
  const selectedDays = days.filter(day => 
    schedule.days.some(d => d.id === day.id)
  );

  const handleDaysChange = (selectedList: Day[]) => {
    onChange(index, 'days', selectedList);
  };

  const handleServicesChange = (selectedList: Service[]) => {
    onChange(index, 'services', selectedList);
  };
  
  // Obter uma string resumida dos dias selecionados
  const getDaysSummary = () => {
    if (schedule.days.length === 0) return "";
    if (schedule.days.length === days.length) return "Todos os dias";
    if (schedule.days.length === 1) return schedule.days[0].short;
    if (schedule.days.length <= 3) {
      return schedule.days.map(d => d.short).join(", ");
    }
    return `${schedule.days.length} dias`;
  };
  
  // Obter resumo do horário
  const getTimeSummary = () => {
    if (!schedule.start_at || !schedule.end_at) return "";
    return `${schedule.start_at} - ${schedule.end_at}`;
  };

  return (
    <div className="border border-gray-300 dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-surface">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Icon 
            path={isExpanded ? mdiChevronUp : mdiChevronDown} 
            size={1.2} 
            className="text-gray-600 dark:text-dark-text-secondary"
          />
          <div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text">
              Horário {index + 1}
            </h4>
            {!isExpanded && (getDaysSummary() || getTimeSummary()) && (
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
                {[getDaysSummary(), getTimeSummary()].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onMoveUp && (
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={!canMoveUp}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mover para cima"
            >
              <Icon path={mdiChevronUp} size={1} className="text-gray-600 dark:text-dark-text-secondary" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={!canMoveDown}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mover para baixo"
            >
              <Icon path={mdiChevronDown} size={1} className="text-gray-600 dark:text-dark-text-secondary" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            title="Remover horário"
          >
            <Icon path={mdiDelete} size={1} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-hover">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Dias da Semana <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => {
                  const isSelected = schedule.days.some(d => d.id === day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        const newDays = isSelected
                          ? schedule.days.filter(d => d.id !== day.id)
                          : [...schedule.days, day];
                        onChange(index, 'days', newDays);
                      }}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary dark:bg-blue-600 text-white'
                          : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text border border-gray-300 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface-hover'
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Horário de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={schedule.start_at || ""}
                onChange={(e) => onChange(index, 'start_at', e.target.value)}
                className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Horário de Término <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={schedule.end_at || ""}
                onChange={(e) => onChange(index, 'end_at', e.target.value)}
                className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Serviços <span className="text-red-500">*</span>
              </label>
              {services && Array.isArray(services) && services.length > 0 ? (
                <Multiselect
                  options={services}
                  selectedValues={schedule.services || []}
                  onSelect={handleServicesChange}
                  onRemove={handleServicesChange}
                  displayValue="name"
                  placeholder="Selecione os serviços disponíveis neste horário"
                  emptyRecordMsg="Não há mais serviços"
                  style={multiselectStyle}
                  avoidHighlightFirstOption
                />
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md py-3 px-4 text-yellow-800 dark:text-yellow-300 text-sm">
                  <p>Você precisa cadastrar serviços para o usuário antes de associá-los aos horários.</p>
                  <p className="mt-1">Adicione serviços na seção "Serviços do Usuário" acima.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

