import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Coffee, Users, Package, ShoppingCart } from 'lucide-react';

const Dashboard = ({ setActiveTab }) => {
  const { customers, products, salesOrders, purchaseOrders } = useAppContext();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Utama</h1>
        <p className="text-gray-500 mt-1">Ringkasan sistem KopiERP Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Total Customer */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveTab('customer')}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Total Customer</p>
            <h3 className="text-3xl font-bold text-gray-900">{customers.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card Menu Aktif */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveTab('product')}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Menu Aktif</p>
            <h3 className="text-3xl font-bold text-gray-900">{products.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
        </div>

        {/* Card Sales Order */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveTab('so')}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Sales Order</p>
            <h3 className="text-3xl font-bold text-gray-900">{salesOrders.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Card Purchase Order */}
        <div 
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveTab('po')}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Purchase Order</p>
            <h3 className="text-3xl font-bold text-gray-900">{purchaseOrders.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Coffee className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistem Manajemen Kedai Kopi (Mini ERP)</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Gunakan menu navigasi di sebelah kiri untuk mengelola Data Master (Vendor, Customer, Inventory, Produk), mencatat Transaksi (Sales Order & Purchase Order), mencetak Invoice, dan melihat Laporan Keuangan secara real-time.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
