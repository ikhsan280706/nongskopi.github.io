/* ==========================================
   NONGSKOPI - Login Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // First seed initial default menu & settings
  seedInitialData();

  // If already logged in, redirect to dashboard
  checkAuth(true);

  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember-me');
  const errorAlert = document.getElementById('login-error-alert');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');

  // Toggle password visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  // Handle Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      // Demo credential validation
      if (username === 'admin' && password === 'admin123') {
        const sessionData = {
          isLoggedIn: true,
          user: 'Admin',
          remember: rememberCheckbox.checked,
          loginTime: new Date().toISOString()
        };

        setStoredData(STORAGE_KEYS.LOGIN, sessionData);
        showToast('Login berhasil! Mengalihkan...', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 600);
      } else {
        errorAlert.style.display = 'block';
        errorAlert.innerText = 'Username atau password salah! (Gunakan admin / admin123)';
        showToast('Login gagal! Periksa username & password.', 'error');
      }
    });
  }
});
