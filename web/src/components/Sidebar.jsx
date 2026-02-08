import { Icon } from "@mdi/react";
import {
  mdiAccountMultiple,
  mdiCalendarCheck,
  mdiLogout,
  mdiCog,
  mdiViewDashboard,
  mdiBell,
  mdiChartLine,
  mdiChevronDown,
  mdiChevronUp,
  mdiShieldAccount,
  mdiWhatsapp,
} from "@mdi/js";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useACL } from "../hooks/useACL";
import { useState, useEffect } from "react";

const getMenuItems = () => {
  const items = [
    {
      label: "Dashboard",
      icon: mdiViewDashboard,
      url: "/",
      permission: null, // Sem permissão necessária
    },
    {
      label: "Agendamentos",
      icon: mdiCalendarCheck,
      url: "/agendamentos",
      permission: "manage_schedulings",
    },
    {
      label: "Clientes",
      icon: mdiAccountMultiple,
      url: "/clientes",
      permission: "manage_customers",
    },
    {
      label: "Usuários",
      icon: mdiAccountMultiple,
      url: "/usuarios",
      permission: "manage_users",
    },
    {
      label: "Perfis",
      icon: mdiShieldAccount,
      url: "/perfis",
      permission: "manage_roles",
    },
    {
      label: "Relatórios",
      icon: mdiChartLine,
      url: null,
      permission: "manage_reports",
      submenu: [
        {
          label: "Faturamento",
          url: "/relatorios",
          permission: "manage_reports",
        },
      ],
    },
    {
      label: "Notificações",
      icon: mdiBell,
      url: "/notificacoes",
      permission: "manage_notifications",
    },
    {
      label: "WhatsApp",
      icon: mdiWhatsapp,
      url: "/whatsapp",
      permission: "manage_settings",
    },
    {
      label: "Configurações",
      icon: mdiCog,
      url: "/configuracoes",
      permission: "manage_settings",
    },
  ];
  
  return items.map((item) => {
    const iconValue = item.icon;
    const iconString = typeof iconValue === 'string' ? iconValue : String(iconValue || '');
    
    return {
      label: String(item.label || ''),
      icon: iconString,
      url: item.url ? String(item.url) : null,
      submenu: item.submenu || null,
      permission: item.permission || null,
    };
  }).filter(item => item.icon && item.label);
};

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission } = useACL();
  const [expandedMenus, setExpandedMenus] = useState({});
  
  if (!user || !user.name) {
    return null;
  }

  if (typeof logout !== 'function') {
    return null;
  }

  // Filtrar itens do menu baseado em permissões
  const allMenuItems = getMenuItems();
  const menuItems = allMenuItems.filter(item => {
    // Se não tem permissão requerida, sempre mostra
    if (!item.permission) {
      // Se tem submenu, verifica se algum subitem tem permissão ou não requer permissão
      if (item.submenu && item.submenu.length > 0) {
        return item.submenu.some(subItem => {
          return !subItem.permission || hasPermission(subItem.permission);
        });
      }
      return true;
    }
    
    // Verifica permissão do item principal
    return hasPermission(item.permission);
  }).map(item => {
    // Filtrar submenu também
    if (item.submenu && item.submenu.length > 0) {
      return {
        ...item,
        submenu: item.submenu.filter(subItem => {
          return !subItem.permission || hasPermission(subItem.permission);
        })
      };
    }
    return item;
  }).filter(item => {
    // Remove itens com submenu vazio
    if (item.submenu && item.submenu.length === 0) {
      return false;
    }
    return true;
  });
  const handleLogout = () => {
    if (typeof logout === 'function') {
      logout();
    }
  };

  const userName = typeof user.name === 'string' ? user.name : String(user.name || '');
  const companyName = user?.company?.name ? (typeof user.company.name === 'string' ? user.company.name : String(user.company.name || '')) : '';

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isSubmenuActive = (submenu) => {
    return submenu?.some(subItem => location.pathname === subItem.url) || false;
  };

  const shouldExpandMenu = (item) => {
    if (item.submenu && isSubmenuActive(item.submenu)) {
      return true;
    }
    return expandedMenus[item.label] || false;
  };

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu && isSubmenuActive(item.submenu)) {
        setExpandedMenus(prev => ({
          ...prev,
          [item.label]: true,
        }));
      }
    });
  }, [location.pathname]);

  return (
    <div className="hidden md:flex h-screen min-w-[300px] bg-white dark:bg-dark-surface gap-2 flex-col px-2 pt-10 overflow-hidden border-r border-gray-200 dark:border-dark-border">
      <div className="flex items-center px-4 justify-between gap-2 shrink-0">
        <div className="flex flex-col">
          <b className="text-gray-900 dark:text-dark-text">{userName}</b>
          <small className="text-gray-600 dark:text-dark-text-secondary">{companyName}</small>
        </div>
        <div onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <Icon path={mdiLogout} size={1} className="text-primary dark:text-blue-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {menuItems.map((item, index) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isExpanded = shouldExpandMenu(item);
        const isActive = item.url ? location.pathname === item.url : isSubmenuActive(item.submenu);
        const linkClassName = isActive 
          ? "transition-all outline-hidden text-primary dark:text-blue-400 border-r-4 border-primary dark:border-blue-400"
          : "transition-all outline-hidden";
        const iconClassName = isActive ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500";
        const spanClassName = isActive ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500";
        
        if (hasSubmenu) {
          return (
            <div key={`menu-item-${index}-${item.label}`}>
              <div
                onClick={() => toggleSubmenu(item.label)}
                className={`${linkClassName} cursor-pointer flex items-center`}
              >
                <div className="flex p-4 w-full gap-4 transition-all items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <Icon
                      path={item.icon}
                      size={1}
                      className={iconClassName}
                    />
                    <span className={spanClassName}>
                      {item.label}
                    </span>
                  </div>
                  <Icon
                    path={isExpanded ? mdiChevronUp : mdiChevronDown}
                    size={0.8}
                    className={iconClassName}
                  />
                </div>
              </div>
              {isExpanded && item.submenu && (
                <div>
                  {item.submenu.map((subItem, subIndex) => {
                    const isSubActive = location.pathname === subItem.url;
                    const subSpanClassName = isSubActive ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500";
                    
                    return (
                      <Link
                        key={`submenu-item-${index}-${subIndex}-${subItem.url}`}
                        to={subItem.url}
                        className="transition-all outline-hidden"
                      >
                        <div className="flex p-4 w-full gap-4 transition-all">
                          <div style={{ width: '32px' }}></div>
                          <span className={subSpanClassName}>
                            {subItem.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }
        
        return (
          <Link
            key={`menu-item-${index}-${item.url}`}
            to={item.url || '#'}
            className={`${linkClassName} flex items-center`}
          >
            <div className="flex p-4 w-full gap-4 transition-all items-center">
              <Icon
                path={item.icon}
                size={1}
                className={iconClassName}
              />
              <span className={spanClassName}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
      </div>
    </div>
  );
}
