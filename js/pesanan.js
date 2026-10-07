/* ==========================================
   NONGSKOPI - Transaction History Logic
   ========================================== */

let searchTrxQuery = '';
let filterTrxDate = '';
let filterTrxStatus = 'Semua';
let activeDetailTrx = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  initLayout('pesanan');

  setupTrxEventListeners();
  renderTrxTable();
});

function setupTrxEventListeners() {
  const searchInput = document.getElementById('trx-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTrxQuery = e.target.value.toLowerCase().trim();
      renderTrxTable();
    });
  }

  const dateInput = document.getElementById('trx-date-filter');
  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      filterTrxDate = e.target.value;
      renderTrxTable();
    });
  }

  const statusSelect = document.getElementById('trx-status-filter');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      filterTrxStatus = e.target.value;
      renderTrxTable();
    });
  }

  const reprintBtn = document.getElementById('btn-reprint-receipt');
  if (reprintBtn) {
    reprintBtn.addEventListener('click', () => {
      if (activeDetailTrx) {
        openReceiptWindow(activeDetailTrx);
      }
    });
  }
}

function resetTrxFilters() {
  searchTrxQuery = '';
  filterTrxDate = '';
  filterTrxStatus = 'Semua';

  document.getElementById('trx-search-input').value = '';
  document.getElementById('trx-date-filter').value = '';
  document.getElementById('trx-status-filter').value = 'Semua';

  renderTrxTable();
}

function renderTrxTable() {
  const tbody = document.getElementById('trx-table-tbody');
  if (!tbody) return;

  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];

  const filtered = transactions.filter(trx => {
    const matchesSearch = trx.id.toLowerCase().includes(searchTrxQuery) || 
                          (trx.customerName && trx.customerName.toLowerCase().includes(searchTrxQuery));

    let matchesDate = true;
    if (filterTrxDate) {
      const trxDateStr = new Date(trx.date).toISOString().split('T')[0];
      matchesDate = trxDateStr === filterTrxDate;
    }

    const matchesStatus = filterTrxStatus === 'Semua' || trx.status === filterTrxStatus;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">
          Tidak ada riwayat transaksi yang cocok.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(trx => {
    const itemSummary = trx.items ? trx.items.map(i => `${i.name} (${i.qty})`).join(', ') : '-';
    
    let badgeClass = 'badge-success';
    if (trx.status === 'Diproses') badgeClass = 'badge-warning';
    if (trx.status === 'Dibatalkan') badgeClass = 'badge-danger';

    return `
      <tr>
        <td><strong>${trx.id}</strong></td>
        <td>${formatDate(trx.date)}</td>
        <td>${trx.customerName || 'Pelanggan'}</td>
        <td style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${itemSummary}</td>
        <td style="text-align: right; font-weight: 700; color: var(--coffee-brown);">${formatRupiah(trx.total)}</td>
        <td><span class="badge badge-secondary">${trx.paymentMethod || 'Cash'}</span></td>
        <td><span class="badge ${badgeClass}">${trx.status || 'Selesai'}</span></td>
        <td style="text-align: center;">
          <button class="btn btn-outline btn-sm" onclick="showTrxDetail('${trx.id}')">Detail</button>
        </td>
      </tr>
    `;
  }).join('');
}

function showTrxDetail(trxId) {
  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];
  const trx = transactions.find(t => t.id === trxId);
  if (!trx) return;

  activeDetailTrx = trx;
  const modalBody = document.getElementById('trx-detail-modal-body');

  const itemsHtml = trx.items ? trx.items.map(item => `
    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed var(--border-color); font-size: 13px;">
      <div>
        <strong>${item.name}</strong> × ${item.qty}
        <div style="font-size: 11px; color: var(--text-muted);">${formatRupiah(item.price)} per item</div>
      </div>
      <div style="font-weight: 600;">${formatRupiah(item.subtotal)}</div>
    </div>
  `).join('') : '';

  modalBody.innerHTML = `
    <div style="margin-bottom: 16px; background-color: var(--cream); padding: 14px; border-radius: var(--radius-md); font-size: 13px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div><strong>No. Transaksi:</strong> ${trx.id}</div>
        <div><strong>Tanggal:</strong> ${formatDate(trx.date)}</div>
        <div><strong>Pelanggan:</strong> ${trx.customerName}</div>
        <div><strong>Kasir:</strong> ${trx.cashier || 'Admin'}</div>
        <div><strong>Metode:</strong> ${trx.paymentMethod}</div>
        <div><strong>Status:</strong> ${trx.status}</div>
      </div>
    </div>

    <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 10px; color: var(--dark-brown);">Item Pesanan</h4>
    <div style="margin-bottom: 16px;">
      ${itemsHtml}
    </div>

    <div style="background-color: var(--cream-light); padding: 14px; border-radius: var(--radius-md); font-size: 13px; display: flex; flex-direction: column; gap: 4px;">
      <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span> <span>${formatRupiah(trx.subtotal)}</span></div>
      ${trx.discountAmount > 0 ? `<div style="display: flex; justify-content: space-between; color: var(--danger);"><span>Diskon (${trx.discountPercent}%):</span> <span>-${formatRupiah(trx.discountAmount)}</span></div>` : ''}
      ${trx.taxAmount > 0 ? `<div style="display: flex; justify-content: space-between;"><span>Pajak (${trx.taxPercent}%):</span> <span>+${formatRupiah(trx.taxAmount)}</span></div>` : ''}
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 15px; color: var(--dark-brown); margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border-color);">
        <span>TOTAL:</span> <span>${formatRupiah(trx.total)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 4px;"><span>Jumlah Bayar:</span> <span>${formatRupiah(trx.payAmount)}</span></div>
      <div style="display: flex; justify-content: space-between; color: var(--success); font-weight: 600;"><span>Kembalian:</span> <span>${formatRupiah(trx.changeAmount)}</span></div>
    </div>
  `;

  const modal = document.getElementById('trx-detail-modal');
  modal.classList.add('show');
}

function closeTrxDetailModal() {
  const modal = document.getElementById('trx-detail-modal');
  modal.classList.remove('show');
}

function openReceiptWindow(trx) {
  const settings = getStoredData(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
  const itemsHtml = trx.items.map(i => `<div>${i.name} x ${i.qty} = ${formatRupiah(i.subtotal)}</div>`).join('');
  
  const receiptWin = window.open('', '_blank', 'width=400,height=600');
  receiptWin.document.write(`
    <html>
    <head>
      <title>Struk ${trx.id}</title>
      <style>
        body { font-family: monospace; padding: 20px; text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; text-align: left; }
      </style>
    </head>
    <body>
      <h2>${settings.storeName || 'NONGSKOPI'}</h2>
      <p>${settings.tagline || 'BREAK WITH YOUR COFFE'}</p>
      <p>${settings.address || ''}</p>
      <div class="divider"></div>
      <div class="row"><span>ID: ${trx.id}</span> <span>${formatDate(trx.date)}</span></div>
      <div class="row"><span>Pelanggan:</span> <span>${trx.customerName}</span></div>
      <div class="divider"></div>
      ${itemsHtml}
      <div class="divider"></div>
      <div class="row"><strong>TOTAL:</strong> <strong>${formatRupiah(trx.total)}</strong></div>
      <div class="row"><span>Bayar:</span> <span>${formatRupiah(trx.payAmount)}</span></div>
      <div class="row"><span>Kembali:</span> <span>${formatRupiah(trx.changeAmount)}</span></div>
      <div class="divider"></div>
      <p>Terima Kasih!</p>
      <script>window.print();</script>
    </body>
    </html>
  `);
  receiptWin.document.close();
}
