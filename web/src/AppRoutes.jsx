import { useState } from "react";
import { Routes as ReactRoutes, Route } from "react-router-dom";
import { CustomerList, CustomerForm } from "./pages/Customers";
import { Home } from "./pages/Home";
import { SchedulingList, SchedulingForm } from "./pages/Scheduling";
import { UserList, UserForm } from "./pages/Users";
import { Company } from "./pages/Company";
import { UpgradePlan } from "./pages/UpgradePlan";
import { NotificationList, NotificationForm } from "./pages/Notifications";
import { ReportList } from "./pages/Reports";
import { NoShowReportListContainer as NoShowReportList } from "./pages/Reports/noShow";
import { RoleList, RoleForm } from "./pages/Roles";
import { WhatsApp } from "./pages/WhatsApp";
import { PaymentList } from "./pages/Payments";
import { ReviewList } from "./pages/Reviews";
import { PackageList, PackageForm } from "./pages/Packages";
import { OrderList, OrderDetail } from "./pages/Orders";
import { StoreListContainer } from "./pages/Stores";
import { StoreForm } from "./pages/Stores/StoreForm";
import { Sidebar } from './components/ui/organisms/Sidebar';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { BottomNavigationBar } from './components/BottomNavigationBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ThemeToggle } from './components/ThemeToggle';

export function AppRoutes() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <ThemeToggle />
            <div className="flex w-full h-screen bg-gray-50 dark:bg-dark-bg">
                <Sidebar />
                <div className="flex-1 flex flex-col min-h-0 pb-24 md:pb-0">
                    <ReactRoutes>
                        <Route path="/" element={<Home />} />
                        <Route 
                            path="/clientes" 
                            element={
                                <ProtectedRoute permission="manage_customers">
                                    <CustomerList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/clientes/criar" 
                            element={
                                <ProtectedRoute permission="manage_customers">
                                    <CustomerForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/clientes/:id/editar" 
                            element={
                                <ProtectedRoute permission="manage_customers">
                                    <CustomerForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/agendamentos" 
                            element={
                                <ProtectedRoute permission="manage_schedulings">
                                    <SchedulingList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/agendamentos/criar" 
                            element={
                                <ProtectedRoute permission="manage_schedulings">
                                    <SchedulingForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/agendamentos/:id/editar" 
                            element={
                                <ProtectedRoute permission="manage_schedulings">
                                    <SchedulingForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/usuarios" 
                            element={
                                <ProtectedRoute permission="manage_users">
                                    <UserList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/usuarios/criar" 
                            element={
                                <ProtectedRoute permission="manage_users">
                                    <UserForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/usuarios/:id/editar" 
                            element={
                                <ProtectedRoute permission="manage_users">
                                    <UserForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/notificacoes" 
                            element={
                                <ProtectedRoute permission="manage_notifications">
                                    <NotificationList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/notificacoes/criar" 
                            element={
                                <ProtectedRoute permission="manage_notifications">
                                    <NotificationForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/notificacoes/:id/editar" 
                            element={
                                <ProtectedRoute permission="manage_notifications">
                                    <NotificationForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/perfis" 
                            element={
                                <ProtectedRoute permission="manage_roles">
                                    <RoleList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/perfis/criar" 
                            element={
                                <ProtectedRoute permission="manage_roles">
                                    <RoleForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/perfis/:id/editar" 
                            element={
                                <ProtectedRoute permission="manage_roles">
                                    <RoleForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/relatorios" 
                            element={
                                <ProtectedRoute permission="manage_reports">
                                    <ReportList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/relatorios/no-show" 
                            element={
                                <ProtectedRoute permission="manage_reports">
                                    <NoShowReportList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/configuracoes" 
                            element={
                                <ProtectedRoute permission="manage_settings">
                                    <Company />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/upgrade" 
                            element={
                                <ProtectedRoute permission="manage_settings">
                                    <UpgradePlan />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/whatsapp" 
                            element={
                                <ProtectedRoute permission="manage_settings">
                                    <WhatsApp />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/pagamentos" 
                            element={
                                <ProtectedRoute permission="manage_payments">
                                    <PaymentList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/avaliacoes" 
                            element={
                                <ProtectedRoute permission="manage_schedulings">
                                    <ReviewList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/pacotes" 
                            element={
                                <ProtectedRoute permission="manage_packages">
                                    <PackageList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/pacotes/criar" 
                            element={
                                <ProtectedRoute permission="manage_packages">
                                    <PackageForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/pacotes/:id/editar" 
                            element={
                                <ProtectedRoute permission="manage_packages">
                                    <PackageForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/pedidos" 
                            element={
                                <ProtectedRoute permission="manage_orders">
                                    <OrderList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/pedidos/:id" 
                            element={
                                <ProtectedRoute permission="manage_orders">
                                    <OrderDetail />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/lojas" 
                            element={
                                <ProtectedRoute permission="manage_companies">
                                    <StoreListContainer />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/lojas/criar" 
                            element={
                                <ProtectedRoute permission="manage_companies">
                                    <StoreForm />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/lojas/:id/editar" 
                            element={
                                <ProtectedRoute permission="manage_companies">
                                    <StoreForm />
                                </ProtectedRoute>
                            } 
                        />
                    </ReactRoutes>
                </div>
            </div>
            
            <BottomNavigationBar onMenuClick={() => setIsMobileMenuOpen(true)} />
            
            <MobileMenuDrawer 
                isOpen={isMobileMenuOpen} 
                setIsOpen={setIsMobileMenuOpen} 
            />
        </>

    );
}