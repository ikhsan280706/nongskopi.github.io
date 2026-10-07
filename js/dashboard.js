/* ==========================================
   NONGSKOPI - Dashboard Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce authentication
  checkAuth(false);
  initLayout('dashboard');

  // Load metrics & recent orders
  loadDashboardMetrics();
});

function loadDashboardMetrics() {
  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];
  const settings = getStoredData(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;

  // Set cashier welcome greeting
  const greetingEl = document.getElementById('welcome-greeting');
  if (greetingEl) {
    greetingEl.innerText = `Selamat datang, ${settings.cashierName || 'Admin'} `;
  }

  // Get Today's date filter (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  let salesToday = 0;
  let ordersCountToday = 0;
  let itemsSoldToday = 0;

  transactions.forEach(trx => {
    // Check if status is not cancelled
    if (trx.status !== 'Dibatalkan') {
      const trxDateStr = new Date(trx.date).toISOString().split('T')[0];
      if (trxDateStr === todayStr) {
        salesToday += Number(trx.total) || 0;
        ordersCountToday += 1;
        
        if (Array.isArray(trx.items)) {
          trx.items.forEach(item => {
            itemsSoldToday += Number(item.qty) || 0;
          });
        }
      }
    }
  });

  // Update DOM metric values
  document.getElementById('stat-sales-today').innerText = formatRupiah(salesToday);
  document.getElementById('stat-orders-today').innerText = `${ordersCountToday} Pesanan`;
  document.getElementById('stat-items-sold-today').innerText = `${itemsSoldToday} Item`;
  document.getElementById('stat-revenue-today').innerText = formatRupiah(salesToday);

  // Populate Recent Orders Table (latest 5)
  const tbody = document.getElementById('recent-orders-tbody');
  if (!tbody) return;

  // Sort descending by date
  const sortedTrx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (sortedTrx.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
          Belum ada transaksi recorded hari ini.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = sortedTrx.map(trx => {
    // Generate menu summary
    const menuSummary = trx.items ? trx.items.map(i => `${i.name} (×${i.qty})`).join(', ') : '-';
    
    let badgeClass = 'badge-success';
    if (trx.status === 'Diproses') badgeClass = 'badge-warning';
    if (trx.status === 'Menunggu') badgeClass = 'badge-info';
    if (trx.status === 'Dibatalkan') badgeClass = 'badge-danger';

    return `
      <tr>
        <td><strong>${trx.id}</strong></td>
        <td>${trx.customerName || 'Pelanggan'}</td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${menuSummary}</td>
        <td><strong>${formatRupiah(trx.total)}</strong></td>
        <td><span class="badge ${badgeClass}">${trx.status || 'Selesai'}</span></td>
        <td>${formatDate(trx.date)}</td>
      </tr>
    `;
  }).join('');
}
