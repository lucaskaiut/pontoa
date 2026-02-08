import React from "react";
import classNames from "classnames";
import { UserScheduleItem } from "./UserScheduleItem";
import { UserScheduleFormValue, Day, Service } from "../types";

interface UserSchedulesFieldProps {
  value: UserScheduleFormValue[];
  onChange: (schedules: UserScheduleFormValue[]) => void;
  className?: string;
  error?: string;
  days: Day[];
  services: Service[];
}

export function UserSchedulesField({
  value,
  onChange,
  className,
  error,
  days,
  services,
}: UserSchedulesFieldProps) {
  const schedules = Array.isArray(value) ? value : [];

  const handleAddSchedule = () => {
    const newSchedules = [
      ...schedules,
      {
        days: [],
        start_at: "",
        end_at: "",
        services: [],
      }
    ];
    onChange(newSchedules);
  };

  const handleScheduleChange = (index: number, fieldName: keyof UserScheduleFormValue, fieldValue: any) => {
    const newSchedules = [...schedules];
    if (!newSchedules[index]) return;
    newSchedules[index] = {
      ...newSchedules[index],
      [fieldName]: fieldValue
    };
    onChange(newSchedules);
  };

  const handleScheduleRemove = (index: number) => {
    const newSchedules = schedules.filter((_: any, i: number) => i !== index);
    onChange(newSchedules);
  };

  const handleScheduleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSchedules = [...schedules];
    if (!newSchedules[index] || !newSchedules[index - 1]) return;
    [newSchedules[index - 1], newSchedules[index]] = [newSchedules[index], newSchedules[index - 1]];
    onChange(newSchedules);
  };

  const handleScheduleMoveDown = (index: number) => {
    const newSchedules = [...schedules];
    if (index >= newSchedules.length - 1) return;
    if (!newSchedules[index] || !newSchedules[index + 1]) return;
    [newSchedules[index], newSchedules[index + 1]] = [newSchedules[index + 1], newSchedules[index]];
    onChange(newSchedules);
  };

  return (
    <div className={classNames("w-full", className)}>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">
          Horários de Trabalho
        </label>
        <button
          type="button"
          onClick={handleAddSchedule}
          className="bg-primary dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 dark:hover:opacity-80 transition-colors"
        >
          + Adicionar Horário
        </button>
      </div>
      {schedules.length > 0 ? (
        <div className="space-y-4">
          {schedules.map((schedule: UserScheduleFormValue, index: number) => (
            <UserScheduleItem
              key={index}
              schedule={schedule}
              index={index}
              days={days}
              services={services}
              onChange={handleScheduleChange}
              onRemove={handleScheduleRemove}
              onMoveUp={handleScheduleMoveUp}
              onMoveDown={handleScheduleMoveDown}
              canMoveUp={index > 0}
              canMoveDown={index < schedules.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg text-gray-500 dark:text-dark-text-secondary">
          <p>Nenhum horário cadastrado</p>
          <p className="text-sm mt-1">Clique em "Adicionar Horário" para começar</p>
        </div>
      )}
      {error && <span className="text-danger text-sm mt-1">{error}</span>}
    </div>
  );
}

