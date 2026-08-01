import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, X, ShoppingCart, Check, FileText } from 'lucide-react';

const PurchaseOrder = ({ setActiveTab }) => {
  const { purchaseOrders, vendors, inventory, addPurchaseOrder, updatePurchaseOrder, updateInventory } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, vendorId: '', status: 'Hutang', items: [] 
  });
  
  const [selectedInventory, setSelectedInventory] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  const handleOpenModal = () => {
    setFormData({ id: null, vendorId: '', status: 'Hutang', items: [] });
    setIsModalOpen(true);
  };

  const handleInventoryChange = (e) => {
    const id = e.target.value;
    setSelectedInventory(id);
    const item = inventory.find(i => i.id === id);
    if (item) setPrice(item.price);
  };

  const addItem = () => {
    if (!selectedInventory || qty <= 0 || price < 0) return;
    const item = inventory.find(i => i.id === selectedInventory);
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

  const getTotal = () => formData.items.reduce((acc, item) => acc + item.subtotal, 0);

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert("Pilih minimal 1 item!");
      return;
    }
    
    const dataToSave = {
      vendorId: formData.vendorId,
      items: formData.items,
      total: getTotal(),
      status: formData.status
    };
    
    addPurchaseOrder(dataToSave);

    // Update Stock automatically
    formData.items.forEach(orderItem => {
      const invItem = inventory.find(i => i.id === orderItem.inventoryId);
      if (invItem) {
        updateInventory(invItem.id, { ...invItem, stock: invItem.stock + orderItem.qty });
      }
    });

    setIsModalOpen(false);
  };

  const markAsLunas = (id) => {
    updatePurchaseOrder(id, { status: 'Lunas' });
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const getVendorName = (id) => {
    const v = vendors.find(v => v.id === id);
    return v ? v.name : 'Unknown Vendor';
  };

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

      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
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
            {purchaseOrders.map(po => (
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
                    <button onClick={() => markAsLunas(po.id)} title="Tandai Lunas" className="text-emerald-500 hover:text-emerald-700 transition-colors p-1">
                      <Check size={18} />
                    </button>
                  )}
                  <button onClick={() => { localStorage.setItem('print_po', po.id); setActiveTab('invoice_po'); }} title="Cetak PO" className="text-blue-500 hover:text-blue-700 transition-colors p-1">
                    <FileText size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {purchaseOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada transaksi Purchase Order.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl animate-popup">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Buat Purchase Order Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="border border-gray-200 p-4 rounded-xl bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Item Pembelian</h3>
                <div className="flex gap-3 mb-4">
                  <select 
                    className="flex-[2] bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={selectedInventory} onChange={handleInventoryChange}
                  >
                    <option value="">Pilih Barang...</option>
                    {inventory.map(i => <option key={i.id} value={i.id}>{i.name} (Stok: {i.stock} {i.unit})</option>)}
                  </select>
                  <input 
                    type="number" min="0" placeholder="Harga Satuan"
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={price} onChange={e => setPrice(e.target.value)}
                  />
                  <input 
                    type="number" min="0.01" step="0.01" placeholder="Qty"
                    className="w-24 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={qty} onChange={e => setQty(e.target.value)}
                  />
                  <button 
                    type="button" onClick={addItem}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Tambah
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-sm text-left border-collapse">
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
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className="text-gray-700 font-medium">Total Pembelian:</span>
                  <span className="text-2xl font-bold text-rose-600">{formatRp(getTotal())}</span>
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
                  Simpan PO
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
