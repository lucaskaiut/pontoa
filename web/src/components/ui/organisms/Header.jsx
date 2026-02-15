import { Avatar } from "../atoms";
import { Icon } from "../atoms";
import { mdiChevronDown } from "@mdi/js";
import { useAuth } from "../../../hooks/useAuth";
import classNames from "classnames";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user || !user.name) {
    return null;
  }

  const userName = typeof user.name === "string" ? user.name : String(user.name || "");

  return (
    <header className="flex justify-end items-center w-full bg-white dark:bg-dark-surface h-16 border-b border-gray-200 dark:border-dark-border px-6">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={classNames(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
            "hover:bg-gray-50 dark:hover:bg-dark-surface-hover",
            {
              "bg-gray-50 dark:bg-dark-surface-hover": isDropdownOpen,
            }
          )}
        >
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
              {userName}
            </span>
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
              Plano Gold
            </span>
          </div>
          <Avatar src={user?.avatar} name={userName} size="sm" />
          <Icon
            path={mdiChevronDown}
            size={1}
            className={classNames(
              "text-gray-500 dark:text-gray-400 transition-transform duration-200",
              {
                "rotate-180": isDropdownOpen,
              }
            )}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-2 z-50 animate-fade-in">
            <a
              href="/configuracoes"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
            >
              Configurações
            </a>
            <a
              href="/perfil"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
            >
              Meu Perfil
            </a>
          </div>
        )}
      </div>
    </header>
  );
}

