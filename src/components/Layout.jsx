import React from 'react';
import { 
  Coffee, 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Wallet,
  Briefcase
} from 'lucide-react';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'vendor', label: 'Data Vendor', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'customer', label: 'Data Customer', icon: <Users className="w-5 h-5" /> },
    { id: 'inventory', label: 'Data Inventory', icon: <Package className="w-5 h-5" /> },
    { id: 'product', label: 'Data Produk', icon: <Coffee className="w-5 h-5" /> },
    { id: 'so', label: 'Sales Order (SO)', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'po', label: 'Purchase Order (PO)', icon: <FileText className="w-5 h-5" /> },
    { id: 'finance', label: 'Finance Dashboard', icon: <Wallet className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl flex-shrink-0 print:hidden">
        <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-3">
          <div className="text-amber-500 bg-amber-500/10 p-2 rounded-lg">
            <Coffee className="w-6 h-6" />
          </div>
          Percegi Coffee
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-blue-600 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT KANAN */}
      <main className="flex-1 flex flex-col h-full relative print:block print:h-auto">
        {/* Header Atas (Topbar) */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm print:hidden">
          <div className="font-semibold text-gray-700 capitalize">
            {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Area Konten */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar print:overflow-visible print:p-0">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
