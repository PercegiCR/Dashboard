import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';

const FinanceDashboard = () => {
  const { salesOrders, purchaseOrders } = useAppContext();

  // Calculate totals
  const { totalRevenue, totalExpense, profit } = useMemo(() => {
    const revenue = salesOrders
      .filter(so => so.status === 'Lunas')
      .reduce((sum, so) => sum + so.total, 0);

    const expense = purchaseOrders.reduce((sum, po) => sum + po.total, 0);

    return {
      totalRevenue: revenue,
      totalExpense: expense,
      profit: revenue - expense
    };
  }, [salesOrders, purchaseOrders]);

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-500 mt-1">Ringkasan pendapatan dan pengeluaran secara real-time.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md relative overflow-hidden group border border-gray-100 hover:border-emerald-200 transition-colors">
          <div className="absolute -right-6 -top-6 text-emerald-50 group-hover:text-emerald-100 transition-colors">
            <TrendingUp size={120} />
          </div>
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium relative z-10">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp size={24} /></div>
            Total Pendapatan (Lunas)
          </div>
          <div className="text-3xl font-bold text-gray-900 relative z-10">{formatRp(totalRevenue)}</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md relative overflow-hidden group border border-gray-100 hover:border-rose-200 transition-colors">
          <div className="absolute -right-6 -top-6 text-rose-50 group-hover:text-rose-100 transition-colors">
            <TrendingDown size={120} />
          </div>
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium relative z-10">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><TrendingDown size={24} /></div>
            Total Pengeluaran (PO)
          </div>
          <div className="text-3xl font-bold text-gray-900 relative z-10">{formatRp(totalExpense)}</div>
        </div>

        <div className={`bg-white rounded-lg p-6 shadow-md relative overflow-hidden group border border-gray-100 transition-colors ${profit >= 0 ? 'hover:border-amber-200' : 'hover:border-rose-200'}`}>
          <div className={`absolute -right-6 -top-6 transition-colors ${profit >= 0 ? 'text-amber-50 group-hover:text-amber-100' : 'text-rose-50 group-hover:text-rose-100'}`}>
            <Wallet size={120} />
          </div>
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium relative z-10">
            <div className={`p-2 rounded-lg ${profit >= 0 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign size={24} />
            </div>
            Laba/Rugi Kotor
          </div>
          <div className={`text-3xl font-bold relative z-10 ${profit >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
            {formatRp(profit)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Recent Revenue List */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            Pendapatan Terakhir (Lunas)
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col gap-3">
              {salesOrders.filter(so => so.status === 'Lunas').slice().reverse().map(so => (
                <div key={so.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
                  <div>
                    <div className="font-bold text-gray-900">{so.soNumber}</div>
                    <div className="text-sm text-gray-500">{so.date}</div>
                  </div>
                  <div className="font-bold text-emerald-600">{formatRp(so.total)}</div>
                </div>
              ))}
              {salesOrders.filter(so => so.status === 'Lunas').length === 0 && (
                <div className="text-center text-gray-500 py-8">Belum ada pendapatan Lunas.</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
            Pengeluaran Terakhir (PO)
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col gap-3">
              {purchaseOrders.slice().reverse().map(po => (
                <div key={po.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
                  <div>
                    <div className="font-bold text-gray-900">{po.poNumber}</div>
                    <div className="text-sm text-gray-500">{po.date} • {po.status}</div>
                  </div>
                  <div className="font-bold text-rose-600">{formatRp(po.total)}</div>
                </div>
              ))}
              {purchaseOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">Belum ada pengeluaran.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
