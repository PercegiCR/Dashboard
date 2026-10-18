import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, X, Search, CheckCircle2, AlertCircle, Clock, ShieldAlert, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

const formatRp = (num) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
};

const CustomerData = () => {
  const { customers, salesOrders, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    type: 'Umum',
    termin: 'Cash',
    customTermin: '',
    statusPembayaran: 'Lancar'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'lancar', 'outstanding'

  const getCustomerPaymentInfo = (customerId) => {
    const custOrders = (salesOrders || []).filter(so => so.customerId === customerId);
    const outstanding = custOrders.filter(so => {
      const st = (so.status || '').toLowerCase();
      return st === 'belum lunas' || st === 'pending' || st === 'onhold' || st === 'on hold';
    });
    const totalOutstanding = outstanding.reduce((sum, so) => sum + (Number(so.total) || 0), 0);
    return {
      totalOrders: custOrders.length,
      outstandingOrders: outstanding,
      outstandingCount: outstanding.length,
      totalOutstanding,
      hasOutstanding: outstanding.length > 0
    };
  };

  const filteredcustomers = customers.filter(item => {
    const matchesSearch = Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!matchesSearch) return false;

    if (selectedFilter === 'outstanding') {
      const info = getCustomerPaymentInfo(item.id);
      return info.hasOutstanding || (item.statusPembayaran && item.statusPembayaran !== 'Lancar');
    }
    if (selectedFilter === 'lancar') {
      const info = getCustomerPaymentInfo(item.id);
      return !info.hasOutstanding && (!item.statusPembayaran || item.statusPembayaran === 'Lancar');
    }
    return true;
  });

  // Calculate customer payment stats
  const totalCustomersCount = customers.length;
  let customersWithDebtCount = 0;
  let totalOutstandingAmount = 0;

  customers.forEach(c => {
    const info = getCustomerPaymentInfo(c.id);
    if (info.hasOutstanding) {
      customersWithDebtCount++;
      totalOutstandingAmount += info.totalOutstanding;
    }
  });

  const handleOpenModal = (customer = null) => {
    if (customer) {
      const isPresetTermin = ['Cash', 'Net 7 Hari', 'Net 14 Hari', 'Net 30 Hari', 'Net 45 Hari', 'Net 60 Hari'].includes(customer.termin);
      setFormData({
        id: customer.id,
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        type: customer.type || 'Umum',
        termin: isPresetTermin ? customer.termin : (customer.termin ? 'Custom' : 'Cash'),
        customTermin: isPresetTermin ? '' : (customer.termin || ''),
        statusPembayaran: customer.statusPembayaran || 'Lancar'
      });
    } else {
      setFormData({ 
        id: null, 
        name: '', 
        phone: '', 
        email: '', 
        address: '', 
        type: 'Umum',
        termin: 'Cash',
        customTermin: '',
        statusPembayaran: 'Lancar'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalTermin = formData.termin === 'Custom' 
      ? (formData.customTermin.trim() || 'Cash') 
      : formData.termin;

    const dataToSave = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      type: formData.type,
      termin: finalTermin,
      statusPembayaran: formData.statusPembayaran
    };

    if (formData.id) {
      updateCustomer(formData.id, dataToSave);
    } else {
      addCustomer(dataToSave);
    }
    setIsModalOpen(false);
  };

  const showOutstandingDetails = (customer, info) => {
    const ordersListHtml = info.outstandingOrders.map(so => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:6px; font-size:13px;">
        <div style="text-align:left;">
          <strong style="color:#d97706;">${so.soNumber}</strong>
          <span style="color:#6b7280; font-size:11px; margin-left:6px;">(${so.date})</span>
          <div style="font-size:11px; color:#ef4444; font-weight:600;">Status: ${so.status}</div>
        </div>
        <div style="font-weight:700; color:#111827;">${formatRp(so.total)}</div>
      </div>
    `).join('');

    Swal.fire({
      title: `<span style="font-size:18px;">Rincian Tagihan: <b>${customer.name}</b></span>`,
      html: `
        <div style="text-align:left; margin-bottom:12px;">
          <p style="font-size:13px; color:#4b5563;">Ditemukan <b>${info.outstandingCount} Sales Order</b> belum lunas:</p>
        </div>
        <div style="max-height:240px; overflow-y:auto; margin-bottom:12px;">
          ${ordersListHtml}
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 12px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; font-size:14px; font-weight:bold; color:#991b1b;">
          <span>Total Tagihan Outstanding:</span>
          <span>${formatRp(info.totalOutstanding)}</span>
        </div>
      `,
      icon: 'warning',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Tutup'
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Customer</h1>
          <p className="text-gray-500 mt-1">Kelola data pelanggan, termin pembayaran, dan pemantauan riwayat tagihan.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={18} /> Tambah Customer
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setSelectedFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedFilter === 'all' 
              ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20' 
              : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Customer</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={18} /></span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalCustomersCount}</div>
          <p className="text-xs text-gray-500 mt-1">Semua kontak pelanggan terdaftar</p>
        </div>

        <div 
          onClick={() => setSelectedFilter('lancar')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedFilter === 'lancar' 
              ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
              : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lancar / Lunas</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={18} /></span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{totalCustomersCount - customersWithDebtCount}</div>
          <p className="text-xs text-emerald-600 mt-1">Tidak ada tagihan tertunggak</p>
        </div>

        <div 
          onClick={() => setSelectedFilter('outstanding')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedFilter === 'outstanding' 
              ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-500/20' 
              : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Ada Tagihan / Menunggak</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle size={18} /></span>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">{customersWithDebtCount} Pelanggan</div>
          <p className="text-xs text-rose-600 font-semibold mt-1">Outstanding: {formatRp(totalOutstandingAmount)}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-3 w-full">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari pelanggan berdasarkan nama, telepon, email, termin, status..." 
            className="w-full outline-none text-gray-700 bg-transparent text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-bold">ID</th>
              <th className="p-4 font-bold">Nama Customer</th>
              <th className="p-4 font-bold">Kontak & Alamat</th>
              <th className="p-4 font-bold">Tipe</th>
              <th className="p-4 font-bold">Termin Pembayaran</th>
              <th className="p-4 font-bold">Status Pembayaran</th>
              <th className="p-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredcustomers.map(c => {
              const paymentInfo = getCustomerPaymentInfo(c.id);

              return (
                <tr key={c.id} className="hover:bg-amber-50/30 transition-colors text-gray-700">
                  <td className="p-4 font-mono text-xs font-semibold text-gray-500">{c.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.email || 'Tanpa email'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-800 font-medium">{c.phone || '-'}</div>
                    <div className="text-xs text-gray-500 max-w-xs truncate" title={c.address || ''}>
                      {c.address || 'Alamat belum diisi'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.type === 'Wholesale' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : c.type === 'Retail'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {c.type || 'Umum'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                      <Clock size={13} className="text-amber-600" />
                      {c.termin || 'Cash'}
                    </span>
                  </td>
                  <td className="p-4">
                    {paymentInfo.hasOutstanding ? (
                      <div className="flex flex-col items-start gap-1">
                        <button 
                          onClick={() => showOutstandingDetails(c, paymentInfo)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shadow-sm cursor-pointer"
                          title="Klik untuk melihat daftar SO belum lunas"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          Belum Lunas ({paymentInfo.outstandingCount} SO)
                        </button>
                        <span className="text-[11px] font-bold text-rose-600">
                          Tagihan: {formatRp(paymentInfo.totalOutstanding)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          {c.statusPembayaran && c.statusPembayaran !== 'Belum Lunas' ? c.statusPembayaran : 'Lancar (Lunas)'}
                        </span>
                        {paymentInfo.totalOrders > 0 && (
                          <span className="text-[11px] text-gray-400">Semua SO lunas</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(c)} 
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors p-2 rounded-lg" 
                        title="Edit Customer"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          Swal.fire({
                            title: 'Hapus Pelanggan?',
                            text: `Yakin ingin menghapus ${c.name}?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#ef4444',
                            cancelButtonColor: '#6b7280',
                            confirmButtonText: 'Ya, hapus!',
                            cancelButtonText: 'Batal'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              deleteCustomer(c.id);
                              Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
                            }
                          });
                        }} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors p-2 rounded-lg" 
                        title="Hapus Customer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredcustomers.length === 0 && (
              <tr>
                <td colSpan="7" className="p-10 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search size={32} className="text-gray-300" />
                    <p className="font-semibold text-gray-600">Tidak ada data customer yang cocok.</p>
                    <p className="text-xs text-gray-400">Silakan ubah kata kunci pencarian atau filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-overlay">
          <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-2xl ring-1 ring-gray-900/5 animate-popup">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.id ? 'Edit Customer' : 'Tambah Customer'}</h2>
                <p className="text-sm text-gray-500 mt-1">Lengkapi data informasi dan termin pembayaran pelanggan.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Customer <span className="text-rose-500">*</span></label>
                <input 
                  type="text" required
                  placeholder="Contoh: Kafe Kopi Senja"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. Telepon <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" required
                    placeholder="081234567890"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (Opsional)</label>
                  <input 
                    type="email"
                    placeholder="kontak@kafe.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Lengkap</label>
                <textarea 
                  rows="2"
                  placeholder="Alamat pengiriman / domisili pelanggan..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 resize-none"
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipe Pelanggan</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Umum">Umum</option>
                    <option value="Retail">Retail (Eceran)</option>
                    <option value="Wholesale">Wholesale (Grosir / B2B)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Termin Pembayaran</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                    value={formData.termin} 
                    onChange={e => setFormData({...formData, termin: e.target.value})}
                  >
                    <option value="Cash">Cash / Tunai</option>
                    <option value="Net 7 Hari">Net 7 Hari</option>
                    <option value="Net 14 Hari">Net 14 Hari</option>
                    <option value="Net 30 Hari">Net 30 Hari</option>
                    <option value="Net 45 Hari">Net 45 Hari</option>
                    <option value="Net 60 Hari">Net 60 Hari</option>
                    <option value="Custom">Custom (Tulis Sendiri)...</option>
                  </select>
                </div>
              </div>

              {formData.termin === 'Custom' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Keterangan Termin Custom</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Tempo 10 Hari / DP 50%" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    value={formData.customTermin} 
                    onChange={e => setFormData({...formData, customTermin: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Pembayaran (Profil Akun)</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
                  value={formData.statusPembayaran} 
                  onChange={e => setFormData({...formData, statusPembayaran: e.target.value})}
                >
                  <option value="Lancar">Lancar (Kredit Baik)</option>
                  <option value="Belum Lunas">Belum Lunas (Ada Piutang)</option>
                  <option value="On Hold">On Hold (Ditahan)</option>
                  <option value="Dalam Pengawasan">Dalam Pengawasan</option>
                  <option value="Blacklist">Blacklist (Ditolak)</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  *Catatan: Status pembayaran juga terpantau dinamis berdasarkan riwayat Sales Order customer ini.
                </p>
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
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerData;
