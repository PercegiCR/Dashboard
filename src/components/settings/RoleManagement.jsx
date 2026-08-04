import React, { useState, useEffect } from 'react';
import { Plus, Search, Shield, Trash2, Edit2, X, CheckSquare } from 'lucide-react';
import Swal from 'sweetalert2';

const availablePages = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'so', label: 'Sales Order (SO)' },
  { id: 'po', label: 'Purchase Order (PO)' },
  { id: 'product', label: 'Data Produk' },
  { id: 'inventory', label: 'Data Inventory' },
  { id: 'customer', label: 'Data Customer' },
  { id: 'vendor', label: 'Data Vendor' },
  { id: 'finance', label: 'Finance Dashboard' },
  { id: 'settings_invoice', label: 'Atur Invoice' },
  { id: 'settings_export', label: 'Export Masal' },
  { id: 'settings_account', label: 'Atur Akun' },
  { id: 'settings_users', label: 'Manage User' },
  { id: 'settings_roles', label: 'Atur Role' },
];

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    access: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedRoles = JSON.parse(localStorage.getItem('roles')) || [];
    setRoles(storedRoles);
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingId(role.id);
      setFormData({
        name: role.name,
        access: [...role.access]
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        access: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleCheckboxChange = (pageId) => {
    setFormData(prev => {
      let newAccess = [...prev.access];
      if (pageId === 'all') {
        if (newAccess.includes('all')) {
          newAccess = [];
        } else {
          newAccess = ['all'];
        }
      } else {
        // If clicking a specific page but 'all' is selected, clear 'all'
        if (newAccess.includes('all')) {
          newAccess = [];
        }
        if (newAccess.includes(pageId)) {
          newAccess = newAccess.filter(id => id !== pageId);
        } else {
          newAccess.push(pageId);
        }
      }
      return { ...prev, access: newAccess };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      Swal.fire('Perhatian', 'Nama role harus diisi!', 'warning');
      return;
    }
    if (formData.access.length === 0) {
      Swal.fire('Perhatian', 'Pilih minimal satu akses halaman!', 'warning');
      return;
    }

    let updatedRoles;
    if (editingId) {
      updatedRoles = roles.map(r => r.id === editingId ? { ...r, ...formData } : r);
    } else {
      const newRole = {
        id: Date.now().toString(),
        ...formData
      };
      updatedRoles = [...roles, newRole];
    }
    
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (id === '1') {
      Swal.fire('Gagal', "Role 'administration' adalah role default dan tidak bisa dihapus.", 'error');
      return;
    }
    
    // Check if role is used by any user
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const isUsed = users.some(u => u.roleId === id);
    if (isUsed) {
      Swal.fire('Gagal', "Role ini sedang digunakan oleh user aktif. Silakan ubah role user tersebut terlebih dahulu.", 'error');
      return;
    }

    Swal.fire({
      title: 'Hapus Role?',
      text: "Apakah Anda yakin ingin menghapus role ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedRoles = roles.filter(r => r.id !== id);
        setRoles(updatedRoles);
        localStorage.setItem('roles', JSON.stringify(updatedRoles));
        Swal.fire('Terhapus!', 'Role berhasil dihapus.', 'success');
      }
    });
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Role Akses</h2>
          <p className="text-gray-500 mt-1">Kelola peran dan hak akses halaman</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            Tambah Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map(role => (
          <div key={role.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-amber-400 hover:shadow-md transition-all group relative">
            <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
              <button 
                onClick={() => handleOpenModal(role)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Role"
              >
                <Edit2 size={16} />
              </button>
              {role.id !== '1' && (
                <button 
                  onClick={() => handleDelete(role.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus Role"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg uppercase">{role.name}</h3>
                <p className="text-sm text-gray-500">
                  {role.access.includes('all') ? 'Full Access' : `${role.access.length} Akses Halaman`}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto custom-scrollbar">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Hak Akses:</p>
              {role.access.includes('all') ? (
                <div className="text-sm text-gray-700 bg-white border border-gray-200 py-1.5 px-3 rounded-lg">
                  Semua Halaman (Full Administrator)
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {role.access.map(accessId => {
                    const page = availablePages.find(p => p.id === accessId);
                    return page ? (
                      <span key={accessId} className="text-xs bg-white border border-gray-200 text-gray-600 py-1 px-2 rounded-md shadow-sm">
                        {page.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-popup max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-500" />
                {editingId ? 'Edit Role' : 'Tambah Role Baru'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto custom-scrollbar flex-1">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Role</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Contoh: Kasir, Manager, dll"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Akses Halaman</label>
                
                <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 cursor-pointer hover:bg-amber-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.access.includes('all')}
                    onChange={() => handleCheckboxChange('all')}
                    className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-semibold text-amber-900">Semua Akses (Full Administrator)</div>
                    <div className="text-xs text-amber-700">Role ini dapat membuka semua halaman tanpa batasan.</div>
                  </div>
                </label>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-opacity ${formData.access.includes('all') ? 'opacity-50 pointer-events-none' : ''}`}>
                  {availablePages.map(page => (
                    <label key={page.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.access.includes(page.id)}
                        onChange={() => handleCheckboxChange(page.id)}
                        className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                      />
                      <span className="text-gray-700 text-sm font-medium">{page.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-gray-50">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 text-white bg-amber-600 hover:bg-amber-700 rounded-xl font-medium transition-colors shadow-sm"
              >
                Simpan Role
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
