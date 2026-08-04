import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import Swal from 'sweetalert2';

const InventoryData = () => {
  const { inventory, addInventory, updateInventory, deleteInventory } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, code: '', name: '', category: '', unit: '', price: 0, stock: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredinventory = inventory.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const generateInventoryCode = () => {
    const invCodes = inventory
      .filter(p => p.code && p.code.startsWith('INV-'))
      .map(p => parseInt(p.code.replace('INV-', ''), 10))
      .filter(n => !isNaN(n));
    const maxNumber = invCodes.length > 0 ? Math.max(...invCodes) : 0;
    const nextNumber = maxNumber + 1;
    return `INV-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ id: null, code: generateInventoryCode(), name: '', category: '', unit: '', price: 0, stock: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock)
    };
    
    if (formData.id) {
      updateInventory(formData.id, dataToSave);
    } else {
      addInventory(dataToSave);
    }
    setIsModalOpen(false);
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Inventory</h1>
          <p className="text-gray-500 mt-1">Kelola data alat dan bahan baku produksi.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
        >
          <Plus size={18} /> Tambah Item
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari inventory..." 
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
              <th className="p-4 font-semibold">Nama Barang</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold text-right">Harga Beli</th>
              <th className="p-4 font-semibold text-right">Stok</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredinventory.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-gray-700">
                <td className="p-4 font-mono text-sm text-amber-600 font-medium">{item.code}</td>
                <td className="p-4 font-medium text-gray-900">{item.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.category === 'Bahan' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-700'}`}>
                    {item.category}
                  </span>
                </td>
                <td className="p-4 text-right font-medium text-emerald-600">{formatRp(item.price)}</td>
                <td className="p-4 text-right">
                  <span className="font-bold text-gray-900">{item.stock}</span> <span className="text-gray-500 text-sm">{item.unit}</span>
                </td>
                <td className="p-4 flex justify-end gap-3">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700 transition-colors p-1">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => {
                    Swal.fire({
                      title: 'Hapus Bahan Baku?',
                      text: "Yakin ingin menghapus data ini?",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#ef4444',
                      cancelButtonColor: '#6b7280',
                      confirmButtonText: 'Ya, hapus!',
                      cancelButtonText: 'Batal'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        deleteInventory(item.id);
                        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
                      }
                    });
                  }} className="text-red-500 hover:text-red-700 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredinventory.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">Belum ada data inventory.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl ring-1 ring-gray-900/5 animate-popup">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.id ? 'Edit Inventory' : 'Tambah Inventory'}</h2>
                <p className="text-sm text-gray-500 mt-1">Lengkapi data barang inventory.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kode Barang</label>
                  <input 
                    type="text" required readOnly
                    className="w-full bg-gray-200 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-500 cursor-not-allowed focus:outline-none transition-all duration-200"
                    value={formData.code}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Barang</label>
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
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Pilih...</option>
                    <option value="Bahan">Bahan Baku</option>
                    <option value="Alat">Peralatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Satuan</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="">Pilih...</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="liter">Liter (l)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga Beli Standar</label>
                  <input 
                    type="number" required min="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stok Awal</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
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
    </div>
  );
};

export default InventoryData;
