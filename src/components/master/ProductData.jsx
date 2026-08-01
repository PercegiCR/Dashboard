import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, X, PackagePlus } from 'lucide-react';

const ProductData = () => {
  const { products, inventory, addProduct, updateProduct, deleteProduct, produceProduct } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: '', name: '', category: '', price: 0, recipe: [] });
  const [selectedInv, setSelectedInv] = useState('');
  const [invQty, setInvQty] = useState('');

  const [isProduceModalOpen, setIsProduceModalOpen] = useState(false);
  const [produceData, setProduceData] = useState({ productId: null, productName: '', qty: 1 });

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({ ...item, recipe: item.recipe || [] });
    } else {
      setFormData({ id: null, code: '', name: '', category: '', price: 0, recipe: [] });
    }
    setIsModalOpen(true);
  };

  const handleAddRecipeItem = () => {
    if (!selectedInv || !invQty || invQty <= 0) return;
    const invItem = inventory.find(i => i.id === selectedInv);
    if (!invItem) return;
    
    setFormData({
      ...formData,
      recipe: [...(formData.recipe || []), { inventoryId: invItem.id, qty: Number(invQty) }]
    });
    setSelectedInv('');
    setInvQty('');
  };

  const handleRemoveRecipeItem = (index) => {
    const newRecipe = [...(formData.recipe || [])];
    newRecipe.splice(index, 1);
    setFormData({ ...formData, recipe: newRecipe });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      price: Number(formData.price)
    };
    
    if (formData.id) {
      updateProduct(formData.id, dataToSave);
    } else {
      addProduct(dataToSave);
    }
    setIsModalOpen(false);
  };

  const handleOpenProduce = (item) => {
    setProduceData({ productId: item.id, productName: item.name, qty: 1 });
    setIsProduceModalOpen(true);
  };

  const handleProduce = (e) => {
    e.preventDefault();
    const res = produceProduct(produceData.productId, produceData.qty);
    if (res.success) {
      setIsProduceModalOpen(false);
    } else {
      alert(res.message);
    }
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Produk</h1>
          <p className="text-gray-500 mt-1">Kelola data menu (barang jadi) yang dijual.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
        >
          <Plus size={18} /> Tambah Menu
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-semibold">Kode</th>
              <th className="p-4 font-semibold">Nama Menu</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold text-right">Harga Jual</th>
              <th className="p-4 font-semibold text-right">Stok</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-gray-700">
                <td className="p-4 font-mono text-sm text-amber-600 font-medium">{item.code}</td>
                <td className="p-4 font-medium text-gray-900">{item.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.category === 'Minuman' ? 'bg-cyan-100 text-cyan-700' : 'bg-orange-100 text-orange-700'}`}>
                    {item.category}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-emerald-600">{formatRp(item.price)}</td>
                <td className="p-4 text-right font-bold text-blue-600">{item.stock || 0}</td>
                <td className="p-4 flex justify-end gap-3">
                  <button onClick={() => handleOpenProduce(item)} title="Produksi" className="text-emerald-500 hover:text-emerald-700 transition-colors p-1">
                    <PackagePlus size={18} />
                  </button>
                  <button onClick={() => handleOpenModal(item)} title="Edit" className="text-blue-500 hover:text-blue-700 transition-colors p-1">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deleteProduct(item.id)} title="Hapus" className="text-red-500 hover:text-red-700 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada data produk.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-popup">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Produk</label>
                  <input 
                    type="text" required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
                  <input 
                    type="text" required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select 
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Pilih...</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Snack">Snack</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                  <input 
                    type="number" required min="0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              <div className="border border-gray-200 p-4 rounded-xl bg-gray-50 mt-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Resep (Bahan & Takaran)</h3>
                <div className="flex gap-2 mb-3">
                  <select 
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={selectedInv} onChange={e => setSelectedInv(e.target.value)}
                  >
                    <option value="">Pilih Bahan...</option>
                    {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                  </select>
                  <input 
                    type="number" min="0.01" step="0.01" placeholder="Takaran"
                    className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={invQty} onChange={e => setInvQty(e.target.value)}
                  />
                  <button 
                    type="button" onClick={handleAddRecipeItem}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors"
                  >
                    Tambah
                  </button>
                </div>
                
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg bg-white custom-scrollbar">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 font-medium">Bahan</th>
                        <th className="p-2 font-medium text-right">Takaran</th>
                        <th className="p-2 text-center">x</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.recipe || []).map((r, idx) => {
                        const invItem = inventory.find(i => i.id === r.inventoryId);
                        return (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="p-2">{invItem ? invItem.name : 'Unknown'}</td>
                            <td className="p-2 text-right">{r.qty} {invItem ? invItem.unit : ''}</td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => handleRemoveRecipeItem(idx)} className="text-red-500 hover:text-red-700"><X size={12} /></button>
                            </td>
                          </tr>
                        );
                      })}
                      {(!formData.recipe || formData.recipe.length === 0) && (
                        <tr><td colSpan="3" className="p-2 text-center text-gray-500">Belum ada bahan</td></tr>
                      )}
                    </tbody>
                  </table>
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProduceModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl animate-popup">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Produksi {produceData.productName}</h2>
              <button onClick={() => setIsProduceModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleProduce} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah yang diproduksi</label>
                <input 
                  type="number" required min="1"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  value={produceData.qty} onChange={e => setProduceData({...produceData, qty: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" onClick={() => setIsProduceModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-transparent"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                >
                  Produksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductData;
