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
const initialVendors = [];

const initialCustomers = [];

const initialInventory = [];

const initialProducts = [];

const initialSalesOrders = [];

const initialPurchaseOrders = [];

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

  const defaultSettings = {
    shopName: 'Percegi Coffee',
    shopAddress: 'Jl. Kopi Nusantara No. 1, Jakarta',
    shopPhone: '0812-3456-7890'
  };
  const [settings, setSettings] = useState(() => loadData('settings', defaultSettings));

  // Save to localStorage whenever data changes
  useEffect(() => localStorage.setItem('vendors', JSON.stringify(vendors)), [vendors]);
  useEffect(() => localStorage.setItem('customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('salesOrders', JSON.stringify(salesOrders)), [salesOrders]);
  useEffect(() => localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders)), [purchaseOrders]);
  useEffect(() => localStorage.setItem('settings', JSON.stringify(settings)), [settings]);

  // Actions
  const updateSettings = (newSettings) => setSettings({ ...settings, ...newSettings });

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
    settings, updateSettings,
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
