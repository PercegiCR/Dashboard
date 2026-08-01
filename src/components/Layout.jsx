import React, { useState } from 'react';
import { 
  Coffee, 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Wallet,
  Briefcase,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden print:h-auto print:overflow-visible print:bg-white relative">
      
      {/* OVERLAY UNTUK MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden animate-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR KIRI */}
      <aside className={`w-64 bg-white text-slate-800 flex flex-col h-full border-r border-gray-200 flex-shrink-0 print:hidden z-50 fixed md:relative transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 text-xl font-bold border-b border-gray-100 flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="Percegi Coffee Logo" className="h-10 object-contain" />
            </div>
            Percegi Coffee
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT KANAN */}
      <main className="flex-1 flex flex-col h-full relative print:block print:h-auto w-full md:w-auto">
        {/* Header Atas (Topbar) */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-600 hover:text-amber-600"
            >
              <Menu size={24} />
            </button>
            <div className="font-semibold text-gray-700 capitalize">
              {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Area Konten */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar print:overflow-visible print:p-0">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
