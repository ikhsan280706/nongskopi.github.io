/* ==========================================
   NONGSKOPI - Settings Form Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  initLayout('pengaturan');

  loadSettingsForm();

  const form = document.getElementById('settings-form');
  if (form) {
    form.addEventListener('submit', saveSettingsForm);
  }
});

function loadSettingsForm() {
  const settings = getStoredData(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;

  document.getElementById('setting-store-name').value = settings.storeName || 'Nongskopi';
  document.getElementById('setting-tagline').value = settings.tagline || 'BREAK WITH YOUR COFFE';
  document.getElementById('setting-address').value = settings.address || '';
  document.getElementById('setting-phone').value = settings.phone || '';
  document.getElementById('setting-cashier-name').value = settings.cashierName || 'Admin';
  document.getElementById('setting-tax').value = settings.tax !== undefined ? settings.tax : 0;
  document.getElementById('setting-discount').value = settings.discount !== undefined ? settings.discount : 0;
}

function saveSettingsForm(e) {
  e.preventDefault();

  const updatedSettings = {
    storeName: document.getElementById('setting-store-name').value.trim() || 'Nongskopi',
    tagline: document.getElementById('setting-tagline').value.trim() || 'BREAK WITH YOUR COFFE',
    address: document.getElementById('setting-address').value.trim() || '',
    phone: document.getElementById('setting-phone').value.trim() || '',
    cashierName: document.getElementById('setting-cashier-name').value.trim() || 'Admin',
    tax: parseFloat(document.getElementById('setting-tax').value) || 0,
    discount: parseFloat(document.getElementById('setting-discount').value) || 0
  };

  setStoredData(STORAGE_KEYS.SETTINGS, updatedSettings);
  showToast('Pengaturan toko berhasil disimpan!', 'success');

  // Re-render layout so cashier name and titles update dynamically
  initLayout('pengaturan');
}
