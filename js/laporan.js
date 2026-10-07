/* ==========================================
   NONGSKOPI - Reports & Canvas Chart Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  initLayout('laporan');

  renderReportMetrics();
  renderTopSellingProducts();
  drawSalesCanvasChart();

  const exportBtn = document.getElementById('btn-export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportReportCSV);
  }
});

function renderReportMetrics() {
  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Start of week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay() || 7; // Get 1-7 (Mon-Sun)
  if (day !== 1) startOfWeek.setHours(-24 * (day - 1), 0, 0, 0);
  else startOfWeek.setHours(0, 0, 0, 0);

  // Start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let salesToday = 0;
  let salesWeek = 0;
  let salesMonth = 0;
  let validTrxCount = 0;

  transactions.forEach(trx => {
    if (trx.status !== 'Dibatalkan') {
      validTrxCount += 1;
      const tDate = new Date(trx.date);
      const totalAmount = Number(trx.total) || 0;

      // Today
      if (trx.date.split('T')[0] === todayStr) {
        salesToday += totalAmount;
      }

      // Week
      if (tDate >= startOfWeek) {
        salesWeek += totalAmount;
      }

      // Month
      if (tDate >= startOfMonth) {
        salesMonth += totalAmount;
      }
    }
  });

  document.getElementById('report-sales-today').innerText = formatRupiah(salesToday);
  document.getElementById('report-sales-week').innerText = formatRupiah(salesWeek);
  document.getElementById('report-sales-month').innerText = formatRupiah(salesMonth);
  document.getElementById('report-total-trx').innerText = `${validTrxCount} Transaksi`;
}

function renderTopSellingProducts() {
  const container = document.getElementById('top-selling-list');
  if (!container) return;

  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];
  const menuSalesMap = {};

  transactions.forEach(trx => {
    if (trx.status !== 'Dibatalkan' && Array.isArray(trx.items)) {
      trx.items.forEach(item => {
        if (!menuSalesMap[item.name]) {
          menuSalesMap[item.name] = { qty: 0, revenue: 0 };
        }
        menuSalesMap[item.name].qty += Number(item.qty) || 0;
        menuSalesMap[item.name].revenue += Number(item.subtotal) || 0;
      });
    }
  });

  const sortedMap = Object.keys(menuSalesMap).map(name => ({
    name: name,
    qty: menuSalesMap[name].qty,
    revenue: menuSalesMap[name].revenue
  })).sort((a, b) => b.qty - a.qty);

  if (sortedMap.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 20px;">
        Belum ada data penjualan item.
      </div>
    `;
    return;
  }

  container.innerHTML = sortedMap.slice(0, 5).map((item, index) => {
    const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background-color: var(--cream); border-radius: var(--radius-md);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 16px; font-weight: bold; width: 24px;">${medals[index]}</span>
          <div>
            <div style="font-size: 13px; font-weight: 600; color: var(--dark-brown);">${item.name}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">${item.qty} item terjual</div>
          </div>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: var(--coffee-brown);">
          ${formatRupiah(item.revenue)}
        </div>
      </div>
    `;
  }).join('');
}

// Draw Pure HTML5 Canvas Chart for 7 Days Sales Trend
function drawSalesCanvasChart() {
  const canvas = document.getElementById('sales-canvas-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Generate last 7 days dates array
  const last7Days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7Days.push({
      dateStr: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
      totalSales: 0
    });
  }

  // Aggregate sales per day
  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];
  transactions.forEach(trx => {
    if (trx.status !== 'Dibatalkan') {
      const dayStr = trx.date.split('T')[0];
      const match = last7Days.find(d => d.dateStr === dayStr);
      if (match) {
        match.totalSales += Number(trx.total) || 0;
      }
    }
  });

  const padding = { top: 40, right: 30, bottom: 40, left: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Find max value for Y-axis scaling
  const maxVal = Math.max(...last7Days.map(d => d.totalSales), 50000);

  // Draw background grid lines & Y-axis labels
  ctx.strokeStyle = '#e8ded5';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#6e5e54';
  ctx.font = '11px Poppins, sans-serif';
  ctx.textAlign = 'right';

  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const yVal = (maxVal / gridSteps) * i;
    const yPos = height - padding.bottom - (chartH / gridSteps) * i;

    // Draw horizontal grid line
    ctx.beginPath();
    ctx.moveTo(padding.left, yPos);
    ctx.lineTo(width - padding.right, yPos);
    ctx.stroke();

    // Draw Y label
    const formattedY = yVal >= 1000 ? (yVal / 1000) + 'k' : yVal;
    ctx.fillText('Rp' + formattedY, padding.left - 10, yPos + 4);
  }

  // Draw Bars & X-axis Labels
  const barWidth = chartW / last7Days.length - 20;

  last7Days.forEach((dayData, index) => {
    const xPos = padding.left + index * (chartW / last7Days.length) + 10;
    const barH = (dayData.totalSales / maxVal) * chartH;
    const yPos = height - padding.bottom - barH;

    // Bar Gradient
    const gradient = ctx.createLinearGradient(0, yPos, 0, height - padding.bottom);
    gradient.addColorStop(0, '#6f4e37');
    gradient.addColorStop(1, '#c58b5a');

    // Draw Bar
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(xPos, yPos, barWidth, barH, [6, 6, 0, 0]);
    ctx.fill();

    // Draw Value label above bar if > 0
    if (dayData.totalSales > 0) {
      ctx.fillStyle = '#2b1d16';
      ctx.textAlign = 'center';
      ctx.font = 'bold 10px Poppins, sans-serif';
      const valStr = dayData.totalSales >= 1000 ? (dayData.totalSales / 1000) + 'k' : dayData.totalSales;
      ctx.fillText(valStr, xPos + barWidth / 2, yPos - 6);
    }

    // Draw X-axis Label
    ctx.fillStyle = '#6e5e54';
    ctx.textAlign = 'center';
    ctx.font = '11px Poppins, sans-serif';
    ctx.fillText(dayData.label, xPos + barWidth / 2, height - padding.bottom + 20);
  });
}

// CSV Export Logic
function exportReportCSV() {
  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];
  if (transactions.length === 0) {
    showToast('Tidak ada data transaksi untuk diexport', 'error');
    return;
  }

  // CSV Headers
  let csvContent = 'ID Transaksi,Tanggal & Waktu,Pelanggan,Metode Pembayaran,Subtotal,Diskon (Rp),Pajak (Rp),Total (Rp),Kasir,Status\n';

  transactions.forEach(t => {
    const row = [
      `"${t.id}"`,
      `"${formatDate(t.date)}"`,
      `"${t.customerName || 'Pelanggan'}"`,
      `"${t.paymentMethod || 'Cash'}"`,
      t.subtotal || 0,
      t.discountAmount || 0,
      t.taxAmount || 0,
      t.total || 0,
      `"${t.cashier || 'Admin'}"`,
      `"${t.status || 'Selesai'}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  // Create UTF-8 Blob with BOM for Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Penjualan_Nongskopi_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Laporan CSV berhasil diunduh!', 'success');
}
