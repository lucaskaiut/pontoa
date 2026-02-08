import { useState, useRef, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../hooks/useAuth';
import { Icon } from './ui/atoms';
import { mdiChevronDown, mdiOfficeBuilding, mdiCheck } from '@mdi/js';
import classNames from 'classnames';

export function CompanySelector() {
  const { user } = useAuth();
  const { selectedCompany, availableCompanies, selectCompany, isLoadingCompanies, isSuperadmin, userCompanyId } = useCompany();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isSuperadmin || isLoadingCompanies || availableCompanies.length <= 1) {
    return null;
  }

  const isUserCompany = selectedCompany?.id === userCompanyId;

  const handleSelectCompany = (companyId) => {
    selectCompany(companyId);
    setIsOpen(false);
  };

  return (
    <div className="relative px-3 mt-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 w-full",
          "text-sm font-medium",
          "bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border",
          "hover:bg-gray-50 dark:hover:bg-dark-surface-hover",
          "text-gray-700 dark:text-dark-text-secondary"
        )}
        disabled={isLoadingCompanies}
      >
        <Icon path={mdiOfficeBuilding} size={1} />
        <span className="flex-1 text-left truncate">
          {selectedCompany?.name || 'Selecionar empresa'}
        </span>
        {isUserCompany && (
          <span className="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            Minha
          </span>
        )}
        <Icon 
          path={mdiChevronDown} 
          size={1} 
          className={classNames("transition-transform", {
            "rotate-180": isOpen
          })}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {availableCompanies.map((company) => {
            const isSelected = company.id === selectedCompany?.id;
            const isUserOwnCompany = company.id === userCompanyId;

            return (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company.id)}
                className={classNames(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-gray-50 dark:hover:bg-dark-surface-hover",
                  {
                    "bg-primary-50 dark:bg-primary-900/20": isSelected,
                  }
                )}
              >
                <Icon 
                  path={mdiOfficeBuilding} 
                  size={1} 
                  className={classNames({
                    "text-primary-600 dark:text-primary-400": isSelected,
                    "text-gray-400 dark:text-gray-500": !isSelected,
                  })}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={classNames(
                      "text-sm font-medium truncate",
                      {
                        "text-primary-700 dark:text-primary-300": isSelected,
                        "text-gray-700 dark:text-dark-text-secondary": !isSelected,
                      }
                    )}>
                      {company.name}
                    </span>
                    {isUserOwnCompany && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                        Minha
                      </span>
                    )}
                  </div>
                  {company.email && (
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary truncate mt-0.5">
                      {company.email}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <Icon 
                    path={mdiCheck} 
                    size={1} 
                    className="text-primary-600 dark:text-primary-400 shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

