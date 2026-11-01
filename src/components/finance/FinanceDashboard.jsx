import React, { useMemo } from 'react';
import Swal from 'sweetalert2';
import { useAppContext } from '../../context/AppContext';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Clock, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FinanceDashboard = () => {
  const { salesOrders, purchaseOrders, reviewSalesOrder } = useAppContext();
  const { currentUser, hasAccess } = useAuth();
  const canApprove = hasAccess('finance');
  const pendingApprovals = salesOrders.filter(so => so.approvalStatus === 'Menunggu Finance');
  const handleReview = async (so, decision) => {
    let note = '';
    if (decision === 'Ditolak') {
      const result = await Swal.fire({
        title: 'Tolak Sales Order?',
        input: 'textarea',
        inputLabel: 'Alasan penolakan',
        inputPlaceholder: 'Tuliskan alasan agar dapat ditindaklanjuti',
        inputValidator: value => value?.trim() ? undefined : 'Alasan penolakan wajib diisi.',
        showCancelButton: true,
        confirmButtonText: 'Tolak SO',
        cancelButtonText: 'Batal'
      });
      if (!result.isConfirmed) return;
      note = result.value.trim();
    }
    try {
      await reviewSalesOrder(so.id, decision, currentUser?.name || currentUser?.username || 'Finance', note);
      await Swal.fire('Berhasil', `SO ${decision.toLowerCase()}.`, 'success');
    } catch (error) {
      Swal.fire('Gagal', error.message || 'Gagal memproses approval SO.', 'error');
    }
  };

  // Calculate totals
  const { totalRevenue, totalExpense, profit, totalOutstanding, outstandingCount } = useMemo(() => {
    const revenue = salesOrders
      .filter(so => (so.status || '').toLowerCase() === 'lunas')
      .reduce((sum, so) => sum + (so.total || 0), 0);

    const expense = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);

    const outstandingSOs = salesOrders.filter(so => {
      const st = (so.status || '').toLowerCase();
      return st === 'belum lunas' || st === 'pending' || st === 'onhold' || st === 'on hold';
    });
    const outstanding = outstandingSOs.reduce((sum, so) => sum + (so.total || 0), 0);

    return {
      totalRevenue: revenue,
      totalExpense: expense,
      profit: revenue - expense,
      totalOutstanding: outstanding,
      outstandingCount: outstandingSOs.length
    };
  }, [salesOrders, purchaseOrders]);

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-500 mt-1">Ringkasan pendapatan, piutang tertunggak (Belum Lunas/Onhold), dan pengeluaran.</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Approval Sales Order</h2>
            <p className="text-sm text-gray-500">SO menunggu keputusan Finance</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">{pendingApprovals.length} menunggu</span>
        </div>
        <div className="space-y-3">
          {pendingApprovals.map(so => (
            <article key={so.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4">
              <div>
                <p className="font-bold text-gray-900">{so.soNumber}</p>
                <p className="text-sm text-gray-500">{so.date} · {formatRp(so.total)} · Pembayaran: {so.status || 'Belum Lunas'}{so.status === 'Onhold' ? ' (perlu cek piutang customer)' : ''}</p>
                {so.approvalStatus === 'Ditolak' && <p className="text-xs text-rose-600">Ditolak: {so.approvalNote || 'Perlu revisi'}</p>}
              </div>
              {canApprove ? (
                <div className="flex gap-2">
                  <button onClick={() => handleReview(so, 'Disetujui')} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Check size={16}/> Setujui</button>
                  <button onClick={() => handleReview(so, 'Ditolak')} className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"><X size={16}/> Tolak</button>
                </div>
              ) : <span className="text-xs text-gray-400">Tidak memiliki akses approval</span>}
            </article>
          ))}
          {pendingApprovals.length === 0 && <p className="py-5 text-center text-sm text-gray-400">Tidak ada SO menunggu approval.</p>}
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden group border border-gray-100 hover:border-emerald-200 transition-colors">
          <div className="absolute -right-6 -top-6 text-emerald-50 group-hover:text-emerald-100 transition-colors">
            <TrendingUp size={120} />
          </div>
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium relative z-10">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp size={24} /></div>
            Total Pendapatan (Lunas)
          </div>
          <div className="text-2xl font-black text-gray-900 relative z-10">{formatRp(totalRevenue)}</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden group border border-gray-100 hover:border-amber-200 transition-colors">
          <div className="absolute -right-6 -top-6 text-amber-50 group-hover:text-amber-100 transition-colors">
            <Clock size={120} />
          </div>
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium relative z-10">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock size={24} /></div>
            Piutang Belum Lunas / Onhold
          </div>
          <div className="text-2xl font-black text-amber-700 relative z-10">{formatRp(totalOutstanding)}</div>
          <p className="text-xs text-amber-600 mt-1 relative z-10 font-semibold">{outstandingCount} transaksi outstanding</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md relative overflow-hidden group border border-gray-100 hover:border-rose-200 transition-colors">
          <div className="absolute -right-6 -top-6 text-rose-50 group-hover:text-rose-100 transition-colors">
            <TrendingDown size={120} />
          </div>
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium relative z-10">
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><TrendingDown size={24} /></div>
            Total Pengeluaran (PO)
          </div>
          <div className="text-2xl font-black text-gray-900 relative z-10">{formatRp(totalExpense)}</div>
        </div>

        <div className={`bg-white rounded-2xl p-6 shadow-md relative overflow-hidden group border border-gray-100 transition-colors ${profit >= 0 ? 'hover:border-blue-200' : 'hover:border-rose-200'}`}>
          <div className={`absolute -right-6 -top-6 transition-colors ${profit >= 0 ? 'text-blue-50 group-hover:text-blue-100' : 'text-rose-50 group-hover:text-rose-100'}`}>
            <Wallet size={120} />
          </div>
          <div className="flex items-center gap-3 text-gray-500 mb-2 font-medium relative z-10">
            <div className={`p-2 rounded-lg ${profit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign size={24} />
            </div>
            Laba/Rugi Bersih
          </div>
          <div className={`text-2xl font-black relative z-10 ${profit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
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
