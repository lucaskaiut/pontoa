import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { reportService } from "../../../services/reportService";
import { userService } from "../../../services/userService";
import { serviceService } from "../../../services/serviceService";
import { customerService } from "../../../services/customerService";
import { NoShowReportFilters, NoShowReportData, NoShowReportItem, NoShowReportGroupedItem, NoShowReportGroupedByCustomerItem, NoShowReportTotals } from "../types";
import { User } from "../../Users/types";
import { Service } from "../../Services/types";
import { Customer } from "../../Customers/types";

interface UseNoShowReportListReturn {
  reportData: NoShowReportData;
  isLoading: boolean;
  filters: NoShowReportFilters;
  appliedFilters: NoShowReportFilters | null;
  setFilter: (key: keyof NoShowReportFilters, value: any) => void;
  applyFilters: () => void;
  totals: NoShowReportTotals;
  users: User[];
  services: Service[];
  customers: Customer[];
  isLoadingUsers: boolean;
  isLoadingServices: boolean;
  isLoadingCustomers: boolean;
}

export function useNoShowReportList(): UseNoShowReportListReturn {
  const [filters, setFilters] = useState<NoShowReportFilters>({
    group_by: '',
    date_start_at: '',
    date_end_at: '',
    user_id: '',
    service_id: '',
    customer_id: '',
  });

  const [appliedFilters, setAppliedFilters] = useState<NoShowReportFilters | null>(null);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  const { data: reportData = [], isLoading } = useQuery<NoShowReportData>({
    queryKey: ["no-show-report", appliedFilters],
    queryFn: async () => {
      const filtersToUse = appliedFilters || {};
      const result = await reportService.getNoShow(filtersToUse);
      return (result || []) as NoShowReportData;
    },
    enabled: hasAppliedFilters,
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery<any>({
    queryKey: ["users-collaborators"],
    queryFn: async () => {
      const result = await userService.list({ is_collaborator: true });
      return result;
    },
  });

  const users = useMemo(() => {
    if (!usersData) return [];
    if (Array.isArray(usersData)) return usersData;
    if (usersData.data && Array.isArray(usersData.data)) return usersData.data;
    return [];
  }, [usersData]);

  const { data: servicesData, isLoading: isLoadingServices } = useQuery<any>({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await serviceService.list();
      return result;
    },
  });

  const services = useMemo(() => {
    if (!servicesData) return [];
    if (Array.isArray(servicesData)) return servicesData;
    if (servicesData.data && Array.isArray(servicesData.data)) return servicesData.data;
    return [];
  }, [servicesData]);

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery<any>({
    queryKey: ["customers"],
    queryFn: async () => {
      const result = await customerService.list();
      return result;
    },
  });

  const customers = useMemo(() => {
    if (!customersData) return [];
    if (Array.isArray(customersData)) return customersData;
    if (customersData.data && Array.isArray(customersData.data)) return customersData.data;
    return [];
  }, [customersData]);

  const setFilter = (key: keyof NoShowReportFilters, value: any): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = (): void => {
    const newFilters: NoShowReportFilters = {};

    if (filters.group_by) {
      newFilters.group_by = filters.group_by;
    }

    if (filters.date_start_at) {
      newFilters.date_start_at = filters.date_start_at;
    }

    if (filters.date_end_at) {
      newFilters.date_end_at = filters.date_end_at;
    }

    if (filters.user_id) {
      newFilters.user_id = filters.user_id;
    }

    if (filters.service_id) {
      newFilters.service_id = filters.service_id;
    }

    if (filters.customer_id) {
      newFilters.customer_id = filters.customer_id;
    }

    setAppliedFilters(newFilters);
    setHasAppliedFilters(true);
  };

  const totals = useMemo((): NoShowReportTotals => {
    if (!reportData || reportData.length === 0) {
      return {
        totalCount: 0,
        totalPrice: 0,
      };
    }

    if (appliedFilters?.group_by === 'customer') {
      const groupedData = reportData as NoShowReportGroupedByCustomerItem[];
      const totalCount = groupedData.reduce((sum, item) => sum + (item.count || 0), 0);
      const totalPrice = groupedData.reduce((sum, item) => sum + (typeof item.total_price === 'number' ? item.total_price : parseFloat(String(item.total_price)) || 0), 0);
      return {
        totalCount,
        totalPrice,
      };
    } else if (appliedFilters?.group_by) {
      const groupedData = reportData as NoShowReportGroupedItem[];
      const totalCount = groupedData.reduce((sum, item) => sum + (item.count || 0), 0);
      const totalPrice = groupedData.reduce((sum, item) => sum + (typeof item.total_price === 'number' ? item.total_price : parseFloat(String(item.total_price)) || 0), 0);
      return {
        totalCount,
        totalPrice,
      };
    } else {
      const items = reportData as NoShowReportItem[];
      const totalPrice = items.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0), 0);
      return {
        totalCount: items.length,
        totalPrice,
      };
    }
  }, [reportData, appliedFilters?.group_by]);

  const enrichedReportData = useMemo(() => {
    if (!reportData || reportData.length === 0) {
      return reportData;
    }

    if (appliedFilters?.group_by) {
      return reportData;
    }

    const items = reportData as NoShowReportItem[];
    return items.map(item => {
      const customer = item.customer_id ? customers.find(c => c.id === item.customer_id) : null;
      const service = item.service_id ? services.find(s => s.id === item.service_id) : null;
      const user = item.user_id ? users.find(u => u.id === item.user_id) : null;

      return {
        ...item,
        customer: customer ? { id: customer.id!, name: customer.name } : item.customer,
        service: service ? { id: service.id!, name: service.name } : item.service,
        user: user ? { id: user.id!, name: user.name } : item.user,
      };
    });
  }, [reportData, customers, services, users, appliedFilters?.group_by]);

  return {
    reportData: enrichedReportData,
    isLoading,
    filters,
    appliedFilters,
    setFilter,
    applyFilters,
    totals,
    users,
    services,
    customers,
    isLoadingUsers,
    isLoadingServices,
    isLoadingCustomers,
  };
}

