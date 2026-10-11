import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Save, Building2, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

const InvoiceSettings = () => {
  const { settings, updateSettings } = useAppContext();
  const [formData, setFormData] = useState({
    shopName: '',
    shopAddress: '',
    shopPhone: '',
    bankName: 'BCA',
    bankAccountNumber: '',
    bankAccountName: '',
    paymentNotes: 'Pembayaran dapat ditransfer melalui rekening resmi berikut:'
  });
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        shopName: settings.shopName || 'Percegi Coffee Roastery',
        shopAddress: settings.shopAddress || 'Jl. Otista Raya Cawang 1',
        shopPhone: settings.shopPhone || '0813-4037-2830',
        bankName: settings.bankName || 'BCA',
        bankAccountNumber: settings.bankAccountNumber || '',
        bankAccountName: settings.bankAccountName || settings.shopName || 'Percegi Coffee Roastery',
        paymentNotes: settings.paymentNotes || 'Pembayaran dapat ditransfer melalui rekening resmi berikut:'
      }));
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      setSaveStatus('Tersimpan!');
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengaturan invoice dan rekening pembayaran berhasil disimpan.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      Swal.fire('Error', error.message || 'Gagal menyimpan pengaturan.', 'error');
    }
  };

  const popularBanks = ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'CIMB Niaga', 'Permata', 'Jago'];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan Invoice</h1>
        <p className="text-gray-500 mt-1">
          Atur informasi profil toko serta rekening pembayaran yang akan ditampilkan pada Invoice Sales Order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Settings */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            
            {/* Section 1: Profil Toko */}
            <div className="pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4 text-amber-700">
                <Building2 size={20} />
                <h2 className="text-base font-bold text-gray-800">Profil Usaha / Toko</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Toko / Usaha</label>
                  <input 
                    type="text" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-sm font-medium"
                    value={formData.shopName} 
                    onChange={e => setFormData({...formData, shopName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Lengkap</label>
                  <textarea 
                    required rows="2"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 resize-none text-sm"
                    value={formData.shopAddress} 
                    onChange={e => setFormData({...formData, shopAddress: e.target.value})}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. Telepon / WhatsApp</label>
                  <input 
                    type="text" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-sm font-medium"
                    value={formData.shopPhone} 
                    onChange={e => setFormData({...formData, shopPhone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Informasi Rekening Pembayaran */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-emerald-700">
                <CreditCard size={20} />
                <h2 className="text-base font-bold text-gray-800">Rekening Pembayaran Invoice</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Bank</label>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="text" required
                      placeholder="Contoh: BCA / Mandiri / BRI / BNI"
                      list="bank-list"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-sm font-semibold"
                      value={formData.bankName} 
                      onChange={e => setFormData({...formData, bankName: e.target.value})}
                    />
                    <datalist id="bank-list">
                      {popularBanks.map(b => <option key={b} value={b} />)}
                    </datalist>
                    {/* Quick bank chips */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {popularBanks.slice(0, 5).map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setFormData({...formData, bankName: b})}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                            formData.bankName.toUpperCase() === b
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Rekening</label>
                    <input 
                      type="text" required
                      placeholder="Contoh: 1234567890"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 font-mono font-bold text-sm tracking-wide"
                      value={formData.bankAccountNumber} 
                      onChange={e => setFormData({...formData, bankAccountNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Atas Nama (A/N)</label>
                    <input 
                      type="text" required
                      placeholder="Contoh: Percegi Coffee Roastery"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-sm font-medium"
                      value={formData.bankAccountName} 
                      onChange={e => setFormData({...formData, bankAccountName: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Kalimat Petunjuk Pembayaran di Invoice
                  </label>
                  <textarea 
                    rows="2"
                    placeholder="Contoh: Pembayaran dapat ditransfer melalui rekening resmi berikut:"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-sm resize-none"
                    value={formData.paymentNotes} 
                    onChange={e => setFormData({...formData, paymentNotes: e.target.value})}
                  ></textarea>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Kalimat pengantar yang akan tampil di atas rincian nomor rekening pada invoice.
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <button 
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Save size={18} /> Simpan Pengaturan
              </button>
              {saveStatus && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5 animate-pulse text-sm">
                  <CheckCircle2 size={16} /> {saveStatus}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-5 sticky top-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
            <Sparkles size={16} className="text-amber-500" />
            <span>Pratinjau Tampilan di Invoice</span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200/80">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <span className="text-xs font-semibold text-gray-400 block mb-1">KOP INVOICE</span>
              <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{formData.shopName || 'Nama Toko'}</h3>
              <p className="text-xs text-gray-500 mt-1">{formData.shopAddress || 'Alamat toko'}</p>
              <p className="text-xs text-gray-500">{formData.shopPhone || 'No. telp'}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Informasi Pembayaran / Transfer
                </h4>
              </div>

              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                {formData.paymentNotes || 'Pembayaran dapat ditransfer melalui rekening resmi berikut:'}
              </p>

              <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Bank</span>
                  <span className="font-bold text-slate-800 text-sm">{formData.bankName || 'BCA'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">No. Rekening</span>
                  <span className="font-mono font-extrabold text-amber-700 text-sm sm:text-base tracking-wider">
                    {formData.bankAccountNumber || 'Belum diisi'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-1.5">
                  <span className="text-slate-400 font-medium">Atas Nama</span>
                  <span className="font-semibold text-slate-700">{formData.bankAccountName || formData.shopName || '-'}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 italic">
                *Mohon sertakan no. invoice pada berita transfer dan kirimkan bukti bayar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSettings;
