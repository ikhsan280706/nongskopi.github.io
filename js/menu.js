/* ==========================================
   NONGSKOPI - Menu Management Logic
   ========================================== */

let searchMenuQuery = '';
let categoryFilterValue = 'Semua';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  initLayout('menu');

  setupMenuEventListeners();
  renderMenuTable();
});

function setupMenuEventListeners() {
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchMenuQuery = e.target.value.toLowerCase().trim();
      renderMenuTable();
    });
  }

  const categorySelect = document.getElementById('menu-category-filter');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      categoryFilterValue = e.target.value;
      renderMenuTable();
    });
  }

  const menuForm = document.getElementById('menu-form');
  if (menuForm) {
    menuForm.addEventListener('submit', handleSaveMenu);
  }
}

function renderMenuTable() {
  const tbody = document.getElementById('menu-table-tbody');
  if (!tbody) return;

  const menuList = getStoredData(STORAGE_KEYS.MENU) || DEFAULT_MENU;

  const filtered = menuList.filter(item => {
    const matchesCategory = categoryFilterValue === 'Semua' || item.category === categoryFilterValue;
    const matchesSearch = item.name.toLowerCase().includes(searchMenuQuery) || 
                          (item.description && item.description.toLowerCase().includes(searchMenuQuery));
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
          Tidak ada menu yang sesuai kriteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const isAvailable = item.status === 'Tersedia' && item.stock > 0;
    const statusBadge = isAvailable 
      ? `<span class="badge badge-success">Tersedia</span>` 
      : `<span class="badge badge-danger">Habis</span>`;

    return `
      <tr>
        <td style="font-size: 24px; text-align: center;">${item.icon || '☕'}</td>
        <td>
          <strong>${item.name}</strong>
          <div style="font-size: 11px; color: var(--text-muted);">${item.description || ''}</div>
        </td>
        <td><span class="badge badge-secondary">${item.category}</span></td>
        <td style="text-align: right; font-weight: 600;">${formatRupiah(item.price)}</td>
        <td style="text-align: right; font-weight: 600;">${item.stock}</td>
        <td>${statusBadge}</td>
        <td style="text-align: center;">
          <button class="btn btn-outline btn-sm" onclick="openEditMenuModal('${item.id}')" title="Edit">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteMenuItem('${item.id}')" title="Hapus">hapus</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddMenuModal() {
  document.getElementById('menu-modal-title').innerText = 'Tambah Menu Baru';
  document.getElementById('menu-id-input').value = '';
  document.getElementById('menu-name-input').value = '';
  document.getElementById('menu-category-input').value = 'Espresso-Based';
  document.getElementById('menu-price-input').value = '';
  document.getElementById('menu-stock-input').value = '50';
  document.getElementById('menu-status-input').value = 'Tersedia';
  document.getElementById('menu-icon-input').value = '☕';
  document.getElementById('menu-desc-input').value = '';

  const modal = document.getElementById('menu-modal');
  modal.classList.add('show');
}

function openEditMenuModal(id) {
  const menuList = getStoredData(STORAGE_KEYS.MENU) || DEFAULT_MENU;
  const item = menuList.find(m => m.id === id);
  if (!item) return;

  document.getElementById('menu-modal-title').innerText = 'Edit Menu Nongskopi';
  document.getElementById('menu-id-input').value = item.id;
  document.getElementById('menu-name-input').value = item.name;
  document.getElementById('menu-category-input').value = item.category;
  document.getElementById('menu-price-input').value = item.price;
  document.getElementById('menu-stock-input').value = item.stock;
  document.getElementById('menu-status-input').value = item.status || 'Tersedia';
  document.getElementById('menu-icon-input').value = item.icon || '☕';
  document.getElementById('menu-desc-input').value = item.description || '';

  const modal = document.getElementById('menu-modal');
  modal.classList.add('show');
}

function closeMenuModal() {
  const modal = document.getElementById('menu-modal');
  modal.classList.remove('show');
}

function handleSaveMenu(e) {
  e.preventDefault();

  const id = document.getElementById('menu-id-input').value;
  const name = document.getElementById('menu-name-input').value.trim();
  const category = document.getElementById('menu-category-input').value;
  const price = parseFloat(document.getElementById('menu-price-input').value) || 0;
  const stock = parseInt(document.getElementById('menu-stock-input').value, 10) || 0;
  const status = document.getElementById('menu-status-input').value;
  const icon = document.getElementById('menu-icon-input').value.trim() || '☕';
  const description = document.getElementById('menu-desc-input').value.trim();

  let menuList = getStoredData(STORAGE_KEYS.MENU) || DEFAULT_MENU;

  if (id) {
    // Update Existing
    const index = menuList.findIndex(m => m.id === id);
    if (index !== -1) {
      menuList[index] = {
        ...menuList[index],
        name,
        category,
        price,
        stock,
        status,
        icon,
        description
      };
      showToast(`Menu ${name} berhasil diperbarui`, 'success');
    }
  } else {
    // Create New
    const newId = 'M-' + String(menuList.length + 1).padStart(3, '0');
    const newItem = {
      id: newId,
      name,
      category,
      price,
      stock,
      status,
      icon,
      description
    };
    menuList.push(newItem);
    showToast(`Menu ${name} berhasil ditambahkan`, 'success');
  }

  setStoredData(STORAGE_KEYS.MENU, menuList);
  closeMenuModal();
  renderMenuTable();
}

function deleteMenuItem(id) {
  let menuList = getStoredData(STORAGE_KEYS.MENU) || DEFAULT_MENU;
  const item = menuList.find(m => m.id === id);

  if (!item) return;

  if (confirm(`Apakah Anda yakin ingin menghapus menu "${item.name}"?`)) {
    menuList = menuList.filter(m => m.id !== id);
    setStoredData(STORAGE_KEYS.MENU, menuList);
    showToast(`Menu ${item.name} telah dihapus`, 'info');
    renderMenuTable();
  }
}
