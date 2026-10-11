import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Printer } from 'lucide-react';

const InvoiceSO = ({ setActiveTab }) => {
  const { salesOrders, customers, settings } = useAppContext();
  const [so, setSo] = useState(null);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('print_so');
    if (id) {
      const foundSo = salesOrders.find(s => s.id === id);
      if (foundSo) {
        setSo(foundSo);
        const foundCustomer = customers.find(c => c.id === foundSo.customerId);
        setCustomer(foundCustomer);
      }
    }
  }, [salesOrders, customers]);

  if (!so) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-slate-300">Data Invoice tidak ditemukan.</h2>
        <button onClick={() => setActiveTab('so')} className="mt-4 text-amber-500 hover:underline">Kembali</button>
      </div>
    );
  }

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 print:max-w-none print:m-0 print:p-0">
      {/* Controls (Hidden on Print) */}
      <div className="flex justify-between items-center print:hidden mb-4">
        <button 
          onClick={() => setActiveTab('so')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={18} /> Kembali ke Data SO
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-blue-600/20"
        >
          <Printer size={18} /> Cetak Invoice
        </button>
      </div>

      {/* Invoice Layout */}
      <div className="bg-white text-slate-900 p-10 rounded-2xl shadow-xl print:shadow-none print:rounded-none print:p-8">
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-1 rounded-xl">
              <img src="/logo.png" alt="Percegi Coffee Logo" className="w-14 h-14 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-wide">{settings?.shopName || 'Percegi Coffee'}</h1>
              <p className="text-slate-500 text-sm whitespace-pre-wrap">{settings?.shopAddress || 'Jl. Kopi Nusantara No. 1, Jakarta'}</p>
              <p className="text-slate-500 text-sm">{settings?.shopPhone || '0812-3456-7890'}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-slate-200 mb-2 uppercase tracking-widest">INVOICE</h2>
            <p className="font-bold text-slate-800">{so.soNumber}</p>
            <p className="text-slate-500">Tanggal: {so.date}</p>
            <div className="mt-4 inline-block px-4 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              {so.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tagihan Kepada:</h3>
            <p className="font-bold text-lg text-slate-800">{customer?.name || 'Umum'}</p>
            <p className="text-slate-600">{customer?.phone}</p>
            <p className="text-slate-600 max-w-xs">{customer?.address}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 border-y border-slate-200 text-slate-600 uppercase text-sm font-bold tracking-wider">Item / Deskripsi</th>
              <th className="p-3 border-y border-slate-200 text-slate-600 uppercase text-sm font-bold tracking-wider text-right">Harga</th>
              <th className="p-3 border-y border-slate-200 text-slate-600 uppercase text-sm font-bold tracking-wider text-center">Qty</th>
              <th className="p-3 border-y border-slate-200 text-slate-600 uppercase text-sm font-bold tracking-wider text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {so.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-slate-200">
                <td className="p-3">
                  <div className="font-medium text-slate-800">{item.name}</div>
                  {(item.size || (item.temperature && item.temperature !== 'Normal') || (item.sugarLevel && item.sugarLevel !== 'Normal') || (item.shotCount > 0) || item.notes) && (
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                      {item.size && <span>• {item.size}</span>}
                      {item.temperature && item.temperature !== 'Normal' && <span>• {item.temperature}</span>}
                      {item.sugarLevel && item.sugarLevel !== 'Normal' && <span>• {item.sugarLevel}</span>}
                      {item.shotCount > 0 && <span>• Extra Shot</span>}
                      {item.notes && <span className="italic text-slate-400">({item.notes})</span>}
                    </div>
                  )}
                </td>
                <td className="p-3 text-right text-slate-600">{formatRp(item.price)}</td>
                <td className="p-3 text-center font-medium text-slate-800">{item.qty}</td>
                <td className="p-3 text-right font-bold text-slate-800">{formatRp(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Subtotal & Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-80">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-bold text-slate-800">{formatRp(so.subtotal || so.total)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Pajak ({so.taxType || 'Non Pajak'})</span>
              <span className="font-bold text-slate-800">{formatRp(so.taxAmount || 0)}</span>
            </div>
            {Number(so.shippingCost) > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Ongkos Kirim</span>
                <span className="font-bold text-slate-800">{formatRp(so.shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 mt-3 bg-amber-50 px-4 rounded-xl border border-amber-200">
              <span className="font-black text-amber-900 uppercase">Total Akhir</span>
              <span className="font-black text-amber-700 text-xl">{formatRp(so.total)}</span>
            </div>
          </div>
        </div>

        {/* Informasi Pembayaran / Transfer (Di Bawah Total Akhir) */}
        <div className="mb-10 bg-slate-50 border border-slate-200/90 rounded-2xl p-5 print:bg-white print:border-slate-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Informasi Pembayaran / Transfer</h4>
          </div>

          {settings?.bankAccountNumber ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Box Rincian Rekening */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:border-slate-300 flex flex-col justify-center">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Nama Bank</span>
                  <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">{settings.bankName || 'BCA'}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase">No. Rekening</span>
                  <span className="text-base font-black tracking-wider text-amber-700 font-mono">{settings.bankAccountNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Atas Nama</span>
                  <span className="text-sm font-bold text-slate-800">{settings.bankAccountName || settings.shopName || '-'}</span>
                </div>
              </div>

              {/* Box Kalimat Petunjuk & Instruksi */}
              <div className="text-xs text-slate-700 leading-relaxed bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 flex flex-col justify-between">
                <p className="font-semibold text-amber-950 mb-2">
                  {settings.paymentNotes || 'Pembayaran dapat ditransfer melalui rekening resmi di atas.'}
                </p>
                <div className="text-slate-600 space-y-1 text-xs pt-2 border-t border-amber-200/60">
                  <p>• Cantumkan no. invoice: <span className="font-bold text-slate-900 font-mono">{so.soNumber}</span> pada berita transfer</p>
                  <p>• Konfirmasi bukti transfer ke WA: <span className="font-bold text-slate-900">{settings.shopPhone || 'kontak toko'}</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-600 bg-white p-4 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-700 mb-1">Transfer Bank:</p>
              <p className="text-slate-500">
                Silakan hubungi kasir/admin di {settings?.shopPhone || 'kontak toko'} untuk nomor rekening tujuan pembayaran atau atur di menu Pengaturan Invoice.
              </p>
            </div>
          )}
        </div>

        <div className="text-center text-slate-400 text-sm border-t border-slate-200 pt-8">
          <p className="font-medium text-slate-500 mb-1">Terima kasih atas pesanan Anda!</p>
          <p>Jika Anda memiliki pertanyaan mengenai invoice ini, silakan hubungi kontak di atas.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSO;
