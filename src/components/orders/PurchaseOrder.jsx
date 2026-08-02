import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, X, ShoppingCart, Check, FileText, Edit, Trash2, Search } from 'lucide-react';

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
      alert("Pilih minimal 1 item!");
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
    if (window.confirm('Yakin ingin menghapus Purchase Order ini? Stok inventory akan dikurangi kembali.')) {
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
    }
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
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 rounded-xl w-full max-w-3xl shadow-2xl animate-popup">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Purchase Order' : 'Buat Purchase Order Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Supplier)</label>
                  <select 
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}
                  >
                    <option value="">Pilih Vendor...</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                  <select 
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Hutang">Hutang (Belum Lunas)</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pajak</label>
                  <select 
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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

              <div className="border border-gray-200 p-4 rounded-xl bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Item Pembelian</h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4 items-end">
                  <div className="sm:col-span-5">
                    <select 
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      value={selectedInventory} onChange={handleInventoryChange}
                    >
                      <option value="">Pilih Barang...</option>
                      {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (Stok: {i.stock} {i.unit})</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <input 
                      type="number" min="0" placeholder="Harga Satuan"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      value={price} onChange={e => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input 
                      type="number" min="0.01" step="0.01" placeholder="Qty"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      value={qty} onChange={e => setQty(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button 
                      type="button" onClick={addItem}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      Tambah
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr className="text-gray-600">
                        <th className="p-2 font-medium border-b border-gray-200">Barang</th>
                        <th className="p-2 font-medium border-b border-gray-200 text-right">Harga Satuan</th>
                        <th className="p-2 font-medium border-b border-gray-200 text-right">Qty</th>
                        <th className="p-2 font-medium border-b border-gray-200 text-right">Subtotal</th>
                        <th className="p-2 font-medium border-b border-gray-200 text-center">x</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 last:border-0">
                          <td className="p-2 text-gray-800">{item.name}</td>
                          <td className="p-2 text-gray-600 text-right">{formatRp(item.price)}</td>
                          <td className="p-2 text-gray-800 text-right">{item.qty} {item.unit}</td>
                          <td className="p-2 text-rose-600 font-medium text-right">{formatRp(item.subtotal)}</td>
                          <td className="p-2 text-center">
                            <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                          </td>
                        </tr>
                      ))}
                      {formData.items.length === 0 && (
                        <tr><td colSpan="5" className="p-4 text-center text-gray-500">Belum ada item ditambahkan.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 font-medium">Subtotal:</span>
                    <span className="text-lg font-semibold text-gray-800">{formatRp(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 font-medium">Pajak ({formData.taxType} {formData.taxRate > 0 ? `+${formData.taxRate}%` : formData.taxRate < 0 ? `${formData.taxRate}%` : ''}):</span>
                    <span className="text-lg font-semibold text-gray-800">{formatRp(getTaxAmount())}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                    <span className="text-gray-700 font-bold">Total Pembelian:</span>
                    <span className="text-2xl font-bold text-rose-600">{formatRp(getTotal())}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-transparent"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm"
                >
                  {formData.id ? 'Simpan Perubahan' : 'Simpan PO'}
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
