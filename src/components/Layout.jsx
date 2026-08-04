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
  X,
  Plus,
  FilePlus,
  ShoppingCart as ShoppingCartIcon,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, hasAccess } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(activeTab?.startsWith('settings_') || false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'so', label: 'Sales Order (SO)', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'po', label: 'Purchase Order (PO)', icon: <FileText className="w-5 h-5" /> },
    { id: 'product', label: 'Data Produk', icon: <Coffee className="w-5 h-5" /> },
    { id: 'inventory', label: 'Data Inventory', icon: <Package className="w-5 h-5" /> },
    { id: 'customer', label: 'Data Customer', icon: <Users className="w-5 h-5" /> },
    { id: 'vendor', label: 'Data Vendor', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'finance', label: 'Finance Dashboard', icon: <Wallet className="w-5 h-5" /> },
  ];

  const settingItems = [
    { id: 'settings_invoice', label: 'Atur Invoice' },
    { id: 'settings_export', label: 'Export Masal' },
    { id: 'settings_account', label: 'Atur Akun' },
    { id: 'settings_users', label: 'Manage User' },
    { id: 'settings_roles', label: 'Atur Role' },
  ];

  const visibleMenuItems = menuItems.filter(item => hasAccess(item.id));
  const visibleSettingItems = settingItems.filter(item => hasAccess(item.id));

  const handleFabClick = (type) => {
    setActiveTab(type);
    setIsFabMenuOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new Event(`open-${type}-modal`));
    }, 50);
  };

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
          {visibleMenuItems.map(item => (
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
          
          {/* Pengaturan Dropdown */}
          {visibleSettingItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  Pengaturan
                </div>
                {isSettingsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              
              {isSettingsOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                  {visibleSettingItems.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeTab === item.id 
                          ? 'bg-amber-100 text-amber-700 font-bold' 
                          : 'text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm overflow-hidden">
                {currentUser?.profilePic ? (
                  <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name?.substring(0, 2).toUpperCase() || 'AD'
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-bold text-gray-700">{currentUser?.name || 'Administrator'}</div>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-popup">
                <button 
                  onClick={() => {
                    setActiveTab('settings_account');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <User size={16} />
                  Profile Saya
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Area Konten */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar print:overflow-visible print:p-0">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full">
            {children}
          </div>
        </div>
      </main>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
        {isFabMenuOpen && (
          <div className="flex flex-col gap-3 mb-4 animate-popup">
            <button 
              onClick={() => handleFabClick('so')}
              className="flex items-center justify-end gap-3 group"
            >
              <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">Buat Pesanan</span>
              <div className="w-12 h-12 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-110">
                <ShoppingCartIcon size={20} />
              </div>
            </button>
            <button 
              onClick={() => handleFabClick('po')}
              className="flex items-center justify-end gap-3 group"
            >
              <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">Buat PO</span>
              <div className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-110">
                <FilePlus size={20} />
              </div>
            </button>
          </div>
        )}
        <button 
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className={`w-14 h-14 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center text-white shadow-xl transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45' : 'hover:scale-110'}`}
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
};

export default Layout;
