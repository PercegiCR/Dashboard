import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, X, ShoppingCart, Check, FileText, Edit, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const PurchaseOrder = ({ setActiveTab }) => {
  const { purchaseOrders, vendors, inventory, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, updateInventory } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, vendorId: '', status: 'Hutang', items: [], taxType: 'Non Pajak', taxRate: 0 
  });
  
  const [selectedInventory, setSelectedInventory] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = () => {
    setFormData({ id: null, vendorId: '', status: 'Hutang', items: [], taxType: 'Non Pajak', taxRate: 0 });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleOpen = () => handleOpenModal();
    window.addEventListener('open-po-modal', handleOpen);
    return () => window.removeEventListener('open-po-modal', handleOpen);
  }, []);

  const handleEditModal = (po) => {
    setFormData({
      id: po.id,
      vendorId: po.vendorId,
      status: po.status,
      items: [...po.items],
      taxType: po.taxType || 'Non Pajak',
      taxRate: po.taxRate || 0
    });
    setIsModalOpen(true);
  };

  const handleInventoryChange = (e) => {
    const id = e.target.value;
    setSelectedInventory(id);
    const item = inventory.find(i => String(i.id) === String(id));
    if (item) setPrice(item.price);
  };

  const addItem = () => {
    if (!selectedInventory || qty <= 0 || price < 0) return;
    const item = inventory.find(i => String(i.id) === String(selectedInventory));
    if (!item) return;

    const newItem = {
      inventoryId: item.id,
      name: item.name,
      price: Number(price),
      qty: Number(qty),
      subtotal: Number(price) * Number(qty),
      unit: item.unit
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    setSelectedInventory('');
    setQty(1);
    setPrice(0);
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const getSubtotal = () => formData.items.reduce((acc, item) => acc + item.subtotal, 0);
  const getTaxAmount = () => getSubtotal() * (formData.taxRate / 100);
  const getTotal = () => getSubtotal() + getTaxAmount();

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      Swal.fire('Perhatian', 'Pilih minimal 1 item!', 'warning');
      return;
    }
    
    const dataToSave = {
      vendorId: formData.vendorId,
      items: formData.items,
      subtotal: getSubtotal(),
      taxType: formData.taxType,
      taxRate: formData.taxRate,
      taxAmount: getTaxAmount(),
      total: getTotal(),
      status: formData.status
    };
    
    if (formData.id) {
      updatePurchaseOrder(formData.id, dataToSave);
    } else {
      addPurchaseOrder(dataToSave);

      // Update Stock automatically
      formData.items.forEach(orderItem => {
        const invItem = inventory.find(i => i.id === orderItem.inventoryId);
        if (invItem) {
          updateInventory(invItem.id, { ...invItem, stock: invItem.stock + orderItem.qty });
        }
      });
    }

    setIsModalOpen(false);
  };

  const markAsLunas = (id) => {
    updatePurchaseOrder(id, { status: 'Lunas' });
  };

  const handleDeletePO = (id) => {
    Swal.fire({
      title: 'Hapus Purchase Order?',
      text: "Yakin ingin menghapus Purchase Order ini? Stok inventory akan dikurangi kembali.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const po = purchaseOrders.find(p => p.id === id);
        if (po) {
          po.items.forEach(orderItem => {
            const invItem = inventory.find(i => i.id === orderItem.inventoryId);
            if (invItem) {
              updateInventory(invItem.id, { ...invItem, stock: invItem.stock - orderItem.qty });
            }
          });
        }
        deletePurchaseOrder(id);
        Swal.fire('Terhapus!', 'Purchase Order berhasil dihapus.', 'success');
      }
    });
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const getVendorName = (id) => {
    const v = vendors.find(v => v.id === id);
    return v ? v.name : 'Unknown Vendor';
  };

  const filteredpurchaseOrders = purchaseOrders.filter(item => {
    const venName = getVendorName(item.vendorId);
    const searchStr = `${item.poNumber} ${item.date} ${venName} ${item.status} ${item.total}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order (PO)</h1>
          <p className="text-gray-500 mt-1">Catat transaksi pembelian ke supplier.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
        >
          <ShoppingCart size={18} /> Buat PO
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari Purchase Order..." 
          className="w-full outline-none text-gray-700 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-semibold">No. PO</th>
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Vendor</th>
              <th className="p-4 font-semibold text-right">Total</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredpurchaseOrders.map(po => (
              <tr key={po.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-gray-700">
                <td className="p-4 font-mono text-sm text-amber-600 font-bold">{po.poNumber}</td>
                <td className="p-4">{po.date}</td>
                <td className="p-4 font-medium text-gray-900">{getVendorName(po.vendorId)}</td>
                <td className="p-4 text-right font-bold text-rose-600">{formatRp(po.total)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${po.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {po.status}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-3">
                  {po.status === 'Hutang' && (
                    <>
                      <button onClick={() => markAsLunas(po.id)} title="Tandai Lunas" className="text-emerald-500 hover:text-emerald-700 transition-colors p-1">
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleEditModal(po)} title="Edit PO" className="text-amber-500 hover:text-amber-700 transition-colors p-1">
                        <Edit size={18} />
                      </button>
                    </>
                  )}
                  <button onClick={() => { localStorage.setItem('print_po', po.id); setActiveTab('invoice_po'); }} title="Cetak PO" className="text-blue-500 hover:text-blue-700 transition-colors p-1">
                    <FileText size={18} />
                  </button>
                  <button onClick={() => handleDeletePO(po.id)} title="Hapus PO" className="text-red-500 hover:text-red-700 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredpurchaseOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada transaksi Purchase Order.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-4xl shadow-2xl ring-1 ring-gray-900/5 animate-popup max-h-[95vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.id ? 'Edit Purchase Order' : 'Buat Purchase Order Baru'}</h2>
                <p className="text-sm text-gray-500 mt-1">Lengkapi form di bawah untuk memproses pembelian.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vendor (Supplier)</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}
                  >
                    <option value="">Pilih Vendor...</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Pembayaran</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Hutang">Hutang (Belum Lunas)</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pajak</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={`${formData.taxType}|${formData.taxRate}`} 
                    onChange={e => {
                      const [type, rate] = e.target.value.split('|');
                      setFormData({...formData, taxType: type, taxRate: Number(rate)});
                    }}
                  >
                    <option value="Non Pajak|0">Non Pajak (0%)</option>
                    <option value="PPN|11">PPN (11%)</option>
                    <option value="PPN|12">PPN (12%)</option>
                    <option value="PPh|-2">PPh (-2%)</option>
                    <option value="PPh|-2.5">PPh (-2.5%)</option>
                  </select>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl bg-gray-50/50 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ShoppingCart size={18} className="text-rose-600"/> Item Pembelian
                  </h3>
                  
                  <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Barang</label>
                        <select 
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={selectedInventory} onChange={handleInventoryChange}
                        >
                          <option value="">Pilih Barang...</option>
                          {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (Stok: {i.stock} {i.unit})</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Harga Satuan</label>
                        <input 
                          type="number" min="0" placeholder="Harga Satuan"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={price} onChange={e => setPrice(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Qty</label>
                        <input 
                          type="number" min="0.01" step="0.01" placeholder="Qty"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={qty} onChange={e => setQty(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button 
                          type="button" onClick={addItem}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 h-[38px]"
                        >
                          <Plus size={16} /> Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto overflow-x-auto custom-scrollbar bg-white">
                  <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
                      <tr className="text-gray-500 uppercase tracking-wider text-xs">
                        <th className="p-3 font-semibold border-b border-gray-200">Barang</th>
                        <th className="p-3 font-semibold border-b border-gray-200 text-right">Harga Satuan</th>
                        <th className="p-3 font-semibold border-b border-gray-200 text-center">Qty</th>
                        <th className="p-3 font-semibold border-b border-gray-200 text-right">Subtotal</th>
                        <th className="p-3 font-semibold border-b border-gray-200 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3 text-gray-800 font-semibold">{item.name}</td>
                          <td className="p-3 text-gray-600 text-right">{formatRp(item.price)}</td>
                          <td className="p-3 text-gray-800 text-center font-medium bg-gray-50/50">{item.qty} {item.unit}</td>
                          <td className="p-3 text-rose-600 font-bold text-right">{formatRp(item.subtotal)}</td>
                          <td className="p-3 text-center">
                            <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {formData.items.length === 0 && (
                        <tr><td colSpan="5" className="p-10 text-center text-gray-400">Belum ada item ditambahkan. Silahkan tambah item di atas.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col gap-2 max-w-sm ml-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium text-sm">Subtotal</span>
                      <span className="text-gray-800 font-semibold">{formatRp(getSubtotal())}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium text-sm">Pajak ({formData.taxType} {formData.taxRate > 0 ? `+${formData.taxRate}%` : formData.taxRate < 0 ? `${formData.taxRate}%` : ''})</span>
                      <span className="text-gray-800 font-semibold">{formatRp(getTaxAmount())}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-200">
                      <span className="text-gray-800 font-bold">Total Pembelian</span>
                      <span className="text-2xl font-black text-rose-600">{formatRp(getTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Check size={18} /> {formData.id ? 'Simpan Perubahan' : 'Simpan PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
