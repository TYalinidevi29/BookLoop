/**
 * BookLoop - Authentication Logic (Login & Registration)
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // If user is already logged in, redirect them away from auth pages
  if (isLoggedIn()) {
    const redirectUrl = sessionStorage.getItem('redirect_after_login') || 'browse.html';
    sessionStorage.removeItem('redirect_after_login');
    // Only redirect if explicitly on login or register page
    const page = window.location.pathname.split('/').pop();
    if (page === 'login.html' || page === 'register.html') {
      window.location.href = redirectUrl;
      return;
    }
  }

  // Handle Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = document.getElementById('login-btn');

      if (!email || !password) {
        showMessage('Please provide both email and password', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      try {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        showMessage('Login successful! Redirecting...', 'success');
        setAuthSession(response.token, response.user);

        const redirectUrl = sessionStorage.getItem('redirect_after_login') || 'browse.html';
        sessionStorage.removeItem('redirect_after_login');

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 800);
      } catch (error) {
        showMessage(error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
      }
    });
  }

  // Handle Register Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = document.getElementById('register-btn');

      if (!name || !email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
      }

      if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      try {
        const response = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });

        showMessage('Account created successfully! Redirecting...', 'success');
        setAuthSession(response.token, response.user);

        setTimeout(() => {
          window.location.href = 'browse.html';
        }, 800);
      } catch (error) {
        showMessage(error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }
});
