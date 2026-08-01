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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Utama</h1>
        <p className="text-gray-500 mt-1">Selamat datang di Percegi Coffee — ringkasan performa bisnis Anda.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div
            key={card.tab}
            onClick={() => setActiveTab(card.tab)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.bg} group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 leading-tight">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Chart header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Grafik Keuangan</h2>
              <p className="text-xs text-gray-500">{periodLabel}</p>
            </div>
          </div>
          {/* Period Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              { v: 1, l: '1 Hari' },
              { v: 7, l: '7 Hari' },
              { v: 30, l: '30 Hari' }
            ].map(p => (
              <button
                key={p.v}
                onClick={() => setPeriod(p.v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === p.v
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.l}
              </button>
            ))}
          </div>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-emerald-600 font-medium">Pendapatan</p>
              <p className="text-sm font-bold text-emerald-700">{formatRp(totalRevenue)}</p>
            </div>
          </div>
          <div className="bg-rose-50 rounded-xl p-3 flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-rose-600 font-medium">Pengeluaran</p>
              <p className="text-sm font-bold text-rose-700">{formatRp(totalExpense)}</p>
            </div>
          </div>
          <div className={`rounded-xl p-3 flex items-center gap-3 ${totalProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            {totalProfit >= 0
              ? <ArrowUpRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
              : <ArrowDownRight className="w-5 h-5 text-orange-600 flex-shrink-0" />
            }
            <div>
              <p className={`text-xs font-medium ${totalProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Laba Kotor
              </p>
              <p className={`text-sm font-bold ${totalProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {formatRp(totalProfit)}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 w-full">
          {revenueData.every(v => v === 0) && expenseData.every(v => v === 0) ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <BarChart2 className="w-10 h-10 opacity-30" />
              <p className="text-sm">Belum ada data transaksi pada periode ini.</p>
              <p className="text-xs">Buat Sales Order atau Purchase Order terlebih dahulu.</p>
            </div>
          ) : (
            <LineChart
              data={[revenueData, expenseData, profitData]}
              colors={['#10b981', '#f43f5e', '#6366f1']}
              labels={chartLabels}
              width={700}
              height={220}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-3 justify-center">
          {[
            { color: '#10b981', label: 'Pendapatan' },
            { color: '#f43f5e', label: 'Pengeluaran' },
            { color: '#6366f1', label: 'Laba Kotor' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: l.color }} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: SO + PO Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Order Terbaru (SO)</h3>
            </div>
            <button
              onClick={() => setActiveTab('so')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Lihat semua →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSO.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                Belum ada Sales Order.
              </div>
            ) : recentSO.map(so => (
              <div key={so.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono font-bold text-amber-600">{so.soNumber}</span>
                  <span className="text-xs text-gray-500">{formatDate(so.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{formatRp(so.total)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    so.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {so.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Purchase Order Terbaru</h3>
            </div>
            <button
              onClick={() => setActiveTab('po')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Lihat semua →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPO.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                Belum ada Purchase Order.
              </div>
            ) : recentPO.map(po => (
              <div key={po.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono font-bold text-amber-600">{po.poNumber}</span>
                  <span className="text-xs text-gray-500">{formatDate(po.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{formatRp(po.total)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    po.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {po.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Lists: Top Customers & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Top Customers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Customer Terbaik</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {topCustomers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                Belum ada data customer.
              </div>
            ) : topCustomers.map((c, idx) => (
              <div key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-400'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-900">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.totalQty} items dibeli</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-600">
                  {formatRp(c.totalAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Menu Terlaris</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                Belum ada data produk terjual.
              </div>
            ) : topProducts.map((p, idx) => (
              <div key={idx} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-400'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-900">{p.name}</span>
                    <span className="text-xs text-gray-500">{p.totalQty} terjual</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-indigo-600">
                  {formatRp(p.totalAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
