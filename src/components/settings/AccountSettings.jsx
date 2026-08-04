import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, User, Lock, Upload, Image as ImageIcon } from 'lucide-react';

const AccountSettings = () => {
  const { currentUser, updateProfile, getRole } = useAuth();
  const [roleName, setRoleName] = useState('');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [profilePic, setProfilePic] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      const role = getRole(currentUser.roleId);
      if (role) setRoleName(role.name);
      setProfilePic(currentUser.profilePic);
    }
  }, [currentUser, getRole]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg('Password baru dan konfirmasi password tidak cocok.');
      return;
    }

    const updates = {};
    if (profilePic) updates.profilePic = profilePic;
    if (formData.password) updates.password = formData.password;

    if (Object.keys(updates).length > 0) {
      updateProfile(updates);
      setSuccessMsg('Profil berhasil diperbarui!');
      setFormData({ password: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Atur Akun</h2>
        <p className="text-gray-500 mt-1">Perbarui informasi profil dan password Anda</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-2xl">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Profile Picture Section */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <label className="w-32 h-32 rounded-full border-4 border-amber-50 bg-gray-100 overflow-hidden mb-4 relative group cursor-pointer block">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all">
                <Upload size={24} />
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
            <p className="text-sm text-gray-500 font-medium text-center">Klik foto untuk ubah</p>
          </div>

          {/* Form Fields Section */}
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                disabled
                value={currentUser.username}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Akses</label>
              <input
                type="text"
                disabled
                value={roleName.toUpperCase()}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-semibold"
              />
              <p className="text-xs text-gray-400 mt-1">Role tidak bisa diubah sendiri. Hubungi admin untuk perubahan.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 mb-8 space-y-5">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-500" />
            Ubah Password
          </h3>
          <p className="text-sm text-gray-500">Kosongkan jika tidak ingin mengubah password.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Save className="w-5 h-5" />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;
