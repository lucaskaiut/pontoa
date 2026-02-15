import { Icon } from "@mdi/react";
import { mdiClose, mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useACL } from "../hooks/useACL";
import { useState, useEffect } from "react";
import {
  mdiAccountMultiple,
  mdiCalendarCheck,
  mdiLogout,
  mdiCog,
  mdiViewDashboard,
  mdiBell,
  mdiChartLine,
  mdiShieldAccount,
  mdiWhatsapp,
  mdiCreditCard,
  mdiPackageVariant,
  mdiCart,
} from "@mdi/js";

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
        {
          label: "Não Comparecimento",
          url: "/relatorios/no-show",
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
      label: "Pacotes",
      icon: mdiPackageVariant,
      url: "/pacotes",
      permission: "manage_packages",
    },
    {
      label: "Pedidos",
      icon: mdiCart,
      url: "/pedidos",
      permission: "manage_orders",
    },
    {
      label: "Pagamentos",
      icon: mdiCreditCard,
      url: "/pagamentos",
      permission: "manage_payments",
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

export function MobileMenuDrawer({ isOpen, setIsOpen }) {
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
    <div
      className={
        "fixed inset-0 z-50 transition-opacity duration-300 " +
        (isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
      }
    >
      <div
        className={
          "absolute inset-0 bg-gray-900 transition-opacity duration-300 " +
          (isOpen ? "bg-opacity-50" : "bg-opacity-0")
        }
        onClick={() => setIsOpen(false)}
      />
      <div
        className={
          "absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-surface rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col " +
          (isOpen ? "translate-y-0" : "translate-y-full")
        }
        style={{ maxHeight: "90vh", height: "90vh" }}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-dark-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative inline-block w-12 h-12 overflow-hidden rounded-[50%]">
              <img
                className="h-full"
                src="https://kanto.legiaodosherois.com.br/w728-h381-gnw-cfill-gcc-f:fbcover/wp-content/uploads/2021/07/legiao_Ry1hNJoxOzpY.jpg.webp"
                alt=""
              />
            </div>
            <div className="flex flex-col">
              <b className="text-gray-800 dark:text-dark-text">{userName}</b>
              <small className="text-gray-500 dark:text-dark-text-secondary">{companyName}</small>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors"
          >
            <Icon path={mdiClose} size={1.5} className="text-primary dark:text-blue-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
            {menuItems.map((item, index) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = shouldExpandMenu(item);
              const isActive = item.url ? location.pathname === item.url : isSubmenuActive(item.submenu);
              const linkClassName = isActive 
                ? "transition-all outline-hidden text-primary dark:text-blue-400"
                : "transition-all outline-hidden";
              const iconClassName = isActive ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500";
              const spanClassName = isActive ? "text-primary dark:text-blue-400 font-semibold" : "text-gray-600 dark:text-dark-text";
              
              if (hasSubmenu) {
                return (
                  <div key={`menu-item-${index}-${item.label}`}>
                    <div
                      onClick={() => toggleSubmenu(item.label)}
                      className={`${linkClassName} cursor-pointer`}
                    >
                      <div className="flex items-center justify-between p-4 w-full gap-4 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover">
                        <div className="flex items-center gap-4">
                          <Icon
                            path={item.icon}
                            size={1.2}
                            className={iconClassName}
                          />
                          <span className={spanClassName}>
                            {item.label}
                          </span>
                        </div>
                        <Icon
                          path={isExpanded ? mdiChevronUp : mdiChevronDown}
                          size={1}
                          className={iconClassName}
                        />
                      </div>
                    </div>
                    {isExpanded && item.submenu && (
                      <div className="ml-4">
                        {item.submenu.map((subItem, subIndex) => {
                          const isSubActive = location.pathname === subItem.url;
                          const subSpanClassName = isSubActive ? "text-primary dark:text-blue-400 font-semibold" : "text-gray-600 dark:text-dark-text";
                          
                          return (
                            <Link
                              key={`submenu-item-${index}-${subIndex}-${subItem.url}`}
                              to={subItem.url}
                              className="transition-all outline-hidden"
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="flex items-center p-4 w-full gap-4 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover pl-8">
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
                  key={`menu-item-${index}-${item.url || item.label}`}
                  to={item.url || '#'}
                  className={linkClassName}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center p-4 w-full gap-4 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover">
                    <Icon
                      path={item.icon}
                      size={1.2}
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

        <div className="p-4 border-t dark:border-dark-border shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-all"
          >
            <Icon path={mdiLogout} size={1.2} className="text-primary dark:text-blue-400" />
            <span className="text-gray-600 dark:text-dark-text">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}

