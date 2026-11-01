import React, { useState, useEffect } from 'react';
import { collection, deleteDoc, deleteField, doc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { hashUserPassword } from '../../utils/userCredentials';
import { Plus, Search, UserCheck, Shield, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    roleId: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    let unsubscribe;
    const startListening = async () => {
      try {
        let storedRoles = [];
        try {
          storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
        } catch {
          storedRoles = [];
        }
        if (storedRoles.length === 0) storedRoles = [{ id: '1', name: 'administration', access: ['all'] }];
        setRoles(storedRoles);
        unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
          const firebaseUsers = snapshot.docs.map(userDoc => {
            const user = { id: userDoc.id, ...userDoc.data() };
            delete user.password;
            delete user.passwordHash;
            delete user.passwordSalt;
            delete user.passwordIterations;
            return user;
          });
          setUsers(firebaseUsers);
          const firebaseRoles = firebaseUsers
            .filter(user => user.roleId && user.roleName)
            .map(user => ({ id: String(user.roleId), name: user.roleName, access: user.roleAccess || [] }));
          const mergedRoles = [...storedRoles];
          firebaseRoles.forEach(role => {
            if (!mergedRoles.some(existing => String(existing.id) === role.id)) mergedRoles.push(role);
          });
          setRoles(mergedRoles);
        }, error => {
          console.error('Failed to load Firebase users:', error);
          Swal.fire('Gagal memuat user', 'Periksa koneksi dan aturan akses Firestore.', 'error');
        });
      } catch (error) {
        console.error('Failed to initialize user list:', error);
        Swal.fire('Gagal memuat user', error.message || 'Periksa koneksi Firebase.', 'error');
      }
    };
    startListening();
    return () => unsubscribe?.();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        name: user.name || '',
        username: user.username || '',
        password: '',
        roleId: String(user.roleId || '')
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        roleId: roles.length > 0 ? String(roles[0].id) : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = formData.name.trim();
    const username = formData.username.trim().toLowerCase();
    const role = roles.find(item => String(item.id) === String(formData.roleId));
    if (!name || !username || (!editingId && !formData.password) || !role) {
      Swal.fire('Perhatian', 'Nama, username, role, dan password akun baru wajib diisi.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const duplicateSnapshot = await getDocs(collection(db, 'users'));
      if (duplicateSnapshot.docs.some(userDoc =>
        userDoc.id !== editingId && String(userDoc.data().username || '').trim().toLowerCase() === username
      )) {
        Swal.fire('Username sudah digunakan', 'Silakan gunakan username lain.', 'warning');
        return;
      }

      const userRef = editingId ? doc(db, 'users', editingId) : doc(collection(db, 'users'));
      const userData = {
        name,
        username,
        roleId: String(role.id),
        roleName: role.name,
        roleAccess: Array.isArray(role.access) ? role.access : [],
        ...(editingId ? {} : { profilePic: null, createdAt: new Date().toISOString() })
      };
      if (formData.password) {
        Object.assign(userData, await hashUserPassword(formData.password));
        if (editingId) userData.password = deleteField();
      }

      if (editingId) await updateDoc(userRef, userData);
      else await setDoc(userRef, userData);

      handleCloseModal();
      await Swal.fire('Berhasil', `Akun ${editingId ? 'diperbarui' : 'ditambahkan'} di Firebase.`, 'success');
    } catch (error) {
      console.error('Failed to save Firebase user:', error);
      Swal.fire('Gagal menyimpan user', error.message || 'Periksa koneksi dan aturan akses Firestore.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    if (id === currentUser?.id) {
      Swal.fire('Tidak dapat dihapus', 'Anda tidak dapat menghapus akun yang sedang digunakan.', 'warning');
      return;
    }
    if (users.length === 1) {
      Swal.fire('Gagal', 'Tidak bisa menghapus user terakhir.', 'error');
      return;
    }
    Swal.fire({
      title: 'Hapus User?',
      text: 'Akun ini akan dihapus permanen dari Firebase.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async result => {
      if (!result.isConfirmed) return;
      try {
        await deleteDoc(doc(db, 'users', id));
        await Swal.fire('Terhapus!', 'Akun berhasil dihapus dari Firebase.', 'success');
      } catch (error) {
        console.error('Failed to delete Firebase user:', error);
        Swal.fire('Gagal menghapus user', error.message || 'Periksa koneksi dan aturan akses Firestore.', 'error');
      }
    });
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => String(r.id) === String(roleId));
    return role ? role.name : 'Unknown';
  };

  const filteredUsers = users.filter(u => 
    String(u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h2>
          <p className="text-gray-500 mt-1">Kelola akses dan akun pengguna sistem</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari user..."
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
            Tambah User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Role Akses</th>
              <th className="p-4 font-semibold text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm overflow-hidden">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.username}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 uppercase">
                      <Shield size={12} />
                      {getRoleName(user.roleId)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  Tidak ada data user ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-popup">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                {editingId ? 'Edit User' : 'Tambah User Baru'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Masukkan nama"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username Login</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder="Masukkan username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  placeholder={editingId ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                  required={!editingId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Akses</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  required
                >
                  <option value="" disabled>Pilih Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 rounded-xl font-medium transition-colors shadow-sm"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
