import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, setDoc } from 'firebase/firestore';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const convertQty = (qty, fromUnit, toUnit) => {
  if (!fromUnit || !toUnit) return qty;
  
  const f = fromUnit.toLowerCase();
  const t = toUnit.toLowerCase();
  
  if (f === t) return qty;
  
  if (f === 'gram' && (t === 'kg' || t === 'kilogram')) return qty / 1000;
  if ((f === 'kg' || f === 'kilogram') && t === 'gram') return qty * 1000;
  
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
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [settings, setSettings] = useState({
    shopName: 'Percegi Coffee',
    shopAddress: 'Jl. Kopi Nusantara No. 1, Jakarta',
    shopPhone: '0812-3456-7890'
  });

  useEffect(() => {
    const unsubVendors = onSnapshot(collection(db, 'vendors'), snap => {
      setVendors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCustomers = onSnapshot(collection(db, 'customers'), snap => {
      setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubInventory = onSnapshot(collection(db, 'inventory'), snap => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubProducts = onSnapshot(collection(db, 'products'), snap => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubSalesOrders = onSnapshot(collection(db, 'salesOrders'), snap => {
      setSalesOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubPurchaseOrders = onSnapshot(collection(db, 'purchaseOrders'), snap => {
      setPurchaseOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), docSnap => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    });

    return () => {
      unsubVendors();
      unsubCustomers();
      unsubInventory();
      unsubProducts();
      unsubSalesOrders();
      unsubPurchaseOrders();
      unsubSettings();
    };
  }, []);

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    await setDoc(doc(db, 'settings', 'global'), updated, { merge: true });
  };

  const addVendor = async (vendor) => {
    const { id: _id, ...rest } = vendor;
    await addDoc(collection(db, 'vendors'), rest);
  };
  const updateVendor = async (id, vendor) => {
    await updateDoc(doc(db, 'vendors', id), vendor);
  };
  const deleteVendor = async (id) => {
    await deleteDoc(doc(db, 'vendors', id));
  };

  const addCustomer = async (customer) => {
    const { id: _id, ...rest } = customer;
    await addDoc(collection(db, 'customers'), rest);
  };
  const updateCustomer = async (id, customer) => {
    await updateDoc(doc(db, 'customers', id), customer);
  };
  const deleteCustomer = async (id) => {
    await deleteDoc(doc(db, 'customers', id));
  };

  const addInventory = async (item) => {
    const { id: _id, ...rest } = item;
    await addDoc(collection(db, 'inventory'), rest);
  };
  const updateInventory = async (id, item) => {
    await updateDoc(doc(db, 'inventory', id), item);
  };
  const deleteInventory = async (id) => {
    await deleteDoc(doc(db, 'inventory', id));
  };

  const addProduct = async (product) => {
    const { id: _id, ...rest } = product;
    await addDoc(collection(db, 'products'), { stock: 0, recipe: [], ...rest });
  };
  const updateProduct = async (id, product) => {
    await updateDoc(doc(db, 'products', id), product);
  };
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
  };

  const produceProduct = async (productId, qty) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Produk tidak ditemukan' };

    let canProduce = true;
    let message = '';
    
    // Check stock
    for (const r of (product.recipe || [])) {
      const invItem = inventory.find(i => i.id === r.inventoryId);
      if (!invItem) continue;
      
      const neededQty = convertQty(r.qty * qty, r.unit, invItem.unit);
      if (invItem.stock < neededQty) {
        canProduce = false;
        message = `Stok bahan ${invItem.name} tidak mencukupi untuk memproduksi ${qty} item. (Butuh ${neededQty} ${invItem.unit})`;
        break;
      }
    }
    
    if (!canProduce) return { success: false, message };

    try {
      const batch = writeBatch(db);
      
      // Deduct inventory
      for (const r of (product.recipe || [])) {
        const invItem = inventory.find(i => i.id === r.inventoryId);
        if (invItem) {
          const neededQty = convertQty(r.qty * qty, r.unit, invItem.unit);
          const invRef = doc(db, 'inventory', invItem.id);
          batch.update(invRef, { stock: invItem.stock - neededQty });
        }
      }
      
      // Add product stock
      const prodRef = doc(db, 'products', productId);
      batch.update(prodRef, { stock: (product.stock || 0) + Number(qty) });
      
      await batch.commit();
      return { success: true, message: 'Berhasil diproduksi' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Gagal memproduksi karena error server' };
    }
  };

  const addSalesOrder = async (so) => {
    const { id: _id, ...rest } = so;
    const newSoNumber = generateOrderNumber('SO', salesOrders, 'soNumber');
    
    try {
      const batch = writeBatch(db);
      
      // Add order
      const newOrderRef = doc(collection(db, 'salesOrders'));
      batch.set(newOrderRef, { soNumber: newSoNumber, date: new Date().toISOString().split('T')[0], ...rest });
      
      // Deduct product stock
      so.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const prodRef = doc(db, 'products', prod.id);
          batch.update(prodRef, { stock: (prod.stock || 0) - item.qty });
        }
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };
  const updateSalesOrder = async (id, so) => {
    await updateDoc(doc(db, 'salesOrders', id), so);
  };
  const deleteSalesOrder = async (id) => {
    const so = salesOrders.find(s => s.id === id);
    if (!so) return;

    try {
      const batch = writeBatch(db);
      
      // Return product stock
      so.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const prodRef = doc(db, 'products', prod.id);
          batch.update(prodRef, { stock: (prod.stock || 0) + item.qty });
        }
      });
      
      // Delete order
      batch.delete(doc(db, 'salesOrders', id));
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const addPurchaseOrder = async (po) => {
    const { id: _id, ...rest } = po;
    const newPoNumber = generateOrderNumber('PO', purchaseOrders, 'poNumber');
    await addDoc(collection(db, 'purchaseOrders'), { poNumber: newPoNumber, date: new Date().toISOString().split('T')[0], ...rest });
  };
  const updatePurchaseOrder = async (id, po) => {
    await updateDoc(doc(db, 'purchaseOrders', id), po);
  };
  const deletePurchaseOrder = async (id) => {
    await deleteDoc(doc(db, 'purchaseOrders', id));
  };

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
