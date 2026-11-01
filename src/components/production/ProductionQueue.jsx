import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle2, Clock, Coffee } from 'lucide-react';

const ProductionQueue = () => {
  const { productionNotifications, updateProductionNotification, customers } = useAppContext();
  const queue = [...productionNotifications].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  const customerName = (customerId) => customers.find(customer => customer.id === customerId)?.name || 'Customer';

  const handleStatusChange = async (item, status) => {
    try {
      await updateProductionNotification(item.id, status);
    } catch (error) {
      window.alert(error.message || 'Gagal memperbarui status produksi.');
    }
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Antrean Produksi</h1>
        <p className="mt-1 text-gray-500">SO disetujui Finance dan berstatus Lunas akan muncul di sini.</p>
      </header>
      <section className="space-y-4">
        {queue.map(item => (
          <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Coffee size={18} className="text-amber-600" />
                  <h2 className="font-bold text-gray-900">{item.soNumber}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Diproses' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{item.status || 'Baru'}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{customerName(item.customerId)} · {item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleStatusChange(item, 'Diproses')} disabled={item.status === 'Selesai'} className="flex items-center gap-1 rounded-lg border border-sky-200 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 disabled:opacity-40"><Clock size={16}/> Diproses</button>
                <button onClick={() => handleStatusChange(item, 'Selesai')} disabled={item.status === 'Selesai'} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"><CheckCircle2 size={16}/> Selesai</button>
              </div>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Item pesanan</p>
              <ul className="space-y-1 text-sm text-gray-700">
                {(item.items || []).map((product, index) => <li key={`${product.productId || product.name}-${index}`}>{product.qty} × {product.name}{product.size ? ` (${product.size})` : ''}</li>)}
              </ul>
            </div>
          </article>
        ))}
        {queue.length === 0 && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">Belum ada SO yang siap diproduksi.</div>}
      </section>
    </main>
  );
};

export default ProductionQueue;
