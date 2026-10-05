/**
 * BookLoop - Browse Books Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const booksGrid = document.getElementById('books-grid');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const resetBtn = document.getElementById('reset-search-btn');
  const feedback = document.getElementById('search-feedback');

  // Load books with optional search query
  async function loadBooks(query = '') {
    booksGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⏳</div>
        <h3>Loading books...</h3>
      </div>
    `;

    try {
      const endpoint = query ? `/books?search=${encodeURIComponent(query)}` : '/books';
      const data = await apiFetch(endpoint);
      const books = data.books || [];

      if (query) {
        feedback.style.display = 'block';
        feedback.textContent = `Found ${books.length} ${books.length === 1 ? 'book' : 'books'} matching "${query}"`;
        resetBtn.style.display = 'inline-flex';
      } else {
        feedback.style.display = 'none';
        resetBtn.style.display = 'none';
      }

      if (books.length === 0) {
        booksGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🔍</div>
            <h3>No books found</h3>
            <p>${query ? 'Try searching with different keywords or author name.' : 'No books are currently in the catalog. Be the first to add one!'}</p>
            ${!query ? '<a href="my-books.html" class="btn btn-primary">Share a Book</a>' : ''}
          </div>
        `;
        return;
      }

      const currentUser = getUser();

      booksGrid.innerHTML = books.map(book => {
        const isOwner = currentUser && book.owner && (book.owner._id === currentUser._id || book.owner === currentUser._id);
        const ownerName = book.owner ? book.owner.name : 'Unknown';

        return `
          <div class="book-card">
            <div class="book-header">
              <span class="book-category">${escapeHtml(book.category)}</span>
              <h3 class="book-title">${escapeHtml(book.title)}</h3>
              <p class="book-author">✍️ by ${escapeHtml(book.author)}</p>
            </div>
            <div class="book-meta">
              <span class="book-owner" title="${book.owner ? book.owner.email : ''}">👤 Owner: <strong>${escapeHtml(ownerName)}</strong></span>
            </div>
            <div class="book-footer">
              ${
                isOwner
                  ? `<span class="badge badge-accepted" style="width:100%;text-align:center;padding:8px;">Your Book</span>`
                  : `<button class="btn btn-primary btn-sm btn-block" onclick="handleRequestBook('${book._id}', '${escapeJs(book.title)}')">
                      Request Book
                    </button>`
              }
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      booksGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p style="color:var(--danger);">Error loading books: ${error.message}</p>
        </div>
      `;
    }
  }

  // Search event listeners
  searchBtn.addEventListener('click', () => {
    loadBooks(searchInput.value.trim());
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadBooks(searchInput.value.trim());
    }
  });

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    loadBooks('');
  });

  // Initial load
  loadBooks();
});

// Request Book Action
async function handleRequestBook(bookId, bookTitle) {
  if (!isLoggedIn()) {
    showMessage('Please login or register to request books', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  const confirmed = confirm(`Would you like to send a request for "${bookTitle}"?`);
  if (!confirmed) return;

  try {
    const res = await apiFetch('/requests', {
      method: 'POST',
      body: JSON.stringify({ bookId })
    });
    showMessage(res.message || 'Book requested successfully!', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeJs(text) {
  if (!text) return '';
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
