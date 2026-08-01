import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const VendorData = () => {
  const { vendors, addVendor, updateVendor, deleteVendor } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', contact: '', phone: '', address: '', category: '' });

  const handleOpenModal = (vendor = null) => {
    if (vendor) {
      setFormData(vendor);
    } else {
      setFormData({ id: null, name: '', contact: '', phone: '', address: '', category: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.id) {
      updateVendor(formData.id, formData);
    } else {
      addVendor(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Vendor</h1>
          <p className="text-gray-500 mt-1">Kelola data supplier bahan baku dan peralatan.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md"
        >
          <Plus size={18} /> Tambah Vendor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Nama Perusahaan</th>
              <th className="p-4 font-semibold">Kontak Person</th>
              <th className="p-4 font-semibold">No. Telepon</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 text-gray-700">
                <td className="p-4 font-mono text-sm text-gray-500">{v.id}</td>
                <td className="p-4 font-medium text-gray-900">{v.name}</td>
                <td className="p-4">{v.contact}</td>
                <td className="p-4">{v.phone}</td>
                <td className="p-4">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {v.category}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-3">
                  <button onClick={() => handleOpenModal(v)} className="text-blue-500 hover:text-blue-700 transition-colors p-1">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deleteVendor(v.id)} className="text-red-500 hover:text-red-700 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada data vendor.</td>
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
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Vendor' : 'Tambah Vendor'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
                <input 
                  type="text" required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kontak Person</label>
                  <input 
                    type="text" required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                  <input 
                    type="text" required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea 
                  required rows="3"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori (Alat/Bahan)</label>
                <select 
                  required
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="Peralatan">Peralatan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
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
    </div>
  );
};

export default VendorData;
