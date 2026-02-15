import { Icon } from "../atoms";
import { Avatar } from "../atoms";
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
  mdiCreditCard,
  mdiStarOutline,
  mdiPackageVariant,
  mdiCart,
  mdiStore,
} from "@mdi/js";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useACL } from "../../../hooks/useACL";
import { useCompany } from "../../../contexts/CompanyContext";
import { CompanySelector } from "../../CompanySelector";
import { useState, useEffect } from "react";
import classNames from "classnames";

const getMenuItems = (isSuperadminOnOwnCompany = false) => {
  if (isSuperadminOnOwnCompany) {
    return [
      {
        label: "Usuários",
        icon: mdiAccountMultiple,
        url: "/usuarios",
        permission: "manage_users",
      },
      {
        label: "Lojas",
        icon: mdiStore,
        url: "/lojas",
        permission: null,
      },
      {
        label: "Configurações",
        icon: mdiCog,
        url: "/configuracoes",
        permission: "manage_settings",
      },
    ];
  }

  const items = [
    {
      label: "Dashboard",
      icon: mdiViewDashboard,
      url: "/",
      permission: null,
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
      label: "Avaliações",
      icon: mdiStarOutline,
      url: "/avaliacoes",
      permission: "manage_schedulings",
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
    const iconString = typeof iconValue === "string" ? iconValue : String(iconValue || "");

    return {
      label: String(item.label || ""),
      icon: iconString,
      url: item.url ? String(item.url) : null,
      submenu: item.submenu || null,
      permission: item.permission || null,
    };
  }).filter((item) => item.icon && item.label);
};

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission } = useACL();
  const { isLoadingCompanies, isSuperadmin, selectedCompany, userCompanyId } = useCompany();
  const [expandedMenus, setExpandedMenus] = useState({});

  const isSuperadminOnOwnCompany = isSuperadmin && selectedCompany?.id === userCompanyId;

  if (!user || !user.name) {
    return null;
  }

  if (typeof logout !== "function") {
    return null;
  }

  const allMenuItems = getMenuItems(isSuperadminOnOwnCompany);
  const menuItems = allMenuItems
    .filter((item) => {
      if (!item.permission) {
        if (item.submenu && item.submenu.length > 0) {
          return item.submenu.some((subItem) => {
            return !subItem.permission || hasPermission(subItem.permission);
          });
        }
        return true;
      }
      return hasPermission(item.permission);
    })
    .map((item) => {
      if (item.submenu && item.submenu.length > 0) {
        return {
          ...item,
          submenu: item.submenu.filter((subItem) => {
            return !subItem.permission || hasPermission(subItem.permission);
          }),
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.submenu && item.submenu.length === 0) {
        return false;
      }
      return true;
    });

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    }
  };

  const userName = typeof user.name === "string" ? user.name : String(user.name || "");
  const companyName = user?.company?.name
    ? typeof user.company.name === "string"
      ? user.company.name
      : String(user.company.name || "")
    : "";

  const toggleSubmenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isSubmenuActive = (submenu) => {
    return submenu?.some((subItem) => location.pathname === subItem.url) || false;
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
        setExpandedMenus((prev) => ({
          ...prev,
          [item.label]: true,
        }));
      }
    });
  }, [location.pathname]);

  return (
    <div className="hidden md:flex h-screen min-w-[280px] bg-white dark:bg-dark-surface flex-col border-r border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            src={user?.avatar}
            name={userName}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-dark-text truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">
              {companyName}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors"
          aria-label="Sair"
        >
          <Icon path={mdiLogout} size={1.2} />
        </button>
      </div>

      {!isLoadingCompanies && <CompanySelector />}

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item, index) => {
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = shouldExpandMenu(item);
          const isActive = item.url
            ? location.pathname === item.url
            : isSubmenuActive(item.submenu);

          if (hasSubmenu) {
            return (
              <div key={`menu-item-${index}-${item.label}`}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={classNames(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 mb-1",
                    {
                      "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300":
                        isActive,
                      "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover":
                        !isActive,
                    }
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      path={item.icon}
                      size={1.2}
                      className={classNames({
                        "text-primary-600 dark:text-primary-400": isActive,
                        "text-gray-500 dark:text-gray-400": !isActive,
                      })}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <Icon
                    path={isExpanded ? mdiChevronUp : mdiChevronDown}
                    size={0.9}
                    className={classNames({
                      "text-primary-600 dark:text-primary-400": isActive,
                      "text-gray-400 dark:text-gray-500": !isActive,
                    })}
                  />
                </button>
                {isExpanded && item.submenu && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem, subIndex) => {
                      const isSubActive = location.pathname === subItem.url;
                      return (
                        <Link
                          key={`submenu-item-${index}-${subIndex}-${subItem.url}`}
                          to={subItem.url}
                          className={classNames(
                            "block px-4 py-2.5 rounded-lg transition-all duration-200 text-sm",
                            {
                              "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium":
                                isSubActive,
                              "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover":
                                !isSubActive,
                            }
                          )}
                        >
                          {subItem.label}
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
              to={item.url || "#"}
              className={classNames(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1",
                {
                  "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300":
                    isActive,
                  "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-surface-hover":
                    !isActive,
                }
              )}
            >
              <Icon
                path={item.icon}
                size={1.2}
                className={classNames({
                  "text-primary-600 dark:text-primary-400": isActive,
                  "text-gray-500 dark:text-gray-400": !isActive,
                })}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

