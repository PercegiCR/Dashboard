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

const Sidebar = ({ activeTab, setActiveTab }) => {
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
      </div>
    </aside>
  );
};

export default Sidebar;
