import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, X, ShoppingCart, Check, FileText, Edit, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const SalesOrder = ({ setActiveTab }) => {
  const { salesOrders, customers, products, addSalesOrder, updateSalesOrder, deleteSalesOrder } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, customerId: '', status: 'Pending', items: [], taxType: 'Non Pajak', taxRate: 0 
  });
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [sugarLevel, setSugarLevel] = useState('Normal');
  const [shotCount, setShotCount] = useState(0);
  const [size, setSize] = useState('150 ml');
  const [searchTerm, setSearchTerm] = useState('');
  const [extraShotCost, setExtraShotCost] = useState(0);
  const [temperature, setTemperature] = useState('Normal');

  const handleOpenModal = () => {
    setFormData({ id: null, customerId: '', status: 'Pending', items: [], taxType: 'Non Pajak', taxRate: 0 });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleOpen = () => handleOpenModal();
    window.addEventListener('open-so-modal', handleOpen);
    return () => window.removeEventListener('open-so-modal', handleOpen);
  }, []);

  const handleEditModal = (so) => {
    setFormData({
      id: so.id,
      customerId: so.customerId,
      status: so.status,
      items: [...so.items],
      taxType: so.taxType || 'Non Pajak',
      taxRate: so.taxRate || 0
    });
    setIsModalOpen(true);
  };

  const addItem = () => {
    try {
      if (!selectedProduct) {
        Swal.fire('Perhatian', 'Pilih produk terlebih dahulu!', 'warning');
        return;
      }
      if (Number(qty) <= 0) {
        Swal.fire('Perhatian', 'Jumlah (Qty) harus lebih dari 0!', 'warning');
        return;
      }
      const product = products.find(p => String(p.id) === String(selectedProduct));
      if (!product) {
        Swal.fire('Gagal', "Produk tidak ditemukan! ID yg dicari: '" + selectedProduct + "'. ID tersedia: " + products.map(p=>`'${p.id}'`).join(", "), 'error');
        return;
      }

      const additionalCost = Number(shotCount) > 0 ? Number(extraShotCost) : 0;
      const finalPrice = (Number(product.price) || 0) + additionalCost;

      const newItem = {
        productId: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        qty: Number(qty),
        sugarLevel,
        shotCount: Number(shotCount),
        size,
        extraShotCost: additionalCost,
        temperature,
        notes: itemNotes,
        subtotal: finalPrice * Number(qty)
      };

      setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem]
      }));
      
      setSelectedProduct('');
      setQty(1);
      setItemNotes('');
      setSugarLevel('Normal');
      setShotCount(0);
      setSize('150 ml');
      setExtraShotCost(0);
      setTemperature('Normal');
    } catch (error) {
      Swal.fire('Gagal', "Terjadi kesalahan: " + error.message, 'error');
    }
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
      Swal.fire('Perhatian', 'Pilih minimal 1 item produk!', 'warning');
      return;
    }
    
    const dataToSave = {
      customerId: formData.customerId,
      items: formData.items,
      subtotal: getSubtotal(),
      taxType: formData.taxType,
      taxRate: formData.taxRate,
      taxAmount: getTaxAmount(),
      total: getTotal(),
      status: formData.status
    };
    
    if (formData.id) {
      updateSalesOrder(formData.id, dataToSave);
    } else {
      addSalesOrder(dataToSave);
    }
    setIsModalOpen(false);
  };

  const markAsLunas = (id) => {
    updateSalesOrder(id, { status: 'Lunas' });
  };

  const handleDeleteSO = (id) => {
    Swal.fire({
      title: 'Hapus Sales Order?',
      text: "Yakin ingin menghapus Sales Order ini? Stok produk akan dikembalikan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSalesOrder(id);
        Swal.fire('Terhapus!', 'Sales Order berhasil dihapus.', 'success');
      }
    });
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Unknown Customer';
  };

  const filteredsalesOrders = salesOrders.filter(item => {
    const custName = getCustomerName(item.customerId);
    const searchStr = `${item.soNumber} ${item.date} ${custName} ${item.status} ${item.total}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Order (SO)</h1>
          <p className="text-gray-500 mt-1">Catat transaksi penjualan ke pelanggan.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
        >
          <ShoppingCart size={18} /> Buat Pesanan
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari Sales Order..." 
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
              <th className="p-4 font-semibold">No. SO</th>
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold text-right">Total</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredsalesOrders.map(so => (
              <tr key={so.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-gray-700">
                <td className="p-4 font-mono text-sm text-amber-600 font-bold">{so.soNumber}</td>
                <td className="p-4">{so.date}</td>
                <td className="p-4 font-medium text-gray-900">{getCustomerName(so.customerId)}</td>
                <td className="p-4 text-right font-bold text-emerald-600">{formatRp(so.total)}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${so.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {so.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    {so.status === 'Pending' && (
                      <>
                        <button onClick={() => markAsLunas(so.id)} title="Tandai Lunas" className="text-emerald-500 hover:text-emerald-700 transition-colors p-2">
                          <Check size={18} />
                        </button>
                        <button onClick={() => handleEditModal(so)} title="Edit SO" className="text-amber-500 hover:text-amber-700 transition-colors p-2">
                          <Edit size={18} />
                        </button>
                      </>
                    )}
                    <button onClick={() => { localStorage.setItem('print_so', so.id); setActiveTab('invoice_so'); }} title="Cetak Invoice" className="text-blue-500 hover:text-blue-700 transition-colors p-2 relative z-10">
                      <FileText size={18} />
                    </button>
                    <button onClick={() => handleDeleteSO(so.id)} title="Hapus SO" className="text-red-500 hover:text-red-700 transition-colors p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredsalesOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada transaksi Sales Order.</td>
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
                <h2 className="text-2xl font-bold text-gray-900">{formData.id ? 'Edit Sales Order' : 'Buat Sales Order Baru'}</h2>
                <p className="text-sm text-gray-500 mt-1">Lengkapi form di bawah untuk memproses pesanan.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Customer</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}
                  >
                    <option value="">Pilih Customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Pembayaran</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Pending">Pending (Belum Bayar)</option>
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
                    <ShoppingCart size={18} className="text-amber-600"/> Item Pesanan
                  </h3>
                  
                  <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Produk</label>
                        <select 
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                        >
                          <option value="">Pilih Produk...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} - {formatRp(p.price)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Ukuran</label>
                        <select
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={size} onChange={e => setSize(e.target.value)}
                        >
                          <option value="150 ml">150 ml</option>
                          <option value="300 ml">300 ml</option>
                          <option value="600 ml">600 ml</option>
                          <option value="1 Liter">1 Liter</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Qty</label>
                        <input 
                          type="number" min="1" placeholder="Qty"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={qty} onChange={e => setQty(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Suhu</label>
                        <select
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={temperature} onChange={e => setTemperature(e.target.value)}
                        >
                          <option value="Normal">Normal</option>
                          <option value="Hot">Hot</option>
                          <option value="Ice">Ice</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Gula</label>
                        <select
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={sugarLevel} onChange={e => setSugarLevel(e.target.value)}
                        >
                          <option value="Normal">Normal</option>
                          <option value="Less Sugar">Less Sugar</option>
                          <option value="No Sugar">No Sugar</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Extra Shot</label>
                          <input 
                            type="number" min="0" placeholder="0"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            value={shotCount} onChange={e => setShotCount(e.target.value)}
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Biaya Shot</label>
                          <input 
                            type="number" min="0" placeholder="0" disabled={Number(shotCount) <= 0}
                            className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all ${Number(shotCount) <= 0 ? 'opacity-50 cursor-not-allowed' : 'focus:bg-white'}`}
                            value={extraShotCost} onChange={e => setExtraShotCost(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Catatan</label>
                        <input 
                          type="text" placeholder="Contoh: Es dipisah, dll"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                          value={itemNotes} onChange={e => setItemNotes(e.target.value)}
                        />
                      </div>
                      <div className="w-full">
                        <button 
                          type="button" onClick={addItem}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 h-[38px]"
                        >
                          <Plus size={16} /> Tambah Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto overflow-x-auto custom-scrollbar bg-white">
                  <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                    <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
                      <tr className="text-gray-500 uppercase tracking-wider text-xs">
                        <th className="p-3 font-semibold border-b border-gray-200">Produk</th>
                        <th className="p-3 font-semibold border-b border-gray-200">Keterangan</th>
                        <th className="p-3 font-semibold border-b border-gray-200 text-right">Harga</th>
                        <th className="p-3 font-semibold border-b border-gray-200 text-center">Qty</th>
                        <th className="p-3 font-semibold border-b border-gray-200 text-right">Subtotal</th>
                        <th className="p-3 font-semibold border-b border-gray-200 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3 text-gray-800 font-semibold">{item.name}</td>
                          <td className="p-3 text-gray-500 text-xs">
                            <div className="flex flex-col gap-1 items-start">
                              {item.temperature && item.temperature !== 'Normal' && (
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-medium">Temp: {item.temperature}</span>
                              )}
                              {item.size && (
                                <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md font-medium">Size: {item.size}</span>
                              )}
                              {item.sugarLevel && item.sugarLevel !== 'Normal' && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md font-medium">Gula: {item.sugarLevel}</span>
                              )}
                              {item.shotCount > 0 && (
                                <span className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-md font-medium">
                                  +{item.shotCount} Shot {item.extraShotCost > 0 ? `(+${formatRp(item.extraShotCost)})` : ''}
                                </span>
                              )}
                              {item.notes && <span className="text-gray-400 italic mt-0.5">"{item.notes}"</span>}
                            </div>
                          </td>
                          <td className="p-3 text-gray-600 text-right">{formatRp(item.price)}</td>
                          <td className="p-3 text-gray-800 text-center font-medium bg-gray-50/50">{item.qty}</td>
                          <td className="p-3 text-emerald-600 font-bold text-right">{formatRp(item.subtotal)}</td>
                          <td className="p-3 text-center">
                            <button type="button" onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {formData.items.length === 0 && (
                        <tr><td colSpan="6" className="p-10 text-center text-gray-400">Belum ada item ditambahkan. Silahkan tambah item di atas.</td></tr>
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
                      <span className="text-gray-800 font-bold">Total Pesanan</span>
                      <span className="text-2xl font-black text-amber-600">{formatRp(getTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-2">
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
                  <Check size={18} /> {formData.id ? 'Simpan Perubahan' : 'Simpan Pesanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrder;
