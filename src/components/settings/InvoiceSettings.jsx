import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Save } from 'lucide-react';

const InvoiceSettings = () => {
  const { settings, updateSettings } = useAppContext();
  const [formData, setFormData] = useState(settings);
  const [saveStatus, setSaveStatus] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveStatus('Tersimpan!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Invoice</h1>
        <p className="text-gray-500 mt-1">Atur informasi toko yang akan ditampilkan pada Invoice SO dan PO.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Toko</label>
            <input 
              type="text" required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Toko</label>
            <textarea 
              required rows="3"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 resize-none"
              value={formData.shopAddress} onChange={e => setFormData({...formData, shopAddress: e.target.value})}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. Telepon / WhatsApp</label>
            <input 
              type="text" required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
              value={formData.shopPhone} onChange={e => setFormData({...formData, shopPhone: e.target.value})}
            />
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Save size={18} /> Simpan Pengaturan
            </button>
            {saveStatus && <span className="text-emerald-600 font-medium animate-pulse">{saveStatus}</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceSettings;
