import React, { useState, Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './components/auth/Login';

// Lazy loaded components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const VendorData = lazy(() => import('./components/master/VendorData'));
const CustomerData = lazy(() => import('./components/master/CustomerData'));
const InventoryData = lazy(() => import('./components/master/InventoryData'));
const ProductData = lazy(() => import('./components/master/ProductData'));
const SalesOrder = lazy(() => import('./components/orders/SalesOrder'));
const PurchaseOrder = lazy(() => import('./components/orders/PurchaseOrder'));
const FinanceDashboard = lazy(() => import('./components/finance/FinanceDashboard'));
const InvoiceSO = lazy(() => import('./components/invoice/InvoiceSO'));
const InvoicePO = lazy(() => import('./components/invoice/InvoicePO'));
const InvoiceSettings = lazy(() => import('./components/settings/InvoiceSettings'));
const ExportData = lazy(() => import('./components/settings/ExportData'));
const AccountSettings = lazy(() => import('./components/settings/AccountSettings'));
const UserManagement = lazy(() => import('./components/settings/UserManagement'));
const RoleManagement = lazy(() => import('./components/settings/RoleManagement'));

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'vendor':
        return <VendorData />;
      case 'customer':
        return <CustomerData />;
      case 'inventory':
        return <InventoryData />;
      case 'product':
        return <ProductData />;
      case 'so':
        return <SalesOrder setActiveTab={setActiveTab} />;
      case 'po':
        return <PurchaseOrder setActiveTab={setActiveTab} />;
      case 'finance':
        return <FinanceDashboard />;
      case 'invoice_so':
        return <InvoiceSO setActiveTab={setActiveTab} />;
      case 'invoice_po':
        return <InvoicePO setActiveTab={setActiveTab} />;
      case 'settings_invoice':
        return <InvoiceSettings />;
      case 'settings_export':
        return <ExportData />;
      case 'settings_account':
        return <AccountSettings />;
      case 'settings_users':
        return <UserManagement />;
      case 'settings_roles':
        return <RoleManagement />;
      default:
        return <div><h1>Dashboard</h1></div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        {renderContent()}
      </Suspense>
    </Layout>
  );
}

export default App;
