import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, Printer } from 'lucide-react';

const InvoicePO = ({ setActiveTab }) => {
  const { purchaseOrders, vendors, settings } = useAppContext();
  const [po, setPo] = useState(null);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('print_po');
    if (id) {
      const foundPo = purchaseOrders.find(p => p.id === id);
      if (foundPo) {
        setPo(foundPo);
        const foundVendor = vendors.find(v => v.id === foundPo.vendorId);
        setVendor(foundVendor);
      }
    }
  }, [purchaseOrders, vendors]);

  if (!po) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-slate-300">Data PO tidak ditemukan.</h2>
        <button onClick={() => setActiveTab('po')} className="mt-4 text-amber-500 hover:underline">Kembali</button>
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
          onClick={() => setActiveTab('po')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={18} /> Kembali ke Data PO
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-blue-600/20"
        >
          <Printer size={18} /> Cetak PO
        </button>
      </div>

      {/* PO Layout */}
      <div className="bg-white text-slate-900 p-10 rounded-2xl shadow-xl print:shadow-none print:rounded-none print:p-0">
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
            <h2 className="text-4xl font-black text-slate-200 mb-2 uppercase tracking-widest">PURCHASE ORDER</h2>
            <p className="font-bold text-slate-800">{po.poNumber}</p>
            <p className="text-slate-500">Tanggal: {po.date}</p>
            <div className={`mt-4 inline-block px-4 py-1 rounded-full text-sm font-bold border ${po.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
              STATUS: {po.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Kepada Yth (Vendor):</h3>
            <p className="font-bold text-lg text-slate-800">{vendor?.name || 'Unknown Vendor'}</p>
            <p className="text-slate-600">{vendor?.contact} - {vendor?.phone}</p>
            <p className="text-slate-600 max-w-xs">{vendor?.address}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 border-y border-slate-200 text-slate-600 uppercase text-sm font-bold tracking-wider">Deskripsi Barang</th>
              <th className="p-3 border-y border-slate-200 text-slate-600 uppercase text-sm font-bold tracking-wider text-right">Harga Satuan</th>
              <th className="p-3 border-y border-slate-200 text-slate-600 uppercase text-sm font-bold tracking-wider text-center">Qty</th>
              <th className="p-3 border-y border-slate-200 text-slate-600 uppercase text-sm font-bold tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {po.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-slate-200">
                <td className="p-3 font-medium text-slate-800">{item.name}</td>
                <td className="p-3 text-right text-slate-600">{formatRp(item.price)}</td>
                <td className="p-3 text-center font-medium text-slate-800">{item.qty} {item.unit}</td>
                <td className="p-3 text-right font-bold text-slate-800">{formatRp(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-bold text-slate-800">{formatRp(po.subtotal || po.total)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 font-medium">Pajak ({po.taxType || 'Non Pajak'})</span>
              <span className="font-bold text-slate-800">{formatRp(po.taxAmount || 0)}</span>
            </div>
            <div className="flex justify-between py-3 mt-2 bg-indigo-50 px-3 rounded-lg border border-indigo-100">
              <span className="font-black text-indigo-900 uppercase">Total Pesanan</span>
              <span className="font-black text-indigo-700 text-xl">{formatRp(po.total)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 text-center mt-16 pt-8">
          <div>
            <p className="mb-16 font-medium text-slate-600">Disetujui Oleh,</p>
            <div className="w-48 mx-auto border-b border-slate-400"></div>
            <p className="mt-2 text-sm text-slate-500">Manajer Operasional</p>
          </div>
          <div>
            <p className="mb-16 font-medium text-slate-600">Diterima Oleh,</p>
            <div className="w-48 mx-auto border-b border-slate-400"></div>
            <p className="mt-2 text-sm text-slate-500">Vendor / Supplier</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoicePO;
