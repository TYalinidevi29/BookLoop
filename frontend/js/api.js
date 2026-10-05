/**
 * BookLoop - API and Client Authentication Helper
 */

// Base API URL configuration
const API_BASE = window.location.port === '5000' || window.location.port === ''
  ? '/api'
  : 'http://localhost:5000/api';

// Storage keys
const TOKEN_KEY = 'bookloop_token';
const USER_KEY = 'bookloop_user';

// Get stored authentication token
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Get stored user object
function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

// Set authentication session
function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Clear authentication session and logout
function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = 'login.html';
}

// Helper to make API requests with automatic Authorization header
async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse JSON response from server'
    }));

    if (!response.ok) {
      // If unauthorized token, clear session
      if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      throw new Error(data.message || 'An error occurred during request');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Show clean alert toast notification
function showMessage(message, type = 'info', duration = 3500) {
  let container = document.getElementById('alert-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'alert-toast-container';
    container.className = 'alert-container';
    document.body.appendChild(container);
  }

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  alert.innerHTML = `
    <span><strong>${icon}</strong> ${message}</span>
    <button style="background:none;border:none;cursor:pointer;font-size:1.1rem;margin-left:10px;color:inherit;" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.4s ease';
    setTimeout(() => alert.remove(), 400);
  }, duration);
}

// Require login on protected pages
function requireAuth() {
  if (!isLoggedIn()) {
    sessionStorage.setItem('redirect_after_login', window.location.pathname);
    window.location.href = 'login.html';
  }
}
