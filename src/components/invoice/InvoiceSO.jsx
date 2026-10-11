import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Printer } from 'lucide-react';

const InvoiceSO = ({ setActiveTab }) => {
  const { salesOrders, customers, settings } = useAppContext();
  const [so, setSo] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [paymentOnPageTwo, setPaymentOnPageTwo] = useState(false);

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
      <div className="flex flex-wrap justify-between items-center gap-4 print:hidden mb-2">
        <button 
          onClick={() => setActiveTab('so')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={18} /> Kembali ke Data SO
        </button>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 cursor-pointer select-none transition-colors">
            <input 
              type="checkbox" 
              checked={paymentOnPageTwo} 
              onChange={(e) => setPaymentOnPageTwo(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
            />
            <span>Pindahkan Pembayaran ke Halaman 2</span>
          </label>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-blue-600/20"
          >
            <Printer size={18} /> Cetak Invoice
          </button>
        </div>
      </div>

      {/* Invoice Layout */}
      <div className="bg-white text-slate-900 p-10 rounded-2xl shadow-xl print:shadow-none print:rounded-none print:p-6">
        {/* Header Toko & Invoice */}
        <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6 print:pb-3 print:mb-3">
          <div className="flex items-center gap-4">
            <div className="p-1 rounded-xl">
              <img src="/logo.png" alt="Percegi Coffee Logo" className="w-14 h-14 print:w-11 print:h-11 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl print:text-xl font-bold text-slate-900 tracking-wide">{settings?.shopName || 'Percegi Coffee'}</h1>
              <p className="text-slate-500 text-sm print:text-xs whitespace-pre-wrap">{settings?.shopAddress || 'Jl. Kopi Nusantara No. 1, Jakarta'}</p>
              <p className="text-slate-500 text-sm print:text-xs">{settings?.shopPhone || '0812-3456-7890'}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl print:text-2xl font-black text-slate-200 mb-1 uppercase tracking-widest">INVOICE</h2>
            <p className="font-bold text-slate-800 print:text-sm">{so.soNumber}</p>
            <p className="text-slate-500 print:text-xs">Tanggal: {so.date}</p>
            <div className="mt-2 inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              {so.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Tagihan Kepada */}
        <div className="flex justify-between mb-6 print:mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tagihan Kepada:</h3>
            <p className="font-bold text-base print:text-sm text-slate-800">{customer?.name || 'Umum'}</p>
            <p className="text-slate-600 text-sm print:text-xs">{customer?.phone}</p>
            <p className="text-slate-600 text-sm print:text-xs max-w-xs">{customer?.address}</p>
          </div>
        </div>

        {/* Tabel Item Pesanan */}
        <table className="w-full text-left border-collapse mb-6 print:mb-3">
          <thead>
            <tr className="bg-slate-50 print:bg-slate-100">
              <th className="p-3 print:py-1.5 print:px-2 border-y border-slate-200 text-slate-600 uppercase text-xs font-bold tracking-wider">Item / Deskripsi</th>
              <th className="p-3 print:py-1.5 print:px-2 border-y border-slate-200 text-slate-600 uppercase text-xs font-bold tracking-wider text-right">Harga</th>
              <th className="p-3 print:py-1.5 print:px-2 border-y border-slate-200 text-slate-600 uppercase text-xs font-bold tracking-wider text-center">Qty</th>
              <th className="p-3 print:py-1.5 print:px-2 border-y border-slate-200 text-slate-600 uppercase text-xs font-bold tracking-wider text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {so.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-slate-200 print-break-avoid">
                <td className="p-3 print:py-1.5 print:px-2">
                  <div className="font-medium text-slate-800 text-sm print:text-xs">{item.name}</div>
                  {(item.size || (item.temperature && item.temperature !== 'Normal') || (item.sugarLevel && item.sugarLevel !== 'Normal') || (item.shotCount > 0) || item.notes) && (
                    <div className="text-[11px] print:text-[10px] text-slate-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      {item.size && <span>• {item.size}</span>}
                      {item.temperature && item.temperature !== 'Normal' && <span>• {item.temperature}</span>}
                      {item.sugarLevel && item.sugarLevel !== 'Normal' && <span>• {item.sugarLevel}</span>}
                      {item.shotCount > 0 && <span>• Extra Shot</span>}
                      {item.notes && <span className="italic text-slate-400">({item.notes})</span>}
                    </div>
                  )}
                </td>
                <td className="p-3 print:py-1.5 print:px-2 text-right text-slate-600 text-sm print:text-xs">{formatRp(item.price)}</td>
                <td className="p-3 print:py-1.5 print:px-2 text-center font-medium text-slate-800 text-sm print:text-xs">{item.qty}</td>
                <td className="p-3 print:py-1.5 print:px-2 text-right font-bold text-slate-800 text-sm print:text-xs">{formatRp(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Subtotal & Totals */}
        <div className="flex justify-end mb-6 print:mb-3 print-break-avoid">
          <div className="w-full sm:w-80">
            <div className="flex justify-between py-1.5 print:py-1 border-b border-slate-200 text-sm print:text-xs">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-bold text-slate-800">{formatRp(so.subtotal || so.total)}</span>
            </div>
            <div className="flex justify-between py-1.5 print:py-1 border-b border-slate-200 text-sm print:text-xs">
              <span className="text-slate-600 font-medium">Pajak ({so.taxType || 'Non Pajak'})</span>
              <span className="font-bold text-slate-800">{formatRp(so.taxAmount || 0)}</span>
            </div>
            {Number(so.shippingCost) > 0 && (
              <div className="flex justify-between py-1.5 print:py-1 border-b border-slate-200 text-sm print:text-xs">
                <span className="text-slate-600 font-medium">Ongkos Kirim</span>
                <span className="font-bold text-slate-800">{formatRp(so.shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between py-2.5 print:py-1.5 mt-2 print:mt-1 bg-amber-50 px-3.5 print:px-3 rounded-xl border border-amber-200">
              <span className="font-black text-amber-900 uppercase text-sm print:text-xs">Total Akhir</span>
              <span className="font-black text-amber-700 text-lg print:text-base">{formatRp(so.total)}</span>
            </div>
          </div>
        </div>

        {/* Informasi Pembayaran / Transfer (Di Bawah Total Akhir & Anti Potong) */}
        <div className={`mb-8 print:mb-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 print:bg-white print:border-slate-300 print:p-3 print-break-avoid ${
          paymentOnPageTwo ? 'print-page-break' : ''
        }`}>
          <div className="flex items-center gap-2 mb-2.5 print:mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Informasi Pembayaran / Transfer</h4>
          </div>

          {settings?.bankAccountNumber ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 print:gap-2.5 items-stretch">
              {/* Box Rincian Rekening */}
              <div className="bg-white p-3.5 print:p-2.5 rounded-xl border border-slate-200 shadow-xs print:border-slate-300 flex flex-col justify-center">
                <div className="flex justify-between items-center pb-1.5 print:pb-1 border-b border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Nama Bank</span>
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{settings.bankName || 'BCA'}</span>
                </div>
                <div className="flex justify-between items-center py-2 print:py-1 border-b border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">No. Rekening</span>
                  <span className="text-sm print:text-xs font-black tracking-wider text-amber-700 font-mono">{settings.bankAccountNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 print:pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Atas Nama</span>
                  <span className="text-xs font-bold text-slate-800">{settings.bankAccountName || settings.shopName || '-'}</span>
                </div>
              </div>

              {/* Box Kalimat Petunjuk & Instruksi */}
              <div className="text-xs print:text-[11px] text-slate-700 leading-relaxed bg-amber-50/70 p-3.5 print:p-2.5 rounded-xl border border-amber-200/80 flex flex-col justify-between">
                <p className="font-semibold text-amber-950 mb-1.5 print:mb-1">
                  {settings.paymentNotes || 'Pembayaran dapat ditransfer melalui rekening resmi di atas.'}
                </p>
                <div className="text-slate-600 space-y-0.5 text-[11px] print:text-[10px] pt-1.5 print:pt-1 border-t border-amber-200/60">
                  <p>• Cantumkan no. invoice: <span className="font-bold text-slate-900 font-mono">{so.soNumber}</span> pada berita transfer</p>
                  <p>• Konfirmasi bukti transfer ke WA: <span className="font-bold text-slate-900">{settings.shopPhone || 'kontak toko'}</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-600 bg-white p-3.5 print:p-2 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-700 mb-1">Transfer Bank:</p>
              <p className="text-slate-500">
                Silakan hubungi kasir/admin di {settings?.shopPhone || 'kontak toko'} untuk nomor rekening tujuan pembayaran atau atur di menu Pengaturan Invoice.
              </p>
            </div>
          )}
        </div>

        {/* Footer Invoice */}
        <div className="text-center text-slate-400 text-xs print:text-[11px] border-t border-slate-200 pt-6 print:pt-2.5 print-break-avoid">
          <p className="font-medium text-slate-500 mb-0.5">Terima kasih atas pesanan Anda!</p>
          <p>Jika Anda memiliki pertanyaan mengenai invoice ini, silakan hubungi kontak di atas.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSO;
