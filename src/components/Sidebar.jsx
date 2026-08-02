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
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'so', label: 'Sales Order (SO)', icon: <ShoppingCart size={20} /> },
    { id: 'po', label: 'Purchase Order (PO)', icon: <FileText size={20} /> },
    { id: 'product', label: 'Data Produk', icon: <Coffee size={20} /> },
    { id: 'inventory', label: 'Data Inventory', icon: <Package size={20} /> },
    { id: 'customer', label: 'Data Customer', icon: <Users size={20} /> },
    { id: 'vendor', label: 'Data Vendor', icon: <Briefcase size={20} /> },
    { id: 'finance', label: 'Finance Dashboard', icon: <Wallet size={20} /> },
  ];

  const settingItems = [
    { id: 'settings_invoice', label: 'Atur Invoice' },
    { id: 'settings_export', label: 'Export Masal' },
  ];

  // Helper to check if any setting tab is active to keep dropdown open initially
  React.useEffect(() => {
    if (activeTab.startsWith('settings_')) {
      setIsSettingsOpen(true);
    }
  }, [activeTab]);

  return (
    <aside className="w-64 flex flex-col bg-slate-900 text-slate-300 min-h-screen">
      <div className="flex items-center gap-3 p-6 mb-2 border-b border-slate-800">
        <div className="bg-white/10 p-1.5 rounded-lg flex items-center justify-center">
          <img src="/logo.png" alt="Percegi Coffee Logo" className="w-8 h-8 object-contain drop-shadow-md" />
        </div>
        <div className="text-xl font-bold text-white tracking-wide">Percegi Coffee</div>
      </div>
      
      <div className="flex-1 flex flex-col gap-1 px-4 py-4 overflow-y-auto">
        {menuItems.map(item => (
          <div 
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors font-medium ${
              activeTab === item.id 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className={activeTab === item.id ? 'text-white' : 'text-slate-400'}>
              {item.icon}
            </span>
            {item.label}
          </div>
        ))}

        {/* Pengaturan Dropdown */}
        <div className="mt-2 border-t border-slate-800 pt-2">
          <div 
            className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors font-medium hover:bg-slate-800 hover:text-white"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400"><Settings size={20} /></span>
              Pengaturan
            </div>
            {isSettingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          
          {isSettingsOpen && (
            <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-slate-700 pl-3">
              {settingItems.map(item => (
                <div 
                  key={item.id}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-colors font-medium text-sm ${
                    activeTab === item.id 
                      ? 'bg-amber-600/20 text-amber-500' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
