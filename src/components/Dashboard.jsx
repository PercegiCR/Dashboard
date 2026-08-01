import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Coffee, Users, Package, ShoppingCart, TrendingUp, TrendingDown, 
  BarChart2, FileText, Calendar, ArrowUpRight, ArrowDownRight,
  ClipboardList, Truck, Award, Star
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatRp = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const today = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── SVG Line Chart Component ────────────────────────────────────────────────
const LineChart = ({ data, colors, labels, width = 680, height = 220 }) => {
  const [hovered, setHovered] = useState(null);
  const paddingLeft = 72;
  const paddingRight = 20;
  const paddingTop = 16;
  const paddingBottom = 40;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const allValues = data.flatMap(series => series);
  const maxVal = Math.max(...allValues, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const toX = (i) => paddingLeft + (i / Math.max(data[0].length - 1, 1)) * chartW;
  const toY = (v) => paddingTop + chartH - ((v - minVal) / range) * chartH;

  const makePath = (series) =>
    series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');

  const makeArea = (series, color) => {
    if (series.length < 2) return null;
    const line = makePath(series);
    const closeBottom = ` L ${toX(series.length - 1).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} L ${paddingLeft.toFixed(1)} ${(paddingTop + chartH).toFixed(1)} Z`;
    return (
      <path
        d={line + closeBottom}
        fill={color}
        fillOpacity="0.08"
        stroke="none"
      />
    );
  };

  // Y axis ticks
  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxVal / yTicks) * i);

  // X axis labels (show first, middle, last for > 7 points, else all)
  const xLabels = labels.length <= 7
    ? labels.map((l, i) => ({ i, l }))
    : [
        { i: 0, l: labels[0] },
        { i: Math.floor(labels.length / 2), l: labels[Math.floor(labels.length / 2)] },
        { i: labels.length - 1, l: labels[labels.length - 1] }
      ];

  const seriesColors = colors;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      onMouseLeave={() => setHovered(null)}
    >
      {/* Grid lines */}
      {tickValues.map((v, i) => (
        <g key={i}>
          <line
            x1={paddingLeft}
            x2={width - paddingRight}
            y1={toY(v)}
            y2={toY(v)}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray={i === 0 ? '0' : '4,3'}
          />
          <text
            x={paddingLeft - 8}
            y={toY(v) + 4}
            textAnchor="end"
            fill="#9ca3af"
            fontSize="10"
          >
            {v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {xLabels.map(({ i, l }) => (
        <text
          key={i}
          x={toX(i)}
          y={height - 8}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="10"
        >
          {l}
        </text>
      ))}

      {/* Area fills */}
      {data.map((series, si) => makeArea(series, seriesColors[si]))}

      {/* Lines */}
      {data.map((series, si) => (
        <path
          key={si}
          d={makePath(series)}
          fill="none"
          stroke={seriesColors[si]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Hover interaction overlay */}
      {data[0].map((_, i) => (
        <g key={i}>
          <line
            x1={toX(i)}
            x2={toX(i)}
            y1={paddingTop}
            y2={paddingTop + chartH}
            stroke={hovered === i ? '#6b7280' : 'transparent'}
            strokeWidth="1"
            strokeDasharray="4,3"
          />
          <rect
            x={toX(i) - 12}
            y={paddingTop}
            width={24}
            height={chartH}
            fill="transparent"
            onMouseEnter={() => setHovered(i)}
          />
          {/* Dots */}
          {data.map((series, si) => (
            <circle
              key={si}
              cx={toX(i)}
              cy={toY(series[i])}
              r={hovered === i ? 5 : 3}
              fill={seriesColors[si]}
              stroke="white"
              strokeWidth="1.5"
              style={{ transition: 'r 0.1s' }}
            />
          ))}
          {/* Tooltip */}
          {hovered === i && (() => {
            const ttW = 160;
            const ttH = data.length * 18 + 28;
            let ttX = toX(i) + 12;
            if (ttX + ttW > width - paddingRight) ttX = toX(i) - ttW - 12;
            const ttY = paddingTop + 4;
            return (
              <g>
                <rect x={ttX} y={ttY} width={ttW} height={ttH} rx="6" fill="#1e293b" opacity="0.93" />
                <text x={ttX + 10} y={ttY + 16} fill="#e2e8f0" fontSize="10" fontWeight="600">
                  {labels[i]}
                </text>
                {data.map((series, si) => (
                  <text key={si} x={ttX + 10} y={ttY + 30 + si * 18} fill={seriesColors[si]} fontSize="10">
                    {['Pendapatan','Pengeluaran','Laba'][si]}: {formatRp(series[i])}
                  </text>
                ))}
              </g>
            );
          })()}
        </g>
      ))}
    </svg>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const Dashboard = ({ setActiveTab }) => {
  const { customers, products, salesOrders, purchaseOrders } = useAppContext();
  const [period, setPeriod] = useState(7); // 1, 7, 30

  // ── Build daily buckets for selected period ─────────────────────────────
  const { chartLabels, revenueData, expenseData, profitData, totalRevenue, totalExpense, totalProfit } = useMemo(() => {
    const end = today();
    const start = daysAgo(period);
    const numDays = period;

    // Build array of date strings for each day in range
    const days = Array.from({ length: numDays }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const rev = {};
    const exp = {};
    days.forEach(d => { rev[d] = 0; exp[d] = 0; });

    salesOrders.forEach(so => {
      const d = so.date;
      if (rev[d] !== undefined) rev[d] += (so.total || 0);
    });
    purchaseOrders.forEach(po => {
      const d = po.date;
      if (exp[d] !== undefined) exp[d] += (po.total || 0);
    });

    const revenueArr = days.map(d => rev[d]);
    const expenseArr = days.map(d => exp[d]);
    const profitArr = days.map(d => rev[d] - exp[d]);

    const totalRevenue = revenueArr.reduce((a, b) => a + b, 0);
    const totalExpense = expenseArr.reduce((a, b) => a + b, 0);
    const totalProfit = totalRevenue - totalExpense;

    // Labels: dd/MM for multi-day, hour for 1 day
    const labelsArr = days.map(d => {
      const [, m, dd] = d.split('-');
      return `${dd}/${m}`;
    });

    return {
      chartLabels: labelsArr,
      revenueData: revenueArr,
      expenseData: expenseArr,
      profitData: profitArr,
      totalRevenue,
      totalExpense,
      totalProfit
    };
  }, [salesOrders, purchaseOrders, period]);

  // ── Recent lists ──────────────────────────────────────────────────────────
  const recentSO = [...salesOrders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const recentPO = [...purchaseOrders]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // ── Rankings ──────────────────────────────────────────────────────────────
  const { topCustomers, topProducts } = useMemo(() => {
    const customerStats = {};
    const productStats = {};

    salesOrders.forEach(so => {
      // Customer
      if (!customerStats[so.customerId]) {
        const c = customers.find(c => c.id === so.customerId);
        customerStats[so.customerId] = { id: so.customerId, name: c ? c.name : 'Unknown', totalAmount: 0, totalQty: 0 };
      }
      customerStats[so.customerId].totalAmount += so.total;

      // Products
      so.items.forEach(item => {
        customerStats[so.customerId].totalQty += item.qty;

        const pKey = item.productId || item.name;
        if (!productStats[pKey]) {
          productStats[pKey] = { name: item.name, totalQty: 0, totalAmount: 0 };
        }
        productStats[pKey].totalQty += item.qty;
        productStats[pKey].totalAmount += item.subtotal;
      });
    });

    const topC = Object.values(customerStats).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);
    const topP = Object.values(productStats).sort((a, b) => b.totalQty - a.totalQty).slice(0, 5);

    return { topCustomers: topC, topProducts: topP };
  }, [salesOrders, customers]);

  // ── Stat cards ────────────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Customer', value: customers.length, icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-500', bg: 'bg-blue-50 text-blue-600', tab: 'customer'
    },
    {
      label: 'Menu Aktif', value: products.length, icon: <Coffee className="w-5 h-5" />,
      color: 'bg-amber-500', bg: 'bg-amber-50 text-amber-600', tab: 'product'
    },
    {
      label: 'Sales Order', value: salesOrders.length, icon: <ShoppingCart className="w-5 h-5" />,
      color: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-600', tab: 'so'
    },
    {
      label: 'Purchase Order', value: purchaseOrders.length, icon: <Package className="w-5 h-5" />,
      color: 'bg-rose-500', bg: 'bg-rose-50 text-rose-600', tab: 'po'
    },
  ];

  const periodLabel = period === 1 ? 'Hari Ini' : `${period} Hari Terakhir`;

  const { todayRevenue, todayOrdersCount } = useMemo(() => {
    const todaySOs = salesOrders.filter(so => {
        const d = new Date(so.date);
        const t = new Date();
        return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    });
    return {
      todayRevenue: todaySOs.reduce((sum, so) => sum + so.total, 0),
      todayOrdersCount: todaySOs.length
    };
  }, [salesOrders]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. Hero / Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-700 to-amber-950 p-8 sm:p-10 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 opacity-20 pointer-events-none">
          <Coffee size={250} className="transform rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-amber-50">Selamat Pagi, Percegi! ☕</h1>
          <p className="text-amber-200 text-lg mb-8">Ringkasan hari ini terlihat menjanjikan. Mari optimalkan penjualan Anda hari ini.</p>
          
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-[160px]">
              <p className="text-amber-100 text-sm font-medium">Pendapatan Hari Ini</p>
              <p className="text-2xl font-black text-white mt-1">{formatRp(todayRevenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 min-w-[160px]">
              <p className="text-amber-100 text-sm font-medium">Transaksi Hari Ini</p>
              <p className="text-2xl font-black text-white mt-1">{todayOrdersCount} Pesanan</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Performa Keuangan</h2>
              <p className="text-sm text-gray-500">{periodLabel}</p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {[ { v: 1, l: '1 Hari' }, { v: 7, l: '7 Hari' }, { v: 30, l: '30 Hari' } ].map(p => (
                <button
                  key={p.v} onClick={() => setPeriod(p.v)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    period === p.v ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {p.l}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6 mb-6">
            <div>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Pendapatan</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{formatRp(totalRevenue)}</p>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div>
              <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">Pengeluaran</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{formatRp(totalExpense)}</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
            <div className="hidden sm:block">
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${totalProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Laba Kotor</p>
              <p className={`text-2xl font-black ${totalProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatRp(totalProfit)}</p>
            </div>
          </div>

          <div className="h-64 w-full mt-auto">
            {revenueData.every(v => v === 0) && expenseData.every(v => v === 0) ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                <BarChart2 className="w-10 h-10 opacity-30" />
                <p className="text-sm">Belum ada data transaksi.</p>
              </div>
            ) : (
              <LineChart
                data={[revenueData, expenseData, profitData]}
                colors={['#10b981', '#f43f5e', '#6366f1']}
                labels={chartLabels}
                width={700} height={240}
              />
            )}
          </div>
        </div>

        {/* Stat Widgets Stack (Span 1) */}
        <div className="flex flex-col gap-4">
          <div 
            onClick={() => setActiveTab('customer')}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer flex-1 flex flex-col justify-center"
          >
            <Users size={100} className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">Total Customer</p>
              <p className="text-4xl font-black">{customers.length}</p>
            </div>
          </div>
          <div 
            onClick={() => setActiveTab('product')}
            className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer flex-1 flex flex-col justify-center"
          >
            <Coffee size={100} className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
            <div className="relative z-10">
              <p className="text-amber-100 text-sm font-bold uppercase tracking-wider mb-1">Menu Aktif</p>
              <p className="text-4xl font-black">{products.length}</p>
            </div>
          </div>
          <div className="flex gap-4 flex-1">
            <div 
              onClick={() => setActiveTab('so')}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer flex-1 flex flex-col justify-center hover:border-emerald-200 transition-colors"
            >
              <ShoppingCart size={60} className="absolute -right-4 -bottom-4 text-emerald-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Sales</p>
                <p className="text-2xl font-black text-gray-800">{salesOrders.length}</p>
              </div>
            </div>
            <div 
              onClick={() => setActiveTab('po')}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer flex-1 flex flex-col justify-center hover:border-rose-200 transition-colors"
            >
              <Package size={60} className="absolute -right-4 -bottom-4 text-rose-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Purchase</p>
                <p className="text-2xl font-black text-gray-800">{purchaseOrders.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Feed */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Aktivitas Terkini</h3>
          </div>
          <div className="relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
            <div className="flex flex-col gap-6">
              {[...salesOrders.map(s => ({...s, type: 'SO'})), ...purchaseOrders.map(p => ({...p, type: 'PO'}))]
                .sort((a,b) => new Date(b.date) - new Date(a.date))
                .slice(0, 6)
                .map((trx, idx) => (
                <div key={idx} className="flex gap-4 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm ${trx.type === 'SO' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {trx.type === 'SO' ? <ClipboardList size={14} /> : <Truck size={14} />}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-sm font-bold text-gray-900">{trx.type === 'SO' ? trx.soNumber : trx.poNumber}</p>
                    <p className="text-xs text-gray-500 mb-1">{formatDate(trx.date)} • {trx.status}</p>
                    <p className={`text-sm font-bold ${trx.type === 'SO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {trx.type === 'SO' ? '+' : '-'}{formatRp(trx.total)}
                    </p>
                  </div>
                </div>
              ))}
              {salesOrders.length === 0 && purchaseOrders.length === 0 && (
                 <div className="text-sm text-gray-400 pl-10">Belum ada aktivitas.</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Performers (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Top Customers (Medals style) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="text-amber-500" /> Pelanggan Paling Setia
            </h3>
            <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
              {topCustomers.length === 0 ? (
                <div className="text-sm text-gray-400">Belum ada data pelanggan.</div>
              ) : topCustomers.map((c, idx) => (
                <div key={c.id} className="min-w-[160px] flex-shrink-0 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center text-center relative hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-blue-400'}`}>
                    #{idx + 1}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-black mb-3 group-hover:scale-110 transition-transform">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-gray-900 text-sm truncate w-full">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.totalQty} items</p>
                  <div className="mt-3 bg-white w-full py-1.5 rounded-lg text-xs font-bold text-emerald-600 border border-gray-100 shadow-sm">
                    {formatRp(c.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Sellers (Progress Bars) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="text-amber-500" /> Menu Terlaris (Top 5)
            </h3>
            <div className="flex flex-col gap-5">
              {topProducts.length === 0 ? (
                <div className="text-sm text-gray-400">Belum ada data menu.</div>
              ) : topProducts.map((p, idx) => {
                const maxQty = topProducts[0].totalQty || 1;
                const percentage = Math.round((p.totalQty / maxQty) * 100);
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-gray-900">{p.name}</span>
                         {idx === 0 && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">BEST</span>}
                      </div>
                      <div className="text-xs font-bold text-gray-600">{p.totalQty} terjual</div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-orange-400' : 'bg-blue-400'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
