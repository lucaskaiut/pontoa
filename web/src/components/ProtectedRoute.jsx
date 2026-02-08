import React from 'react';
import { Navigate } from 'react-router-dom';
import { useACL } from '../hooks/useACL';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente para proteger rotas baseadas em permissões
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a ser renderizado se tiver permissão
 * @param {string|string[]} props.permission - Permissão(ões) necessária(s). Se array, verifica se tem pelo menos uma (hasAnyPermission)
 * @param {boolean} props.requireAll - Se true e permission for array, requer todas as permissões (hasAllPermissions)
 * @param {string} props.redirectTo - Rota para redirecionar se não tiver permissão (padrão: "/")
 */
export function ProtectedRoute({ 
  children, 
  permission, 
  requireAll = false, 
  redirectTo = "/" 
}) {
  const { isUserLogged, isFetching, user } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useACL();

  // Se ainda está carregando, não renderiza nada
  if (isFetching) {
    return null;
  }

  // Se não está logado, redireciona
  if (!isUserLogged) {
    return <Navigate to="/login" replace />;
  }

  // Se não tem permissão definida, permite acesso
  if (!permission) {
    return <>{children}</>;
  }

  // Superadmins têm acesso automático a manage_companies quando estão na própria company
  if (permission === 'manage_companies' && user?.type === 'superadmin') {
    return <>{children}</>;
  }

  // Verifica permissão(ões)
  let hasAccess = false;

  if (Array.isArray(permission)) {
    // Se é array de permissões
    if (requireAll) {
      hasAccess = hasAllPermissions(permission);
    } else {
      hasAccess = hasAnyPermission(permission);
    }
  } else {
    // Se é uma única permissão
    hasAccess = hasPermission(permission);
  }

  // Se não tem acesso, redireciona
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  // Tem acesso, renderiza o componente
  return <>{children}</>;
}


