import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Helper to load from localStorage
const loadData = (key, defaultData) => {
  const saved = localStorage.getItem(key);
  if (saved) {
    let parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      let changed = false;
      parsed = parsed.map((item, idx) => {
        if (!item.id) {
          changed = true;
          return { ...item, id: `${key.charAt(0).toUpperCase()}${Date.now()}${idx}` };
        }
        return item;
      });
      if (changed) localStorage.setItem(key, JSON.stringify(parsed));
    }
    return parsed;
  }
  return defaultData;
};

// Helper: get date N days ago as string
const dateOffset = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Initial Mock Data
const initialVendors = [
  { id: 'V1', name: 'PT Biji Kopi Nusantara', contact: 'Budi', phone: '0812345678', address: 'Jl. Kopi No.1', category: 'Bahan' },
  { id: 'V2', name: 'CV Sumber Susu Segar', contact: 'Ani', phone: '0813456789', address: 'Jl. Susu No.5', category: 'Bahan' },
];

const initialCustomers = [
  { id: 'C1', name: 'John Doe', phone: '0812999999', email: 'john@example.com', address: 'Jl. Sudirman', type: 'Retail' },
  { id: 'C2', name: 'Siti Rahayu', phone: '0811888888', email: 'siti@example.com', address: 'Jl. Thamrin', type: 'Retail' },
  { id: 'C3', name: 'Kafe Maju Jaya', phone: '0819777777', email: 'kafe@example.com', address: 'Jl. Kebon Jeruk', type: 'Wholesale' },
];

const initialInventory = [
  { id: 'I1', code: 'INV-001', name: 'Biji Kopi Arabica', category: 'Bahan', unit: 'kg', price: 200000, stock: 10 },
  { id: 'I2', code: 'INV-002', name: 'Susu Full Cream', category: 'Bahan', unit: 'liter', price: 18000, stock: 50 },
  { id: 'I3', code: 'INV-003', name: 'Gula Aren', category: 'Bahan', unit: 'kg', price: 30000, stock: 20 },
];

const initialProducts = [
  { id: 'P1', code: 'PRD-001', name: 'Kopi Susu Aren', price: 28000, category: 'Minuman', stock: 10, recipe: [{inventoryId: 'I1', qty: 0.02}, {inventoryId: 'I2', qty: 0.15}, {inventoryId: 'I3', qty: 0.02}] },
  { id: 'P2', code: 'PRD-002', name: 'Americano', price: 22000, category: 'Minuman', stock: 20, recipe: [{inventoryId: 'I1', qty: 0.02}] },
  { id: 'P3', code: 'PRD-003', name: 'Cappuccino', price: 30000, category: 'Minuman', stock: 15, recipe: [{inventoryId: 'I1', qty: 0.02}, {inventoryId: 'I2', qty: 0.2}] },
  { id: 'P4', code: 'PRD-004', name: 'Matcha Latte', price: 32000, category: 'Minuman', stock: 5, recipe: [{inventoryId: 'I2', qty: 0.2}] },
];

// Demo Sales Orders with spread-out dates (last 30 days)
const initialSalesOrders = [
  { id: 'SO1', soNumber: 'SO-001', date: dateOffset(0), customerId: 'C1', items: [{ name: 'Kopi Susu Aren', qty: 3, price: 28000, subtotal: 84000 }], total: 84000, status: 'Lunas' },
  { id: 'SO2', soNumber: 'SO-002', date: dateOffset(0), customerId: 'C2', items: [{ name: 'Americano', qty: 2, price: 22000, subtotal: 44000 }], total: 44000, status: 'Pending' },
  { id: 'SO3', soNumber: 'SO-003', date: dateOffset(1), customerId: 'C3', items: [{ name: 'Cappuccino', qty: 10, price: 30000, subtotal: 300000 }], total: 300000, status: 'Lunas' },
  { id: 'SO4', soNumber: 'SO-004', date: dateOffset(2), customerId: 'C1', items: [{ name: 'Matcha Latte', qty: 2, price: 32000, subtotal: 64000 }], total: 64000, status: 'Lunas' },
  { id: 'SO5', soNumber: 'SO-005', date: dateOffset(3), customerId: 'C2', items: [{ name: 'Kopi Susu Aren', qty: 4, price: 28000, subtotal: 112000 }], total: 112000, status: 'Lunas' },
  { id: 'SO6', soNumber: 'SO-006', date: dateOffset(5), customerId: 'C3', items: [{ name: 'Americano', qty: 5, price: 22000, subtotal: 110000 }], total: 110000, status: 'Lunas' },
  { id: 'SO7', soNumber: 'SO-007', date: dateOffset(7), customerId: 'C1', items: [{ name: 'Cappuccino', qty: 3, price: 30000, subtotal: 90000 }], total: 90000, status: 'Lunas' },
  { id: 'SO8', soNumber: 'SO-008', date: dateOffset(10), customerId: 'C2', items: [{ name: 'Kopi Susu Aren', qty: 6, price: 28000, subtotal: 168000 }], total: 168000, status: 'Lunas' },
  { id: 'SO9', soNumber: 'SO-009', date: dateOffset(14), customerId: 'C3', items: [{ name: 'Matcha Latte', qty: 8, price: 32000, subtotal: 256000 }], total: 256000, status: 'Lunas' },
  { id: 'SO10', soNumber: 'SO-010', date: dateOffset(20), customerId: 'C1', items: [{ name: 'Americano', qty: 4, price: 22000, subtotal: 88000 }], total: 88000, status: 'Lunas' },
  { id: 'SO11', soNumber: 'SO-011', date: dateOffset(25), customerId: 'C2', items: [{ name: 'Cappuccino', qty: 5, price: 30000, subtotal: 150000 }], total: 150000, status: 'Lunas' },
];

// Demo Purchase Orders with spread-out dates
const initialPurchaseOrders = [
  { id: 'PO1', poNumber: 'PO-001', date: dateOffset(1), vendorId: 'V1', items: [{ name: 'Biji Kopi Arabica', qty: 2, price: 200000, subtotal: 400000, unit: 'kg' }], total: 400000, status: 'Lunas' },
  { id: 'PO2', poNumber: 'PO-002', date: dateOffset(3), vendorId: 'V2', items: [{ name: 'Susu Full Cream', qty: 10, price: 18000, subtotal: 180000, unit: 'liter' }], total: 180000, status: 'Hutang' },
  { id: 'PO3', poNumber: 'PO-003', date: dateOffset(7), vendorId: 'V1', items: [{ name: 'Gula Aren', qty: 5, price: 30000, subtotal: 150000, unit: 'kg' }], total: 150000, status: 'Lunas' },
  { id: 'PO4', poNumber: 'PO-004', date: dateOffset(12), vendorId: 'V2', items: [{ name: 'Susu Full Cream', qty: 20, price: 18000, subtotal: 360000, unit: 'liter' }], total: 360000, status: 'Lunas' },
  { id: 'PO5', poNumber: 'PO-005', date: dateOffset(20), vendorId: 'V1', items: [{ name: 'Biji Kopi Arabica', qty: 3, price: 200000, subtotal: 600000, unit: 'kg' }], total: 600000, status: 'Lunas' },
  { id: 'PO6', poNumber: 'PO-006', date: dateOffset(28), vendorId: 'V2', items: [{ name: 'Gula Aren', qty: 8, price: 30000, subtotal: 240000, unit: 'kg' }], total: 240000, status: 'Lunas' },
];

const convertQty = (qty, fromUnit, toUnit) => {
  if (!fromUnit || !toUnit) return qty;
  
  const f = fromUnit.toLowerCase();
  const t = toUnit.toLowerCase();
  
  if (f === t) return qty;
  
  // Weight
  if (f === 'gram' && (t === 'kg' || t === 'kilogram')) return qty / 1000;
  if ((f === 'kg' || f === 'kilogram') && t === 'gram') return qty * 1000;
  
  // Volume
  if (f === 'ml' && (t === 'liter' || t === 'l')) return qty / 1000;
  if ((f === 'liter' || f === 'l') && t === 'ml') return qty * 1000;
  
  return qty;
};

const generateOrderNumber = (prefix, existingOrders, fieldName) => {
  const date = new Date();
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  
  const datePrefix = `${prefix}-${d}${m}${y}`;
  let maxSeq = 0;
  
  existingOrders.forEach(order => {
    const val = order[fieldName];
    if (val && val.startsWith(datePrefix)) {
      const seq = parseInt(val.replace(datePrefix, ''), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });
  
  const nextSeq = maxSeq + 1;
  return `${datePrefix}${String(nextSeq).padStart(2, '0')}`;
};

export const AppProvider = ({ children }) => {
  const [vendors, setVendors] = useState(() => loadData('vendors', initialVendors));
  const [customers, setCustomers] = useState(() => loadData('customers', initialCustomers));
  const [inventory, setInventory] = useState(() => loadData('inventory', initialInventory));
  const [products, setProducts] = useState(() => loadData('products', initialProducts));
  const [salesOrders, setSalesOrders] = useState(() => loadData('salesOrders', initialSalesOrders));
  const [purchaseOrders, setPurchaseOrders] = useState(() => loadData('purchaseOrders', initialPurchaseOrders));

  // Save to localStorage whenever data changes
  useEffect(() => localStorage.setItem('vendors', JSON.stringify(vendors)), [vendors]);
  useEffect(() => localStorage.setItem('customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('salesOrders', JSON.stringify(salesOrders)), [salesOrders]);
  useEffect(() => localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders)), [purchaseOrders]);

  // Actions
  const addVendor = (vendor) => {
    const { id, ...rest } = vendor;
    setVendors([...vendors, { id: `V${Date.now()}`, ...rest }]);
  };
  const updateVendor = (id, vendor) => setVendors(vendors.map(v => v.id === id ? { ...v, ...vendor } : v));
  const deleteVendor = (id) => setVendors(vendors.filter(v => v.id !== id));

  const addCustomer = (customer) => {
    const { id, ...rest } = customer;
    setCustomers([...customers, { id: `C${Date.now()}`, ...rest }]);
  };
  const updateCustomer = (id, customer) => setCustomers(customers.map(c => c.id === id ? { ...c, ...customer } : c));
  const deleteCustomer = (id) => setCustomers(customers.filter(c => c.id !== id));

  const addInventory = (item) => {
    const { id, ...rest } = item;
    setInventory([...inventory, { id: `I${Date.now()}`, ...rest }]);
  };
  const updateInventory = (id, item) => setInventory(inventory.map(i => i.id === id ? { ...i, ...item } : i));
  const deleteInventory = (id) => setInventory(inventory.filter(i => i.id !== id));

  const addProduct = (product) => {
    const { id, ...rest } = product;
    setProducts([...products, { id: `P${Date.now()}`, stock: 0, recipe: [], ...rest }]);
  };
  const updateProduct = (id, product) => setProducts(products.map(p => p.id === id ? { ...p, ...product } : p));
  const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));

  const produceProduct = (productId, qty) => {
    let success = true;
    let message = '';
    
    setProducts(prevProducts => {
      const productIndex = prevProducts.findIndex(p => p.id === productId);
      if (productIndex === -1) {
        success = false;
        message = 'Produk tidak ditemukan';
        return prevProducts;
      }
      
      const product = prevProducts[productIndex];
      let canProduce = true;
      
      // We need to check and deduct inventory, so we do it via setInventory to ensure we have latest state
      setInventory(prevInv => {
        let invCopy = [...prevInv];
        for (const r of (product.recipe || [])) {
          const invItem = invCopy.find(i => i.id === r.inventoryId);
          if (!invItem) continue;
          
          const neededQty = convertQty(r.qty * qty, r.unit, invItem.unit);
          if (invItem.stock < neededQty) {
            canProduce = false;
            message = `Stok bahan ${invItem.name} tidak mencukupi untuk memproduksi ${qty} item. (Butuh ${neededQty} ${invItem.unit})`;
            return prevInv; // abort
          }
        }
        
        if (canProduce) {
          // deduct
          for (const r of (product.recipe || [])) {
            const invIndex = invCopy.findIndex(i => i.id === r.inventoryId);
            if (invIndex !== -1) {
              const neededQty = convertQty(r.qty * qty, r.unit, invCopy[invIndex].unit);
              invCopy[invIndex] = { ...invCopy[invIndex], stock: invCopy[invIndex].stock - neededQty };
            }
          }
          return invCopy;
        }
        return prevInv;
      });

      if (canProduce) {
        const newProducts = [...prevProducts];
        newProducts[productIndex] = { ...product, stock: (product.stock || 0) + Number(qty) };
        return newProducts;
      }
      
      success = false;
      return prevProducts;
    });
    
    return { success, message };
  };

  const addSalesOrder = (so) => {
    const { id, ...rest } = so;
    setSalesOrders(prev => {
      const newSoNumber = generateOrderNumber('SO', prev, 'soNumber');
      return [...prev, { id: newSoNumber, soNumber: newSoNumber, date: new Date().toISOString().split('T')[0], ...rest }];
    });
    // Deduct product stock
    setProducts(prevProducts => {
      let updatedProducts = [...prevProducts];
      so.items.forEach(item => {
        const prodIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (prodIndex >= 0) {
          updatedProducts[prodIndex] = { ...updatedProducts[prodIndex], stock: (updatedProducts[prodIndex].stock || 0) - item.qty };
        }
      });
      return updatedProducts;
    });
  };
  const updateSalesOrder = (id, so) => setSalesOrders(salesOrders.map(s => s.id === id ? { ...s, ...so } : s));
  const deleteSalesOrder = (id) => {
    const so = salesOrders.find(s => s.id === id);
    if (so) {
      setProducts(prevProducts => {
        let updatedProducts = [...prevProducts];
        so.items.forEach(item => {
          const prodIndex = updatedProducts.findIndex(p => p.id === item.productId);
          if (prodIndex >= 0) {
            updatedProducts[prodIndex] = { ...updatedProducts[prodIndex], stock: (updatedProducts[prodIndex].stock || 0) + item.qty };
          }
        });
        return updatedProducts;
      });
    }
    setSalesOrders(salesOrders.filter(s => s.id !== id));
  };

  const addPurchaseOrder = (po) => {
    const { id, ...rest } = po;
    setPurchaseOrders(prev => {
      const newPoNumber = generateOrderNumber('PO', prev, 'poNumber');
      return [...prev, { id: newPoNumber, poNumber: newPoNumber, date: new Date().toISOString().split('T')[0], ...rest }];
    });
  };
  const updatePurchaseOrder = (id, po) => setPurchaseOrders(purchaseOrders.map(p => p.id === id ? { ...p, ...po } : p));
  const deletePurchaseOrder = (id) => setPurchaseOrders(purchaseOrders.filter(p => p.id !== id));

  const value = {
    vendors, addVendor, updateVendor, deleteVendor,
    customers, addCustomer, updateCustomer, deleteCustomer,
    inventory, addInventory, updateInventory, deleteInventory,
    products, addProduct, updateProduct, deleteProduct, produceProduct,
    salesOrders, addSalesOrder, updateSalesOrder, deleteSalesOrder,
    purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
