import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, X, Search, Tags, Thermometer, Candy, Coffee, Check, ShieldAlert, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';

const CategorySettings = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    showTemperature: true,
    showSugar: true,
    showExtraShot: true
  });

  const filteredCategories = useMemo(() => {
    return (categories || []).filter(c => 
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Count products per category
  const productCountPerCategory = useMemo(() => {
    const counts = {};
    (products || []).forEach(p => {
      const cat = (p.category || '').toLowerCase().trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name || '',
        description: cat.description || '',
        showTemperature: cat.showTemperature ?? true,
        showSugar: cat.showSugar ?? true,
        showExtraShot: cat.showExtraShot ?? true
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        showTemperature: true,
        showSugar: true,
        showExtraShot: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      Swal.fire('Perhatian', 'Nama kategori tidak boleh kosong!', 'warning');
      return;
    }

    // Check duplicate
    const isDuplicate = (categories || []).some(c => 
      c.name.toLowerCase() === trimmedName.toLowerCase() && 
      (!editingCategory || c.id !== editingCategory.id)
    );

    if (isDuplicate) {
      Swal.fire('Perhatian', `Kategori dengan nama "${trimmedName}" sudah ada!`, 'warning');
      return;
    }

    const payload = {
      name: trimmedName,
      description: formData.description.trim(),
      showTemperature: Boolean(formData.showTemperature),
      showSugar: Boolean(formData.showSugar),
      showExtraShot: Boolean(formData.showExtraShot)
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        Swal.fire('Berhasil!', 'Kategori berhasil diperbarui.', 'success');
      } else {
        await addCategory(payload);
        Swal.fire('Berhasil!', 'Kategori baru berhasil ditambahkan.', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      Swal.fire('Error', error.message || 'Gagal menyimpan kategori.', 'error');
    }
  };

  const handleDelete = (cat) => {
    const prodCount = productCountPerCategory[(cat.name || '').toLowerCase().trim()] || 0;
    
    Swal.fire({
      title: 'Hapus Kategori?',
      html: `Yakin ingin menghapus kategori <b>"${cat.name}"</b>?${
        prodCount > 0 ? `<br/><span class="text-sm text-red-500 font-medium">Perhatian: Kategori ini sedang digunakan oleh ${prodCount} produk.</span>` : ''
      }`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCategory(cat.id);
          Swal.fire('Terhapus!', 'Kategori berhasil dihapus.', 'success');
        } catch (error) {
          Swal.fire('Error', error.message || 'Gagal menghapus kategori.', 'error');
        }
      }
    });
  };

  const handleInitDefaults = async () => {
    const defaultCats = [
      { name: 'Minuman', description: 'Menu kopi, teh, dan aneka minuman siap saji', showTemperature: true, showSugar: true, showExtraShot: true },
      { name: 'Beans', description: 'Biji kopi sangrai kemasan (pack/kg)', showTemperature: false, showSugar: false, showExtraShot: false },
      { name: 'Makanan', description: 'Menu makanan berat dan olahan dapur', showTemperature: false, showSugar: false, showExtraShot: false },
      { name: 'Snack', description: 'Makanan ringan dan camilan', showTemperature: false, showSugar: false, showExtraShot: false },
      { name: 'Lainnya', description: 'Produk pelengkap lainnya', showTemperature: false, showSugar: false, showExtraShot: false }
    ];

    try {
      for (const dc of defaultCats) {
        const exists = (categories || []).some(c => c.name.toLowerCase() === dc.name.toLowerCase());
        if (!exists) {
          await addCategory(dc);
        }
      }
      Swal.fire('Berhasil!', 'Kategori bawaan berhasil dimuat ke sistem.', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Tags className="text-amber-600" size={30} /> Atur Kategori Produk
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola master kategori produk dan sesuaikan opsi pesanan (Suhu, Gula, Extra Shot) yang muncul di formulir Sales Order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(!categories || categories.length === 0) && (
            <button
              onClick={handleInitDefaults}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors font-semibold text-sm shadow-sm"
            >
              <Sparkles size={16} /> Muat Kategori Bawaan
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus size={18} /> Tambah Kategori
          </button>
        </div>
      </div>

      {/* Info Card Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-2xl flex items-start gap-3.5">
        <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs shrink-0">
          <Coffee size={20} />
        </div>
        <div className="text-sm text-amber-900">
          <p className="font-bold">Opsi Kustomisasi Sales Order (SO):</p>
          <p className="text-amber-800/90 text-xs mt-0.5 leading-relaxed">
            Anda dapat menentukan apakah produk dalam kategori tertentu membutuhkan pilihan <b>Suhu</b> (Normal/Hot/Ice), <b>Gula</b> (Normal/Less/No), atau <b>Extra Shot</b>. Misalnya untuk kategori <i>Beans</i> atau <i>Makanan</i>, opsi ini dapat dinonaktifkan agar form transaksi tetap ringkas dan bersih.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cari kategori..."
          className="w-full outline-none text-gray-700 bg-transparent text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Nama Kategori</th>
                <th className="p-4 font-semibold">Deskripsi</th>
                <th className="p-4 font-semibold text-center">Tampilkan Suhu</th>
                <th className="p-4 font-semibold text-center">Tampilkan Gula</th>
                <th className="p-4 font-semibold text-center">Tampilkan Extra Shot</th>
                <th className="p-4 font-semibold text-center">Jml Produk</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredCategories.map(cat => {
                const prodCount = productCountPerCategory[(cat.name || '').toLowerCase().trim()] || 0;
                const isBeans = (cat.name || '').toLowerCase() === 'beans';

                return (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors text-gray-700">
                    <td className="p-4 font-semibold text-gray-900">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        isBeans ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cat.name}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs max-w-xs truncate">
                      {cat.description || <span className="text-gray-300 italic">-</span>}
                    </td>
                    
                    {/* Suhu Badge */}
                    <td className="p-4 text-center">
                      {cat.showTemperature ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <Check size={12} /> Tampil
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-400 text-xs font-medium">
                          Sembunyi
                        </span>
                      )}
                    </td>

                    {/* Gula Badge */}
                    <td className="p-4 text-center">
                      {cat.showSugar ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <Check size={12} /> Tampil
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-400 text-xs font-medium">
                          Sembunyi
                        </span>
                      )}
                    </td>

                    {/* Extra Shot Badge */}
                    <td className="p-4 text-center">
                      {cat.showExtraShot ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <Check size={12} /> Tampil
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-400 text-xs font-medium">
                          Sembunyi
                        </span>
                      )}
                    </td>

                    {/* Produk Count */}
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
                        {prodCount} item
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          title="Edit Kategori"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={17} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          title="Hapus Kategori"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Tags size={36} className="text-gray-300" />
                      <p className="font-medium text-gray-500">Belum ada kategori yang terdaftar.</p>
                      <button
                        onClick={handleInitDefaults}
                        className="mt-2 text-xs text-amber-600 hover:underline font-semibold"
                      >
                        Klik di sini untuk memuat kategori bawaan
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-2xl ring-1 ring-gray-900/5 animate-popup">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Atur detail kategori dan visibilitas opsi pada form pesanan (SO).
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              {/* Nama Kategori */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Minuman, Beans, Pastry, dll..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Deskripsi / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Keterangan singkat kategori..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Pengaturan Visibilitas Form SO */}
              <div className="border border-gray-200 p-4 rounded-2xl bg-gray-50/60">
                <h4 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Coffee size={16} className="text-amber-600" /> Pengaturan Form Sales Order (SO)
                </h4>
                <p className="text-xs text-gray-500 mb-3.5">
                  Tentukan opsi apa saja yang ingin ditampilkan saat kasir memilih produk dari kategori ini:
                </p>

                <div className="flex flex-col gap-2.5">
                  {/* Suhu */}
                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-amber-400 transition-all shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.showTemperature ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                        <Thermometer size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">Pilihan Suhu</div>
                        <div className="text-xs text-gray-500">Normal, Hot, Ice</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-amber-600 rounded-md focus:ring-amber-500 cursor-pointer accent-amber-600"
                      checked={formData.showTemperature}
                      onChange={(e) => setFormData({ ...formData, showTemperature: e.target.checked })}
                    />
                  </label>

                  {/* Gula */}
                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-amber-400 transition-all shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.showSugar ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                        <Candy size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">Pilihan Kadar Gula</div>
                        <div className="text-xs text-gray-500">Normal, Less Sugar, No Sugar</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-amber-600 rounded-md focus:ring-amber-500 cursor-pointer accent-amber-600"
                      checked={formData.showSugar}
                      onChange={(e) => setFormData({ ...formData, showSugar: e.target.checked })}
                    />
                  </label>

                  {/* Extra Shot */}
                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-amber-400 transition-all shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.showExtraShot ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                        <Coffee size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">Pilihan Extra Shot</div>
                        <div className="text-xs text-gray-500">Normal, Extra Espresso Shot (+Rp5.000)</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-amber-600 rounded-md focus:ring-amber-500 cursor-pointer accent-amber-600"
                      checked={formData.showExtraShot}
                      onChange={(e) => setFormData({ ...formData, showExtraShot: e.target.checked })}
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySettings;
