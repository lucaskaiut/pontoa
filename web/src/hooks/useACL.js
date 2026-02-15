import { useAuth } from "./useAuth";

/**
 * Hook para verificar permissões do usuário (ACL)
 * @returns {Object} Objeto com funções para verificar permissões
 */
export function useACL() {
  const { user } = useAuth();

  /**
   * Obtém todas as permissões do usuário baseadas nos seus roles
   * @returns {string[]} Array de strings com as permissões
   */
  const getAllPermissions = () => {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return [];
    }

    // Coleta todas as permissões de todos os roles
    const permissions = new Set();
    
    user.roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(permission => {
          permissions.add(permission);
        });
      }
    });

    return Array.from(permissions);
  };

  /**
   * Verifica se o usuário tem uma permissão específica
   * @param {string} permission - Nome da permissão a ser verificada
   * @returns {boolean} true se o usuário tem a permissão, false caso contrário
   */
  const hasPermission = (permission) => {
    if (!permission) {
      return false;
    }

    const permissions = getAllPermissions();
    return permissions.includes(permission);
  };

  /**
   * Verifica se o usuário tem pelo menos uma das permissões fornecidas
   * @param {string[]} permissions - Array de permissões a serem verificadas
   * @returns {boolean} true se o usuário tem pelo menos uma permissão, false caso contrário
   */
  const hasAnyPermission = (permissions) => {
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }

    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Verifica se o usuário tem todas as permissões fornecidas
   * @param {string[]} permissions - Array de permissões a serem verificadas
   * @returns {boolean} true se o usuário tem todas as permissões, false caso contrário
   */
  const hasAllPermissions = (permissions) => {
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }

    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * Obtém todos os roles do usuário
   * @returns {Array} Array de roles do usuário
   */
  const getUserRoles = () => {
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return [];
    }

    return user.roles;
  };

  /**
   * Verifica se o usuário tem um role específico
   * @param {string|number} roleId - ID do role a ser verificado
   * @returns {boolean} true se o usuário tem o role, false caso contrário
   */
  const hasRole = (roleId) => {
    if (!roleId) {
      return false;
    }

    const roles = getUserRoles();
    return roles.some(role => role.id === roleId || role.id === String(roleId));
  };

  /**
   * Verifica se o usuário tem um role pelo nome
   * @param {string} roleName - Nome do role a ser verificado
   * @returns {boolean} true se o usuário tem o role, false caso contrário
   */
  const hasRoleByName = (roleName) => {
    if (!roleName) {
      return false;
    }

    const roles = getUserRoles();
    return roles.some(role => role.name === roleName);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllPermissions,
    getUserRoles,
    hasRole,
    hasRoleByName,
  };
}


