/**
 * BookLoop - Shared Navigation Bar Component
 */

function setupNavbar() {
  const navContainer = document.getElementById('navbar');
  if (!navContainer) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const user = getUser();
  const loggedIn = isLoggedIn();

  navContainer.innerHTML = `
    <nav class="navbar">
      <div class="nav-container">
        <a href="index.html" class="nav-logo">
          <span class="logo-icon">📚</span>
          <span>BookLoop</span>
        </a>

        <ul class="nav-links">
          <li>
            <a href="index.html" class="${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}">
              Home
            </a>
          </li>
          <li>
            <a href="browse.html" class="${currentPath === 'browse.html' ? 'active' : ''}">
              Browse Books
            </a>
          </li>
          ${
            loggedIn
              ? `
              <li>
                <a href="my-books.html" class="${currentPath === 'my-books.html' ? 'active' : ''}">
                  My Books
                </a>
              </li>
              <li>
                <a href="my-requests.html" class="${currentPath === 'my-requests.html' ? 'active' : ''}">
                  My Requests
                </a>
              </li>
              <li class="nav-user">
                <span class="user-badge" title="${user ? user.email : ''}">
                  👤 ${user ? user.name : 'User'}
                </span>
                <button id="logout-btn" class="btn btn-outline btn-sm">
                  Logout
                </button>
              </li>
              `
              : `
              <li>
                <a href="login.html" class="${currentPath === 'login.html' ? 'active' : ''}">
                  Login
                </a>
              </li>
              <li>
                <a href="register.html" class="btn btn-primary btn-sm" style="color: #fff;">
                  Register
                </a>
              </li>
              `
          }
        </ul>
      </div>
    </nav>
  `;

  // Attach logout handler if button exists
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        logout();
      }
    });
  }
}

// Auto initialize navbar when DOM is ready
document.addEventListener('DOMContentLoaded', setupNavbar);
