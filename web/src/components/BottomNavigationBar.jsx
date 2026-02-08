import { Icon } from "@mdi/react";
import { Link, useLocation } from "react-router-dom";
import {
  mdiAccountMultiple,
  mdiCalendarCheck,
  mdiCog,
  mdiMenu,
} from "@mdi/js";

export function BottomNavigationBar({ onMenuClick }) {
  const location = useLocation();

  const navItems = [
    {
      icon: mdiAccountMultiple,
      url: "/clientes",
    },
    {
      icon: mdiCalendarCheck,
      url: "/agendamentos",
      isHighlighted: true,
    },
    {
      icon: mdiCog,
      url: "/configuracoes",
    },
  ];

  const isActive = (url) => {
    return location.pathname === url;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border shadow-2xl">
      <div className="flex items-center justify-around px-1 py-3">
        {navItems.map((item, index) => {
          if (item.isHighlighted) {
            return (
              <Link
                key={index}
                to={item.url}
                className="flex items-center justify-center -mt-6 relative z-10"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                    isActive(item.url)
                      ? "bg-primary text-white ring-2 ring-primary ring-opacity-30"
                      : "bg-primary text-white"
                  }`}
                >
                  <Icon path={item.icon} size={1.4} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={index}
              to={item.url}
              className="flex items-center justify-center flex-1 py-2"
            >
              <Icon
                path={item.icon}
                size={1.3}
                className={isActive(item.url) ? "text-primary dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}
              />
            </Link>
          );
        })}

        <button
          onClick={onMenuClick}
          className="flex items-center justify-center flex-1 py-2"
          aria-label="Abrir menu"
        >
          <Icon path={mdiMenu} size={1.3} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </nav>
  );
}

