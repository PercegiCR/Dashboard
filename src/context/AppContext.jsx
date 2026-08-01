import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Helper to load from localStorage
const loadData = (key, defaultData) => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  return defaultData;
};

// Initial Mock Data
const initialVendors = [
  { id: 'V1', name: 'PT Biji Kopi Nusantara', contact: 'Budi', phone: '0812345678', address: 'Jl. Kopi No.1', category: 'Bahan' }
];

const initialCustomers = [
  { id: 'C1', name: 'John Doe', phone: '0812999999', email: 'john@example.com', address: 'Jl. Sudirman', type: 'Retail' }
];

const initialInventory = [
  { id: 'I1', code: 'INV-001', name: 'Biji Kopi Arabica', category: 'Bahan', unit: 'kg', price: 200000, stock: 10 }
];

const initialProducts = [
  { id: 'P1', code: 'PRD-001', name: 'Kopi Susu Aren', price: 25000, category: 'Minuman' },
  { id: 'P2', code: 'PRD-002', name: 'Americano', price: 20000, category: 'Minuman' }
];

export const AppProvider = ({ children }) => {
  const [vendors, setVendors] = useState(() => loadData('vendors', initialVendors));
  const [customers, setCustomers] = useState(() => loadData('customers', initialCustomers));
  const [inventory, setInventory] = useState(() => loadData('inventory', initialInventory));
  const [products, setProducts] = useState(() => loadData('products', initialProducts));
  const [salesOrders, setSalesOrders] = useState(() => loadData('salesOrders', []));
  const [purchaseOrders, setPurchaseOrders] = useState(() => loadData('purchaseOrders', []));

  // Save to localStorage whenever data changes
  useEffect(() => localStorage.setItem('vendors', JSON.stringify(vendors)), [vendors]);
  useEffect(() => localStorage.setItem('customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('salesOrders', JSON.stringify(salesOrders)), [salesOrders]);
  useEffect(() => localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders)), [purchaseOrders]);

  // Actions
  const addVendor = (vendor) => setVendors([...vendors, { id: `V${Date.now()}`, ...vendor }]);
  const updateVendor = (id, vendor) => setVendors(vendors.map(v => v.id === id ? { ...v, ...vendor } : v));
  const deleteVendor = (id) => setVendors(vendors.filter(v => v.id !== id));

  const addCustomer = (customer) => setCustomers([...customers, { id: `C${Date.now()}`, ...customer }]);
  const updateCustomer = (id, customer) => setCustomers(customers.map(c => c.id === id ? { ...c, ...customer } : c));
  const deleteCustomer = (id) => setCustomers(customers.filter(c => c.id !== id));

  const addInventory = (item) => setInventory([...inventory, { id: `I${Date.now()}`, ...item }]);
  const updateInventory = (id, item) => setInventory(inventory.map(i => i.id === id ? { ...i, ...item } : i));
  const deleteInventory = (id) => setInventory(inventory.filter(i => i.id !== id));

  const addProduct = (product) => setProducts([...products, { id: `P${Date.now()}`, ...product }]);
  const updateProduct = (id, product) => setProducts(products.map(p => p.id === id ? { ...p, ...product } : p));
  const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));

  const addSalesOrder = (so) => {
    setSalesOrders([...salesOrders, { id: `SO-${Date.now()}`, soNumber: `SO-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...so }]);
  };
  const updateSalesOrder = (id, so) => setSalesOrders(salesOrders.map(s => s.id === id ? { ...s, ...so } : s));

  const addPurchaseOrder = (po) => {
    setPurchaseOrders([...purchaseOrders, { id: `PO-${Date.now()}`, poNumber: `PO-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...po }]);
  };
  const updatePurchaseOrder = (id, po) => setPurchaseOrders(purchaseOrders.map(p => p.id === id ? { ...p, ...po } : p));

  const value = {
    vendors, addVendor, updateVendor, deleteVendor,
    customers, addCustomer, updateCustomer, deleteCustomer,
    inventory, addInventory, updateInventory, deleteInventory,
    products, addProduct, updateProduct, deleteProduct,
    salesOrders, addSalesOrder, updateSalesOrder,
    purchaseOrders, addPurchaseOrder, updatePurchaseOrder
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
