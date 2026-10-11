import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, X, PackagePlus, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const ProductData = () => {
  const { products, inventory, addProduct, updateProduct, deleteProduct, produceProduct } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: '', name: '', category: '', sizes: [], price: 0, recipe: [] });
  const [sizeInput, setSizeInput] = useState('');
  const [selectedInv, setSelectedInv] = useState('');
  const [invQty, setInvQty] = useState('');
  const [invUnit, setInvUnit] = useState('gram');

  const [isProduceModalOpen, setIsProduceModalOpen] = useState(false);
  const [produceData, setProduceData] = useState({ productId: null, productName: '', qty: 1 });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredproducts = products.filter(item => {
    const term = searchTerm.toLowerCase();
    const inValues = Object.values(item).some(val => 
      typeof val === 'string' && val.toLowerCase().includes(term)
    );
    const inSizes = Array.isArray(item.sizes) && item.sizes.some(s => s.toLowerCase().includes(term));
    return inValues || inSizes;
  });

  const getCategoryBadgeClass = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'minuman') return 'bg-cyan-100 text-cyan-700';
    if (cat === 'beans') return 'bg-amber-100 text-amber-800 border border-amber-300';
    if (cat === 'makanan') return 'bg-emerald-100 text-emerald-700';
    if (cat === 'snack') return 'bg-yellow-100 text-yellow-800';
    if (cat.includes('botol')) return 'bg-purple-100 text-purple-700';
    return 'bg-orange-100 text-orange-700';
  };

  const generateProductCode = () => {
    const prdCodes = products
      .filter(p => p.code && p.code.startsWith('PRD-'))
      .map(p => parseInt(p.code.replace('PRD-', ''), 10))
      .filter(n => !isNaN(n));
    const maxNumber = prdCodes.length > 0 ? Math.max(...prdCodes) : 0;
    const nextNumber = maxNumber + 1;
    return `PRD-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleOpenModal = (item = null) => {
    setSizeInput('');
    if (item) {
      const itemSizes = Array.isArray(item.sizes) && item.sizes.length > 0
        ? item.sizes
        : (item.size ? String(item.size).split(',').map(s => s.trim()).filter(Boolean) : []);
      setFormData({ 
        ...item, 
        sizes: itemSizes, 
        recipe: item.recipe || [] 
      });
    } else {
      setFormData({ 
        id: null, 
        code: generateProductCode(), 
        name: '', 
        category: '', 
        sizes: [], 
        price: 0, 
        recipe: [] 
      });
    }
    setIsModalOpen(true);
  };

  const handleAddSize = (valueToAdd = null) => {
    const val = (typeof valueToAdd === 'string' ? valueToAdd : sizeInput || '').trim();
    if (!val) return;
    
    const splitValues = val.split(',').map(s => s.trim()).filter(Boolean);
    const currentSizes = formData.sizes || [];
    const toAdd = splitValues.filter(s => !currentSizes.includes(s));
    
    if (toAdd.length > 0) {
      setFormData(prev => ({
        ...prev,
        sizes: [...(prev.sizes || []), ...toAdd]
      }));
    }
    setSizeInput('');
  };

  const handleRemoveSize = (sizeToRemove) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter(s => s !== sizeToRemove)
    }));
  };

  const handleAddRecipeItem = () => {
    if (!selectedInv || !invQty || invQty <= 0) return;
    const invItem = inventory.find(i => String(i.id) === String(selectedInv));
    if (!invItem) return;
    
    setFormData({
      ...formData,
      recipe: [...(formData.recipe || []), { inventoryId: invItem.id, qty: Number(invQty), unit: invUnit }]
    });
    setSelectedInv('');
    setInvQty('');
    setInvUnit('gram');
  };

  const handleRemoveRecipeItem = (index) => {
    const newRecipe = [...(formData.recipe || [])];
    newRecipe.splice(index, 1);
    setFormData({ ...formData, recipe: newRecipe });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const currentSizes = formData.sizes || [];
    const dataToSave = {
      ...formData,
      sizes: currentSizes,
      size: currentSizes.join(', '),
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

  const handleProduce = async (e) => {
    e.preventDefault();
    const res = await produceProduct(produceData.productId, produceData.qty);
    if (res.success) {
      setIsProduceModalOpen(false);
      Swal.fire('Berhasil!', 'Produksi berhasil dicatat', 'success');
    } else {
      Swal.fire('Gagal!', res.message, 'error');
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

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari produk..." 
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
              <th className="p-4 font-semibold">Kode</th>
              <th className="p-4 font-semibold">Nama Menu</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">Ukuran</th>
              <th className="p-4 font-semibold text-right">Harga Jual</th>
              <th className="p-4 font-semibold text-right">Stok</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredproducts.map(item => {
              const itemSizes = Array.isArray(item.sizes) && item.sizes.length > 0
                ? item.sizes
                : (item.size ? String(item.size).split(',').map(s => s.trim()).filter(Boolean) : []);

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-gray-700">
                  <td className="p-4 font-mono text-sm text-amber-600 font-medium">{item.code}</td>
                  <td className="p-4 font-medium text-gray-900">{item.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {itemSizes.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {itemSizes.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">-</span>
                    )}
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
                    <button onClick={() => {
                      Swal.fire({
                        title: 'Hapus Menu?',
                        text: "Yakin ingin menghapus data ini?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Ya, hapus!',
                        cancelButtonText: 'Batal'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          deleteProduct(item.id);
                          Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
                        }
                      });
                    }} title="Hapus" className="text-red-500 hover:text-red-700 transition-colors p-1">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredproducts.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">Belum ada data produk.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-xl shadow-2xl ring-1 ring-gray-900/5 animate-popup max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.id ? 'Edit Menu' : 'Tambah Menu'}</h2>
                <p className="text-sm text-gray-500 mt-1">Isi detail produk menu di bawah ini.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kode Produk</label>
                  <input 
                    type="text" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Menu</label>
                  <input 
                    type="text" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                  <input 
                    type="text" required list="kategori-options" placeholder="Pilih atau ketik kategori..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                  <datalist id="kategori-options">
                    <option value="Minuman" />
                    <option value="Makanan" />
                    <option value="Snack" />
                    <option value="Beans" />
                    <option value="Lainnya" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Jual</label>
                  <input 
                    type="number" required min="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              {/* Ukuran Produk (Multi-size) */}
              <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50/50 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Ukuran Produk <span className="text-xs font-normal text-gray-500">(Bisa lebih dari 1)</span>
                  </label>
                  {(formData.sizes || []).length > 0 && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {(formData.sizes || []).length} ukuran
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-2.5">
                  <input 
                    type="text" 
                    list="ukuran-options" 
                    placeholder="Ketik ukuran atau pilih rekomendasi..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    value={sizeInput} 
                    onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                  />
                  <datalist id="ukuran-options">
                    <option value="150 ml" />
                    <option value="200 gram" />
                    <option value="250 gram" />
                    <option value="300 ml" />
                    <option value="500 gram" />
                    <option value="600 ml" />
                    <option value="1 kg" />
                    <option value="1 Liter" />
                    <option value="Regular" />
                    <option value="Large" />
                  </datalist>
                  <button 
                    type="button" 
                    onClick={() => handleAddSize()}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus size={16} /> Tambah
                  </button>
                </div>

                {/* Quick Recommendation Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  <span className="text-xs text-gray-400 mr-1">Rekomendasi:</span>
                  {['150 ml', '250 gram', '500 gram', '600 ml', '1 kg', '1 Liter'].map(opt => {
                    const isSelected = (formData.sizes || []).includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveSize(opt);
                          } else {
                            handleAddSize(opt);
                          }
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-amber-600 text-white border-amber-600 font-medium' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {isSelected ? `✓ ${opt}` : `+ ${opt}`}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Sizes Badges */}
                <div className="min-h-[42px] p-2 bg-white rounded-xl border border-gray-200 flex flex-wrap items-center gap-2">
                  {(formData.sizes || []).length > 0 ? (
                    (formData.sizes || []).map((s, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold shadow-2xs"
                      >
                        {s}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSize(s)}
                          className="text-amber-500 hover:text-red-500 hover:bg-amber-100 p-0.5 rounded-full transition-colors"
                          title="Hapus ukuran"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic px-1">Belum ada ukuran ditambahkan (opsional, bisa lebih dari 1).</span>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50/50 shadow-sm mt-2">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Resep (Bahan & Takaran)</h3>
                <div className="flex flex-col gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-3">
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    value={selectedInv} onChange={e => setSelectedInv(e.target.value)}
                  >
                    <option value="">Pilih Bahan...</option>
                    {inventory.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input 
                      type="number" min="0.01" step="0.01" placeholder="Takaran"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      value={invQty} onChange={e => setInvQty(e.target.value)}
                    />
                    <select
                      className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      value={invUnit} onChange={e => setInvUnit(e.target.value)}
                    >
                      <option value="gram">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="liter">L</option>
                      <option value="pcs">pcs</option>
                      <option value="box">box</option>
                    </select>
                    <button 
                      type="button" onClick={handleAddRecipeItem}
                      className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-medium transition-all text-sm hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
                
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-xl bg-white custom-scrollbar">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm">
                      <tr>
                        <th className="p-2.5 font-semibold text-gray-600">Bahan</th>
                        <th className="p-2.5 font-semibold text-gray-600 text-right">Takaran</th>
                        <th className="p-2.5 font-semibold text-gray-600 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(formData.recipe || []).map((r, idx) => {
                        const invItem = inventory.find(i => i.id === r.inventoryId);
                        return (
                          <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-2.5 text-gray-800 font-medium">{invItem ? invItem.name : 'Unknown'}</td>
                            <td className="p-2.5 text-right font-medium text-gray-600">{r.qty} {r.unit || (invItem ? invItem.unit : '')}</td>
                            <td className="p-2.5 text-center">
                              <button type="button" onClick={() => handleRemoveRecipeItem(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-colors"><X size={14} /></button>
                            </td>
                          </tr>
                        );
                      })}
                      {(!formData.recipe || formData.recipe.length === 0) && (
                        <tr><td colSpan="3" className="p-4 text-center text-gray-400 italic">Belum ada bahan ditambahkan.</td></tr>
                      )}
                    </tbody>
                  </table>
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
                  className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isProduceModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-sm shadow-2xl ring-1 ring-gray-900/5 animate-popup">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Produksi {produceData.productName}</h2>
                <p className="text-sm text-gray-500 mt-1">Masukkan jumlah yang diproduksi.</p>
              </div>
              <button onClick={() => setIsProduceModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleProduce} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah (Porsi / Cup)</label>
                <input 
                  type="number" required min="1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                  value={produceData.qty} onChange={e => setProduceData({...produceData, qty: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" onClick={() => setIsProduceModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
