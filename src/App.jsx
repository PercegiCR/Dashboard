import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import VendorData from './components/master/VendorData';
import CustomerData from './components/master/CustomerData';
import InventoryData from './components/master/InventoryData';
import ProductData from './components/master/ProductData';
import SalesOrder from './components/orders/SalesOrder';
import PurchaseOrder from './components/orders/PurchaseOrder';
import FinanceDashboard from './components/finance/FinanceDashboard';
import InvoiceSO from './components/invoice/InvoiceSO';
import InvoicePO from './components/invoice/InvoicePO';
import InvoiceSettings from './components/settings/InvoiceSettings';
import ExportData from './components/settings/ExportData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      default:
        return <div><h1>Dashboard</h1></div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
