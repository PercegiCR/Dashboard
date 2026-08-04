import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Download, FileSpreadsheet } from 'lucide-react';
import Swal from 'sweetalert2';

const ExportData = () => {
  const { salesOrders, purchaseOrders, products, inventory, customers, vendors } = useAppContext();

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      Swal.fire('Perhatian', 'Tidak ada data untuk diexport.', 'warning');
      return;
    }

    // Get headers (only primitive values, ignore arrays/objects)
    const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object' && !Array.isArray(data[0][key]));
    
    // Convert data to CSV rows
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add header row
    
    for (const row of data) {
      const values = headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = '';
        // Escape quotes and wrap in quotes if contains comma or newline
        const stringVal = String(val);
        let escaped = stringVal.replace(/"/g, '""');
        if (escaped.search(/("|,|\n)/g) >= 0) {
          escaped = `"${escaped}"`;
        }
        return escaped;
      });
      csvRows.push(values.join(','));
    }
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportModules = [
    { id: 'so', name: 'Data Sales Order (SO)', description: 'Export data transaksi penjualan', data: salesOrders, filename: 'data_so' },
    { id: 'po', name: 'Data Purchase Order (PO)', description: 'Export data transaksi pembelian', data: purchaseOrders, filename: 'data_po' },
    { id: 'product', name: 'Data Produk', description: 'Export master data menu/produk', data: products, filename: 'data_produk' },
    { id: 'inventory', name: 'Data Inventory', description: 'Export master data bahan dan alat', data: inventory, filename: 'data_inventory' },
    { id: 'customer', name: 'Data Customer', description: 'Export master data pelanggan', data: customers, filename: 'data_customer' },
    { id: 'vendor', name: 'Data Vendor', description: 'Export master data pemasok', data: vendors, filename: 'data_vendor' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Export Masal</h1>
        <p className="text-gray-500 mt-1">Export data sistem ke dalam format CSV untuk keperluan backup atau pelaporan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportModules.map(mod => (
          <div key={mod.id} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{mod.name}</h3>
                <p className="text-sm text-gray-500">{mod.description}</p>
                <p className="text-xs text-gray-400 mt-1">Total: {mod.data.length} baris data</p>
              </div>
            </div>
            <button 
              onClick={() => exportToCSV(mod.data, mod.filename)}
              disabled={mod.data.length === 0}
              className={`flex items-center justify-center p-3 rounded-xl transition-all ${
                mod.data.length > 0 
                  ? 'bg-gray-100 text-gray-700 hover:bg-amber-500 hover:text-white cursor-pointer' 
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
              title="Export ke CSV"
            >
              <Download size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExportData;
