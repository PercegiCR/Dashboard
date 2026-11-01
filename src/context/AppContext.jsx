import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, setDoc, runTransaction } from 'firebase/firestore';

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

const generateCustomId = (prefix, existingList) => {
  let maxSeq = 0;
  existingList.forEach(item => {
    if (item.id && item.id.startsWith(prefix + '-')) {
      const seq = parseInt(item.id.replace(prefix + '-', ''), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });
  const nextSeq = maxSeq + 1;
  return `${prefix}-${String(nextSeq).padStart(4, '0')}`;
};

export const AppProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    shopName: 'Percegi Coffee Roastery',
    shopAddress: 'Jl. Otista Raya Cawang 1',
    shopPhone: '0813-4037-2830',
    bankName: 'BCA',
    bankAccountNumber: '',
    bankAccountName: 'Percegi Coffee Roastery',
    paymentNotes: 'Pembayaran dapat ditransfer melalui rekening resmi berikut:',
    qrisImageUrl: ''
  });
  const [productionNotifications, setProductionNotifications] = useState([]);

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
    const unsubCategories = onSnapshot(collection(db, 'categories'), snap => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubSalesOrders = onSnapshot(collection(db, 'salesOrders'), snap => {
      setSalesOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubPurchaseOrders = onSnapshot(collection(db, 'purchaseOrders'), snap => {
      setPurchaseOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), docSnap => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });
    const unsubProductionNotifications = onSnapshot(collection(db, 'productionNotifications'), snap => {
      setProductionNotifications(snap.docs.map(item => ({ id: item.id, ...item.data() })));
    });

    return () => {
      unsubVendors();
      unsubCustomers();
      unsubInventory();
      unsubProducts();
      unsubCategories();
      unsubSalesOrders();
      unsubPurchaseOrders();
      unsubSettings();
      unsubProductionNotifications();
    };
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    await setDoc(doc(db, 'settings', 'global'), updated, { merge: true });
  }, [settings]);

  const addVendor = useCallback(async (vendor) => {
    const { id: _id, ...rest } = vendor;
    const customId = generateCustomId('VDR', vendors);
    await setDoc(doc(db, 'vendors', customId), rest);
  }, [vendors]);
  const updateVendor = useCallback(async (id, vendor) => {
    await updateDoc(doc(db, 'vendors', id), vendor);
  }, []);
  const deleteVendor = useCallback(async (id) => {
    await deleteDoc(doc(db, 'vendors', id));
  }, []);

  const addCustomer = useCallback(async (customer) => {
    const { id: _id, ...rest } = customer;
    const customId = generateCustomId('CST', customers);
    await setDoc(doc(db, 'customers', customId), rest);
    return customId;
  }, [customers]);
  const updateCustomer = useCallback(async (id, customer) => {
    await updateDoc(doc(db, 'customers', id), customer);
  }, []);
  const deleteCustomer = useCallback(async (id) => {
    await deleteDoc(doc(db, 'customers', id));
  }, []);

  const addInventory = useCallback(async (item) => {
    const { id: _id, ...rest } = item;
    await addDoc(collection(db, 'inventory'), rest);
  }, []);
  const updateInventory = useCallback(async (id, item) => {
    await updateDoc(doc(db, 'inventory', id), item);
  }, []);
  const deleteInventory = useCallback(async (id) => {
    await deleteDoc(doc(db, 'inventory', id));
  }, []);

  const addProduct = useCallback(async (product) => {
    const { id: _id, ...rest } = product;
    await addDoc(collection(db, 'products'), { stock: 0, recipe: [], ...rest });
  }, []);
  const updateProduct = useCallback(async (id, product) => {
    await updateDoc(doc(db, 'products', id), product);
  }, []);
  const deleteProduct = useCallback(async (id) => {
    await deleteDoc(doc(db, 'products', id));
  }, []);

  const addCategory = useCallback(async (category) => {
    const { id: _id, ...rest } = category;
    await addDoc(collection(db, 'categories'), {
      showTemperature: true,
      showSugar: true,
      showExtraShot: true,
      createdAt: new Date().toISOString(),
      ...rest
    });
  }, []);
  const updateCategory = useCallback(async (id, category) => {
    await updateDoc(doc(db, 'categories', id), category);
  }, []);
  const deleteCategory = useCallback(async (id) => {
    await deleteDoc(doc(db, 'categories', id));
  }, []);

  const produceProduct = useCallback(async (productId, qty) => {
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
  }, [products, inventory]);

  const addSalesOrder = useCallback(async (so) => {
    const { id: _id, ...rest } = so;
    const newSoNumber = generateOrderNumber('SO', salesOrders, 'soNumber');
    const outstandingOrders = salesOrders.filter(order =>
      order.customerId === so.customerId &&
      ['belum lunas', 'pending', 'onhold', 'on hold'].includes(String(order.status || '').trim().toLowerCase())
    );
    const customerHasOutstanding = outstandingOrders.length > 0;
    const newOrderRef = doc(collection(db, 'salesOrders'));
    const batch = writeBatch(db);
    batch.set(newOrderRef, {
      soNumber: newSoNumber,
      date: new Date().toISOString().split('T')[0],
      ...rest,
      status: customerHasOutstanding ? 'Onhold' : 'Belum Lunas',
      ...(customerHasOutstanding ? { holdReasonSOIds: outstandingOrders.map(order => order.id) } : {}),
      approvalStatus: 'Menunggu Finance',
      approvalCreatedAt: new Date().toISOString()
    });

    so.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        batch.update(doc(db, 'products', prod.id), { stock: (prod.stock || 0) - item.qty });
      }
    });
    await batch.commit();
    return newOrderRef.id;
  }, [salesOrders, products]);

  const updateSalesOrder = useCallback(async (id, updates) => {
    const orderRef = doc(db, 'salesOrders', id);
    await runTransaction(db, async transaction => {
      const orderSnapshot = await transaction.get(orderRef);
      if (!orderSnapshot.exists()) throw new Error('Sales Order tidak ditemukan.');
      const current = orderSnapshot.data();
      const updated = { ...current, ...updates };
      if (updates.status === 'Lunas' && current.holdReasonSOIds?.length) {
        const prerequisiteSnapshots = await Promise.all(current.holdReasonSOIds.map(orderId => transaction.get(doc(db, 'salesOrders', orderId))));
        const hasUnpaidPrerequisite = prerequisiteSnapshots.some(snapshot => {
          if (!snapshot.exists()) return false;
          const status = String(snapshot.data().status || '').trim().toLowerCase();
          return ['belum lunas', 'pending', 'onhold', 'on hold'].includes(status);
        });
        if (hasUnpaidPrerequisite) throw new Error('SO ini masih ditahan karena ada SO sebelumnya yang belum lunas. Lunasi SO pemicu hold terlebih dahulu.');
      }
      const isApproved = updated.approvalStatus === 'Disetujui';
      const shouldNotifyProduction = updated.status === 'Lunas' && isApproved && !current.productionNotifiedAt;
      const notificationRef = shouldNotifyProduction ? doc(collection(db, 'productionNotifications')) : null;
      transaction.update(orderRef, {
        ...updates,
        ...(shouldNotifyProduction ? { productionNotifiedAt: new Date().toISOString() } : {})
      });
      if (notificationRef) {
        transaction.set(notificationRef, {
          salesOrderId: id,
          soNumber: current.soNumber || id,
          customerId: current.customerId || '',
          items: current.items || [],
          status: 'Baru',
          createdAt: new Date().toISOString()
        });
      }
    });
  }, [salesOrders]);

  const reviewSalesOrder = useCallback(async (id, decision, reviewer, note = '') => {
    if (!['Disetujui', 'Ditolak'].includes(decision)) throw new Error('Keputusan approval tidak valid.');
    const orderRef = doc(db, 'salesOrders', id);
    await runTransaction(db, async transaction => {
      const snapshot = await transaction.get(orderRef);
      if (!snapshot.exists()) throw new Error('Sales Order tidak ditemukan.');
      const current = snapshot.data();
      if (current.approvalStatus && current.approvalStatus !== 'Menunggu Finance') {
        throw new Error('Sales Order ini sudah diproses oleh Finance.');
      }
      const now = new Date().toISOString();
      const patch = {
        approvalStatus: decision,
        approvalBy: reviewer || 'Finance',
        approvalAt: now,
        approvalNote: decision === 'Ditolak' ? note : ''
      };
      const notify = decision === 'Disetujui' && current.status === 'Lunas' && !current.productionNotifiedAt;
      if (notify) patch.productionNotifiedAt = now;
      transaction.update(orderRef, patch);
      if (notify) {
        const notificationRef = doc(collection(db, 'productionNotifications'));
        transaction.set(notificationRef, {
          salesOrderId: id,
          soNumber: current.soNumber || id,
          customerId: current.customerId || '',
          items: current.items || [],
          status: 'Baru',
          createdAt: now
        });
      }
    });
  }, []);

  const updateProductionNotification = useCallback(async (id, status) => {
    await updateDoc(doc(db, 'productionNotifications', id), { status });
  }, []);
  const deleteSalesOrder = useCallback(async (id) => {
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
  }, [salesOrders, products]);

  const importHistoricalSalesOrders = useCallback(async (historicalData) => {
    try {
      const batch = writeBatch(db);
      let currentCustomers = [...customers];
      
      for (const data of historicalData) {
        let customerId = '';
        
        const existingCustomer = currentCustomers.find(c => c.name.toLowerCase() === data.customerName.toLowerCase());
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          customerId = generateCustomId('CST', currentCustomers);
          const newCustomer = { id: customerId, name: data.customerName, type: 'Umum', phone: '', address: '', termin: 'Cash', statusPembayaran: 'Lancar' };
          currentCustomers.push(newCustomer);
          
          const custRef = doc(db, 'customers', customerId);
          batch.set(custRef, { 
            name: newCustomer.name, 
            type: newCustomer.type, 
            phone: newCustomer.phone, 
            address: newCustomer.address,
            termin: newCustomer.termin,
            statusPembayaran: newCustomer.statusPembayaran
          });
        }

        const newOrderRef = doc(collection(db, 'salesOrders'));
        const orderData = {
          soNumber: data.soNumber,
          date: data.date,
          customerId: customerId,
          items: data.items,
          status: data.status || 'Lunas',
          taxType: data.taxType || 'Non Pajak',
          taxRate: data.taxRate || 0,
          taxAmount: data.taxAmount || 0,
          subtotal: data.subtotal || 0,
          total: data.total || 0
        };
        batch.set(newOrderRef, orderData);
      }
      
      await batch.commit();
      return { success: true };
    } catch (e) {
      console.error("Import error:", e);
      return { success: false, error: e.message };
    }
  }, [customers]);

  const addPurchaseOrder = useCallback(async (po) => {
    const { id: _id, ...rest } = po;
    const newPoNumber = generateOrderNumber('PO', purchaseOrders, 'poNumber');
    await addDoc(collection(db, 'purchaseOrders'), { poNumber: newPoNumber, date: new Date().toISOString().split('T')[0], ...rest });
  }, [purchaseOrders]);
  const updatePurchaseOrder = useCallback(async (id, po) => {
    await updateDoc(doc(db, 'purchaseOrders', id), po);
  }, []);
  const deletePurchaseOrder = useCallback(async (id) => {
    await deleteDoc(doc(db, 'purchaseOrders', id));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    settings, updateSettings,
    vendors, addVendor, updateVendor, deleteVendor,
    customers, addCustomer, updateCustomer, deleteCustomer,
    inventory, addInventory, updateInventory, deleteInventory,
    products, addProduct, updateProduct, deleteProduct, produceProduct,
    categories, addCategory, updateCategory, deleteCategory,
    salesOrders, addSalesOrder, updateSalesOrder, reviewSalesOrder, deleteSalesOrder, importHistoricalSalesOrders,
    productionNotifications, updateProductionNotification,
    purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder
  }), [
    settings, updateSettings,
    vendors, addVendor, updateVendor, deleteVendor,
    customers, addCustomer, updateCustomer, deleteCustomer,
    inventory, addInventory, updateInventory, deleteInventory,
    products, addProduct, updateProduct, deleteProduct, produceProduct,
    categories, addCategory, updateCategory, deleteCategory,
    salesOrders, addSalesOrder, updateSalesOrder, reviewSalesOrder, deleteSalesOrder, importHistoricalSalesOrders,
    productionNotifications, updateProductionNotification,
    purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
