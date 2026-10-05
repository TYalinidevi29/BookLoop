/**
 * BookLoop - Home Page Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('recent-books-list');
  if (!container) return;

  try {
    const data = await apiFetch('/books');
    const books = data.books || [];

    if (books.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📖</div>
          <h3>No books have been shared yet!</h3>
          <p>Be the first reader to share a book with the community.</p>
          <a href="my-books.html" class="btn btn-primary">Add a Book Now</a>
        </div>
      `;
      return;
    }

    // Show up to 6 recent books
    const previewBooks = books.slice(0, 6);
    const currentUser = getUser();

    container.innerHTML = previewBooks.map(book => {
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
            <span class="book-owner">👤 ${escapeHtml(ownerName)}</span>
          </div>
          <div class="book-footer">
            ${
              isOwner
                ? `<span class="badge badge-accepted" style="width:100%;text-align:center;">Your Book</span>`
                : `<button class="btn btn-primary btn-sm btn-block" onclick="handleQuickRequest('${book._id}')">Request Book</button>`
            }
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p style="color:var(--danger)">Failed to load books: ${error.message}</p>
      </div>
    `;
  }
});

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function handleQuickRequest(bookId) {
  if (!isLoggedIn()) {
    showMessage('Please log in first to request a book', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  try {
    const res = await apiFetch('/requests', {
      method: 'POST',
      body: JSON.stringify({ bookId })
    });
    showMessage(res.message || 'Request sent successfully!', 'success');
  } catch (err) {
    showMessage(err.message, 'error');
  }
}
