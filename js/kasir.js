/* ==========================================
   NONGSKOPI - Cashier Logic & Checkout Engine
   ========================================== */

let currentCategory = 'Semua';
let searchQuery = '';
let cart = [];
let selectedPaymentMethod = 'Cash';
let currentTransactionId = 'NS-00001';
let currentReceiptTrx = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  initLayout('kasir');

  // Load saved settings for default discount/tax
  const settings = getStoredData(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
  document.getElementById('cart-discount-input').value = settings.discount || 0;
  document.getElementById('cart-tax-input').value = settings.tax || 0;

  // Load active cart from localStorage
  cart = getStoredData(STORAGE_KEYS.CART) || [];

  // Setup Transaction ID
  updateTransactionId();

  // Attach event listeners
  setupEventListeners();

  // Initial render
  renderMenuGrid();
  renderCart();
});

function updateTransactionId() {
  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];
  let maxIdNum = 0;

  transactions.forEach(t => {
    if (t.id && t.id.startsWith('NS-')) {
      const num = parseInt(t.id.replace('NS-', ''), 10);
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    }
  });

  const nextNum = maxIdNum + 1;
  currentTransactionId = 'NS-' + String(nextNum).padStart(5, '0');
  document.getElementById('cart-trx-id-display').innerText = currentTransactionId;
}

function setupEventListeners() {
  // Search Menu Input
  const searchInput = document.getElementById('pos-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderMenuGrid();
    });
  }

  // Category Filter Pills
  const categoryContainer = document.getElementById('category-pills-container');
  if (categoryContainer) {
    categoryContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-pill')) {
        document.querySelectorAll('.category-pill').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.getAttribute('data-category');
        renderMenuGrid();
      }
    });
  }

  // Discount & Tax inputs
  document.getElementById('cart-discount-input').addEventListener('input', calculateTotals);
  document.getElementById('cart-tax-input').addEventListener('input', calculateTotals);

  // Payment Amount input
  document.getElementById('cart-pay-amount-input').addEventListener('input', calculateTotals);

  // Payment Method Selector
  document.querySelectorAll('.payment-method-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      selectedPaymentMethod = e.target.getAttribute('data-method');
    });
  });

  // Process Checkout Button
  document.getElementById('btn-process-checkout').addEventListener('click', processCheckout);
}

// Render Menu Cards
function renderMenuGrid() {
  const gridEl = document.getElementById('pos-menu-grid');
  if (!gridEl) return;

  const menuList = getStoredData(STORAGE_KEYS.MENU) || DEFAULT_MENU;

  const filtered = menuList.filter(item => {
    const matchesCategory = currentCategory === 'Semua' || item.category === currentCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery) || item.category.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 32px;">☕</p>
        <p>Menu tidak ditemukan.</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = filtered.map(item => {
    const isOutOfStock = item.status === 'Habis' || item.stock <= 0;
    return `
      <div class="menu-card ${isOutOfStock ? 'out-of-stock' : ''}">
        <div class="menu-card-header">
          <div class="menu-card-icon">${item.icon || '☕'}</div>
          <div class="menu-card-info">
            <h4>${item.name}</h4>
            <p class="category-name">${item.category}</p>
          </div>
        </div>
        <p class="menu-card-desc">${item.description || 'Nongskopi Special'}</p>
        <div class="menu-card-footer">
          <div>
            <div class="menu-card-price">${formatRupiah(item.price)}</div>
            <div class="menu-card-stock">Stok: ${item.stock}</div>
          </div>
          <button class="btn-add-cart" onclick="addToCart('${item.id}')" ${isOutOfStock ? 'disabled' : ''}>
            ${isOutOfStock ? 'Habis' : '+ Tambah'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Cart Management Logic
function addToCart(itemId) {
  const menuList = getStoredData(STORAGE_KEYS.MENU) || DEFAULT_MENU;
  const item = menuList.find(m => m.id === itemId);

  if (!item || item.status === 'Habis' || item.stock <= 0) {
    showToast('Menu tidak tersedia atau stok habis', 'error');
    return;
  }

  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    if (existing.qty + 1 > item.stock) {
      showToast(`Stok ${item.name} hanya tersisa ${item.stock}`, 'error');
      return;
    }
    existing.qty += 1;
    existing.subtotal = existing.qty * existing.price;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      subtotal: item.price
    });
  }

  saveCart();
  renderCart();
  showToast(`${item.name} ditambahkan ke keranjang`, 'success');
}

function updateCartQty(itemId, delta) {
  const menuList = getStoredData(STORAGE_KEYS.MENU) || DEFAULT_MENU;
  const menuObj = menuList.find(m => m.id === itemId);
  const cartItem = cart.find(c => c.id === itemId);

  if (!cartItem) return;

  const newQty = cartItem.qty + delta;
  if (newQty <= 0) {
    cart = cart.filter(c => c.id !== itemId);
  } else {
    if (menuObj && newQty > menuObj.stock) {
      showToast(`Stok ${menuObj.name} hanya tersisa ${menuObj.stock}`, 'error');
      return;
    }
    cartItem.qty = newQty;
    cartItem.subtotal = cartItem.qty * cartItem.price;
  }

  saveCart();
  renderCart();
}

function removeFromCart(itemId) {
  cart = cart.filter(c => c.id !== itemId);
  saveCart();
  renderCart();
  showToast('Item dihapus dari keranjang', 'info');
}

function saveCart() {
  setStoredData(STORAGE_KEYS.CART, cart);
}

function renderCart() {
  const cartListEl = document.getElementById('cart-items-list');
  if (!cartListEl) return;

  if (cart.length === 0) {
    cartListEl.innerHTML = `
      <div class="empty-cart-state">
        <i>☕</i>
        <p>Keranjang masih kosong.<br>Pilih menu di sebelah kiri.</p>
      </div>
    `;
  } else {
    cartListEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <p>${formatRupiah(item.price)}</p>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
        <div class="cart-item-total">${formatRupiah(item.subtotal)}</div>
        <button class="btn-remove-item" onclick="removeFromCart('${item.id}')" title="Hapus">🗑️</button>
      </div>
    `).join('');
  }

  calculateTotals();
}

// Financial Math Calculations
function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const discountPercent = parseFloat(document.getElementById('cart-discount-input').value) || 0;
  const taxPercent = parseFloat(document.getElementById('cart-tax-input').value) || 0;

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(subtotalAfterDiscount * (taxPercent / 100));
  const total = subtotalAfterDiscount + taxAmount;

  document.getElementById('cart-subtotal').innerText = formatRupiah(subtotal);
  document.getElementById('cart-total').innerText = formatRupiah(total);

  const payAmountInput = parseFloat(document.getElementById('cart-pay-amount-input').value) || 0;
  const changeDisplay = document.getElementById('cart-change-display');

  if (cart.length === 0) {
    changeDisplay.className = 'change-display danger';
    changeDisplay.innerText = 'Keranjang kosong';
    return;
  }

  const change = payAmountInput - total;

  if (change < 0) {
    changeDisplay.className = 'change-display danger';
    changeDisplay.innerText = 'Pembayaran belum mencukupi';
  } else {
    changeDisplay.className = 'change-display success';
    changeDisplay.innerText = `Kembalian: ${formatRupiah(change)}`;
  }
}

// Process Checkout & Payment
function processCheckout() {
  if (cart.length === 0) {
    showToast('Keranjang pesanan tidak boleh kosong!', 'error');
    return;
  }

  const customerNameInput = document.getElementById('customer-name-input');
  const customerName = customerNameInput.value.trim();
  if (!customerName) {
    showToast('Silakan masukkan nama pelanggan terlebih dahulu!', 'error');
    customerNameInput.focus();
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountPercent = parseFloat(document.getElementById('cart-discount-input').value) || 0;
  const taxPercent = parseFloat(document.getElementById('cart-tax-input').value) || 0;

  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(subtotalAfterDiscount * (taxPercent / 100));
  const total = subtotalAfterDiscount + taxAmount;

  const payAmount = parseFloat(document.getElementById('cart-pay-amount-input').value) || 0;

  if (payAmount < total) {
    showToast('Jumlah pembayaran kurang!', 'error');
    return;
  }

  const changeAmount = payAmount - total;
  const settings = getStoredData(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;

  // Build Transaction Record
  const newTransaction = {
    id: currentTransactionId,
    date: new Date().toISOString(),
    customerName: customerName,
    items: [...cart],
    subtotal: subtotal,
    discountPercent: discountPercent,
    discountAmount: discountAmount,
    taxPercent: taxPercent,
    taxAmount: taxAmount,
    total: total,
    payAmount: payAmount,
    changeAmount: changeAmount,
    paymentMethod: selectedPaymentMethod,
    status: 'Selesai',
    cashier: settings.cashierName || 'Admin'
  };

  // Deduct Stock from menu
  const menuList = getStoredData(STORAGE_KEYS.MENU) || DEFAULT_MENU;
  cart.forEach(cartItem => {
    const targetItem = menuList.find(m => m.id === cartItem.id);
    if (targetItem) {
      targetItem.stock = Math.max(0, targetItem.stock - cartItem.qty);
      if (targetItem.stock === 0) {
        targetItem.status = 'Habis';
      }
    }
  });
  setStoredData(STORAGE_KEYS.MENU, menuList);

  // Save Transaction
  const transactions = getStoredData(STORAGE_KEYS.TRANSACTIONS) || [];
  transactions.push(newTransaction);
  setStoredData(STORAGE_KEYS.TRANSACTIONS, transactions);

  // Keep reference for receipt
  currentReceiptTrx = newTransaction;

  // Show Toast
  showToast('Pembayaran berhasil!', 'success');

  // Display Receipt Modal
  renderReceiptModal(newTransaction);

  // Clear Cart & Form inputs
  cart = [];
  saveCart();
  customerNameInput.value = '';
  document.getElementById('cart-pay-amount-input').value = '';

  // Update Grid & ID
  renderMenuGrid();
  renderCart();
  updateTransactionId();
}

// Receipt Modal Controls
function renderReceiptModal(trx) {
  const settings = getStoredData(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
  const paper = document.getElementById('receipt-paper-content');

  const itemsHtml = trx.items.map(item => `
    <div class="receipt-item-row">
      <span>${item.name} × ${item.qty}</span>
      <span>${formatRupiah(item.subtotal)}</span>
    </div>
  `).join('');

  paper.innerHTML = `
    <div class="receipt-header">
      <h2>${settings.storeName || 'NONGSKOPI'}</h2>
      <p style="font-weight: bold; margin-top: 2px;">${settings.tagline || 'BREAK WITH YOUR COFFE'}</p>
      <p style="margin-top: 4px;">${settings.address || 'Jl. Kopi No. 88'}</p>
      <p>Telp: ${settings.phone || '-'}</p>
    </div>

    <div class="receipt-info">
      <div><span>No. Transaksi:</span> <span>${trx.id}</span></div>
      <div><span>Tanggal:</span> <span>${formatDate(trx.date)}</span></div>
      <div><span>Kasir:</span> <span>${trx.cashier || 'Admin'}</span></div>
      <div><span>Pelanggan:</span> <span>${trx.customerName}</span></div>
    </div>

    <div class="receipt-items">
      ${itemsHtml}
    </div>

    <div class="receipt-totals">
      <div><span>Subtotal:</span> <span>${formatRupiah(trx.subtotal)}</span></div>
      ${trx.discountAmount > 0 ? `<div><span>Diskon (${trx.discountPercent}%):</span> <span>-${formatRupiah(trx.discountAmount)}</span></div>` : ''}
      ${trx.taxAmount > 0 ? `<div><span>Pajak (${trx.taxPercent}%):</span> <span>+${formatRupiah(trx.taxAmount)}</span></div>` : ''}
      <div class="grand-total"><span>TOTAL:</span> <span>${formatRupiah(trx.total)}</span></div>
      <div style="margin-top: 6px;"><span>Bayar (${trx.paymentMethod}):</span> <span>${formatRupiah(trx.payAmount)}</span></div>
      <div><span>Kembalian:</span> <span>${formatRupiah(trx.changeAmount)}</span></div>
    </div>

    <div class="receipt-footer">
      <p style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">Terima kasih telah berkunjung!</p>
      <p>${settings.storeName || 'NONGSKOPI'}</p>
    </div>
  `;

  const modal = document.getElementById('receipt-modal');
  modal.classList.add('show');
}

function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  modal.classList.remove('show');
}

function printReceipt() {
  window.print();
}
