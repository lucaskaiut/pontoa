<?php

namespace App\Constants;

class Permissions
{
    public const MANAGE_USERS = 'manage_users';

    public const MANAGE_CUSTOMERS = 'manage_customers';

    public const MANAGE_SCHEDULINGS = 'manage_schedulings';

    public const MANAGE_NOTIFICATIONS = 'manage_notifications';

    public const MANAGE_OTHER_USER_INFORMATIONS = 'manage_other_user_informations';

    public const MANAGE_SETTINGS = 'manage_settings';

    public const MANAGE_ROLES = 'manage_roles';

    public const MANAGE_REPORTS = 'manage_reports';

    public const MANAGE_PAYMENTS = 'manage_payments';

    public const MANAGE_ORDERS = 'manage_orders';

    public const MANAGE_PACKAGES = 'manage_packages';

    public const MANAGE_COMPANIES = 'manage_companies';

    public const MANAGE_APPOINTMENT_EXECUTIONS = 'manage_appointment_executions';

    public static function all(): array
    {
        return [
            self::MANAGE_USERS,
            self::MANAGE_CUSTOMERS,
            self::MANAGE_SCHEDULINGS,
            self::MANAGE_NOTIFICATIONS,
            self::MANAGE_OTHER_USER_INFORMATIONS,
            self::MANAGE_SETTINGS,
            self::MANAGE_ROLES,
            self::MANAGE_REPORTS,
            self::MANAGE_PAYMENTS,
            self::MANAGE_ORDERS,
            self::MANAGE_PACKAGES,
            self::MANAGE_COMPANIES,
            self::MANAGE_APPOINTMENT_EXECUTIONS,
        ];
    }

    public static function labels(): array
    {
        return [
            self::MANAGE_USERS => 'Gerenciar Usuários',
            self::MANAGE_CUSTOMERS => 'Gerenciar Clientes',
            self::MANAGE_SCHEDULINGS => 'Gerenciar Agendamentos',
            self::MANAGE_NOTIFICATIONS => 'Gerenciar Notificações',
            self::MANAGE_OTHER_USER_INFORMATIONS => 'Gerenciar Informações de Outros Usuários',
            self::MANAGE_SETTINGS => 'Gerenciar Configurações',
            self::MANAGE_ROLES => 'Gerenciar Perfis',
            self::MANAGE_REPORTS => 'Gerenciar Relatórios',
            self::MANAGE_PAYMENTS => 'Gerenciar Pagamentos',
            self::MANAGE_ORDERS => 'Gerenciar Pedidos',
            self::MANAGE_PACKAGES => 'Gerenciar Pacotes',
            self::MANAGE_COMPANIES => 'Gerenciar Lojas',
            self::MANAGE_APPOINTMENT_EXECUTIONS => 'Gerenciar Execução de Atendimentos',
        ];
    }

    public static function getLabel(string $permission): string
    {
        return self::labels()[$permission] ?? $permission;
    }
}
