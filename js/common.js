/* ==========================================
   NONGSKOPI POS - Common Helper Engine
   Data Seeders, Auth Guard, Storage API, Formatters
   ========================================== */

const STORAGE_KEYS = {
  LOGIN: "nongskopi_login",
  MENU: "nongskopi_menu",
  CART: "nongskopi_cart",
  TRANSACTIONS: "nongskopi_transactions",
  SETTINGS: "nongskopi_settings",
};

// Default Official Menu Data
const DEFAULT_MENU = [
  // Espresso-Based
  {
    id: "M-001",
    name: "Aren Latte",
    category: "Espresso-Based",
    price: 13000,
    stock: 50,
    status: "Tersedia",
    description: "Espresso + Fresh Milk + Gula Aren Premium",
    icon: "☕",
  },
  {
    id: "M-002",
    name: "Spanish Latte",
    category: "Espresso-Based",
    price: 13000,
    stock: 45,
    status: "Tersedia",
    description: "Espresso + Condensed Milk + Fresh Milk",
    icon: "☕",
  },
  {
    id: "M-003",
    name: "Nongs Kopi",
    category: "Espresso-Based",
    price: 15000,
    stock: 60,
    status: "Tersedia",
    description: "Signature Creamy Coffee Special Nongskopi",
    icon: "🌟",
  },
  {
    id: "M-004",
    name: "Butterscotch Latte",
    category: "Espresso-Based",
    price: 15000,
    stock: 40,
    status: "Tersedia",
    description: "Espresso + Creamy Butterscotch Syrup",
    icon: "🍯",
  },
  {
    id: "M-005",
    name: "Pandan Latte",
    category: "Espresso-Based",
    price: 15000,
    stock: 35,
    status: "Tersedia",
    description: "Espresso + Aroma Pandan Alami",
    icon: "🌿",
  },
  {
    id: "M-006",
    name: "Americano",
    category: "Espresso-Based",
    price: 13000,
    stock: 50,
    status: "Tersedia",
    description: "Double Shot Espresso + Air Mineral",
    icon: "☕",
  },

  // Manual Brew
  {
    id: "M-007",
    name: "V60",
    category: "Manual Brew",
    price: 20000,
    stock: 30,
    status: "Tersedia",
    description: "Single Origin Filtered Hand Drip Coffee",
    icon: "🫖",
  },
  {
    id: "M-008",
    name: "Cold Brew",
    category: "Manual Brew",
    price: 20000,
    stock: 25,
    status: "Tersedia",
    description: "12-Hour Cold Brewed Coffee Smooth & Refreshing",
    icon: "🧊",
  },

  // Americano Series
  {
    id: "M-009",
    name: "Americano Lemonade",
    category: "Americano Series",
    price: 17000,
    stock: 30,
    status: "Tersedia",
    description: "Espresso + Fresh Lemon Juice + Soda",
    icon: "🍋",
  },
  {
    id: "M-010",
    name: "Americano Strawberry",
    category: "Americano Series",
    price: 17000,
    stock: 30,
    status: "Tersedia",
    description: "Espresso + Sweet Strawberry Infusion",
    icon: "🍓",
  },
  {
    id: "M-011",
    name: "Americano Berry",
    category: "Americano Series",
    price: 17000,
    stock: 30,
    status: "Tersedia",
    description: "Espresso + Mixed Berry Blend",
    icon: "🫐",
  },

  // Non Coffee
  {
    id: "M-012",
    name: "Matcha Latte",
    category: "Non Coffee",
    price: 15000,
    stock: 40,
    status: "Tersedia",
    description: "Pure Japanese Uji Matcha + Steamed Milk",
    icon: "🍵",
  },
  {
    id: "M-013",
    name: "Chocolate",
    category: "Non Coffee",
    price: 15000,
    stock: 40,
    status: "Tersedia",
    description: "Rich Dark Chocolate + Fresh Milk",
    icon: "🍫",
  },
  {
    id: "M-014",
    name: "Lemon Tea",
    category: "Non Coffee",
    price: 13000,
    stock: 50,
    status: "Tersedia",
    description: "Brewed Tea with Fresh Squeezed Lemon",
    icon: "🍹",
  },
  {
    id: "M-015",
    name: "Butterscotch Milk",
    category: "Non Coffee",
    price: 18000,
    stock: 35,
    status: "Tersedia",
    description: "Creamy Milk with Caramelized Butterscotch",
    icon: "🥛",
  },
  {
    id: "M-016",
    name: "Choco Banana Milk",
    category: "Non Coffee",
    price: 18000,
    stock: 35,
    status: "Tersedia",
    description: "Artisanal Chocolate with Banana Flavor",
    icon: "🍌",
  },

  // Add On
  {
    id: "M-017",
    name: "Espresso",
    category: "Add On",
    price: 3000,
    stock: 100,
    status: "Tersedia",
    description: "Extra Single Shot Espresso",
    icon: "⚡",
  },
  {
    id: "M-018",
    name: "Butterscotch",
    category: "Add On",
    price: 3000,
    stock: 100,
    status: "Tersedia",
    description: "Extra Shot Syrup Butterscotch",
    icon: "💧",
  },
  {
    id: "M-019",
    name: "Aren",
    category: "Add On",
    price: 3000,
    stock: 100,
    status: "Tersedia",
    description: "Extra Sirup Gula Aren",
    icon: "💧",
  },
  {
    id: "M-020",
    name: "Pandan",
    category: "Add On",
    price: 3000,
    stock: 100,
    status: "Tersedia",
    description: "Extra Sirup Pandan",
    icon: "💧",
  },
];

// Default Settings
const DEFAULT_SETTINGS = {
  storeName: "Nongskopi",
  tagline: "BREAK WITH YOUR COFFEE",
  address: "Jl. Tun Abdul Razak",
  phone: "+62 823-1625-2944",
  cashierName: "Admin",
  tax: 0,
  discount: 0,
};

// Initial Seed Function
function seedInitialData() {
  if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(DEFAULT_SETTINGS)
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.CART)) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    // Seed 3 realistic sample transactions for initial dashboard metrics
    const sampleTrx = [
      {
        id: "NS-00001",
        date: new Date(Date.now() - 3600000 * 5).toISOString(),
        customerName: "Ahmad",
        items: [
          {
            id: "M-001",
            name: "Aren Latte",
            price: 13000,
            qty: 2,
            subtotal: 26000,
          },
          {
            id: "M-006",
            name: "Americano",
            price: 13000,
            qty: 1,
            subtotal: 13000,
          },
        ],
        subtotal: 39000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        total: 39000,
        payAmount: 50000,
        changeAmount: 11000,
        paymentMethod: "Cash",
        status: "Selesai",
        cashier: "Admin",
      },
      {
        id: "NS-00002",
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        customerName: "Siti",
        items: [
          {
            id: "M-003",
            name: "Nongs Kopi",
            price: 15000,
            qty: 2,
            subtotal: 30000,
          },
          {
            id: "M-012",
            name: "Matcha Latte",
            price: 15000,
            qty: 1,
            subtotal: 15000,
          },
        ],
        subtotal: 45000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        total: 45000,
        payAmount: 45000,
        changeAmount: 0,
        paymentMethod: "QRIS",
        status: "Selesai",
        cashier: "Admin",
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sampleTrx));
  }
}

// Storage Helpers
function getStoredData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error reading localStorage:", e);
    return null;
  }
}

function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error writing localStorage:", e);
  }
}

// Auth Guards & Session Management
function checkAuth(isLoginPage = false) {
  const session = getStoredData(STORAGE_KEYS.LOGIN);
  const isLoggedIn = session && session.isLoggedIn === true;

  if (isLoginPage) {
    if (isLoggedIn) {
      window.location.href = "dashboard.html";
    }
  } else {
    if (!isLoggedIn) {
      window.location.href = "index.html";
    }
  }
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.LOGIN);
  showToast("Logout berhasil", "info");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

// Formatters
function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return "Rp" + num.toLocaleString("id-ID");
}

function formatDate(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Toast Notifications
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  let icon = "✔";
  if (type === "error") icon = "✖";
  if (type === "info") icon = "ℹ";

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Render Sidebar Navigation automatically
function initLayout(activePage) {
  seedInitialData();
  const sidebarEl = document.getElementById("sidebar-container");
  const headerEl = document.getElementById("top-header-container");

  const settings = getStoredData(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;

  if (sidebarEl) {
    sidebarEl.innerHTML = `
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-brand">
            <h2>NONGSKOPI</h2>
            <span>SISTEM KASIR</span>
          </div>
        </div>
        <ul class="sidebar-menu">
          <li>
            <a href="dashboard.html" class="${
              activePage === "dashboard" ? "active" : ""
            }">
              Dashboard
            </a>
          </li>
          <li>
            <a href="kasir.html" class="${
              activePage === "kasir" ? "active" : ""
            }">
              Kasir
            </a>
          </li>
          <li>
            <a href="menu.html" class="${
              activePage === "menu" ? "active" : ""
            }">
              Menu Coffee
            </a>
          </li>
          <li>
            <a href="pesanan.html" class="${
              activePage === "pesanan" ? "active" : ""
            }">
              Riwayat Pesanan
            </a>
          </li>
          <li>
            <a href="laporan.html" class="${
              activePage === "laporan" ? "active" : ""
            }">
               Laporan Penjualan
            </a>
          </li>
          <li>
            <a href="pengaturan.html" class="${
              activePage === "pengaturan" ? "active" : ""
            }">
              Pengaturan
            </a>
          </li>
        </ul>
        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="user-avatar">A</div>
            <div class="user-info">
              <h4>${settings.cashierName || "Admin"}</h4>
              <p>Kasir Utama</p>
            </div>
          </div>
          <button class="btn-logout" onclick="handleLogout()">
             Logout
          </button>
        </div>
      </aside>
    `;
  }

  if (headerEl) {
    const pageTitles = {
      dashboard: {
        title: "Dashboard Analytics",
        desc: "Ringkasan performa penjualan Nongskopi hari ini",
      },
      kasir: {
        title: "Kasir",
        desc: "Sistem transaksi & pembuatan pesanan cepat",
      },
      menu: { title: "Daftar & Kelola Menu", desc: "NONGSKOPI OUR MENU" },
      pesanan: {
        title: "Riwayat Pesanan",
        desc: "Daftar seluruh transaksi yang telah dicatat",
      },
      laporan: {
        title: "Laporan Penjualan",
        desc: "Analisis statistik & grafik perkembangan bisnis",
      },
      pengaturan: {
        title: "Pengaturan Toko",
        desc: "Konfigurasi profil usaha & tarif pajak/diskon",
      },
    };

    const info = pageTitles[activePage] || {
      title: "NONGSKOPI",
      desc: "Sistem Kasir Coffee Shop",
    };

    headerEl.innerHTML = `
      <header class="top-header">
        <div style="display: flex; align-items: center; gap: 15px;">
          <button class="toggle-sidebar-btn" onclick="toggleMobileSidebar()">☰</button>
          <div class="header-title">
            <h1>${info.title}</h1>
            <p>${info.desc}</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="current-time" id="header-live-clock">--:--:--</div>
        </div>
      </header>
    `;
    startLiveClock();
  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById("app-sidebar");
  if (sidebar) {
    sidebar.classList.toggle("show");
  }
}

function startLiveClock() {
  const clockEl = document.getElementById("header-live-clock");
  if (!clockEl) return;
  const update = () => {
    const now = new Date();
    clockEl.innerText =
      now.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " " +
      now.toLocaleTimeString("id-ID");
  };
  update();
  setInterval(update, 1000);
}
