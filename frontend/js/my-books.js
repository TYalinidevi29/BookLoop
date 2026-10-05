/**
 * BookLoop - My Books Management Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Guard route
  requireAuth();

  const addBookForm = document.getElementById('add-book-form');
  const myBooksContainer = document.getElementById('my-books-container');
  const myBooksCount = document.getElementById('my-books-count');
  const addBookBtn = document.getElementById('add-book-btn');

  // Load user's books
  async function loadMyBooks() {
    myBooksContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⏳</div>
        <h3>Loading your collection...</h3>
      </div>
    `;

    try {
      const data = await apiFetch('/books/my-books');
      const books = data.books || [];

      myBooksCount.textContent = `${books.length} ${books.length === 1 ? 'book' : 'books'}`;

      if (books.length === 0) {
        myBooksContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📚</div>
            <h3>No books added yet</h3>
            <p>Use the form on the left to add your first book to BookLoop!</p>
          </div>
        `;
        return;
      }

      myBooksContainer.innerHTML = books.map(book => {
        const addedDate = new Date(book.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        return `
          <div class="book-card" id="book-card-${book._id}">
            <div class="book-header">
              <span class="book-category">${escapeHtml(book.category)}</span>
              <h3 class="book-title">${escapeHtml(book.title)}</h3>
              <p class="book-author">✍️ by ${escapeHtml(book.author)}</p>
            </div>
            <div class="book-meta">
              <span>📅 Added on: ${addedDate}</span>
            </div>
            <div class="book-footer">
              <button
                class="btn btn-danger-outline btn-sm btn-block"
                onclick="handleDeleteBook('${book._id}', '${escapeJs(book.title)}')">
                🗑️ Delete Book
              </button>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      myBooksContainer.innerHTML = `
        <div class="empty-state">
          <p style="color:var(--danger)">Error loading your books: ${error.message}</p>
        </div>
      `;
    }
  }

  // Handle Add Book form submission
  addBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const category = document.getElementById('book-category').value.trim();

    if (!title || !author || !category) {
      showMessage('Please fill in all book details', 'error');
      return;
    }

    addBookBtn.disabled = true;
    addBookBtn.textContent = 'Adding Book...';

    try {
      const res = await apiFetch('/books', {
        method: 'POST',
        body: JSON.stringify({ title, author, category })
      });

      showMessage(res.message || 'Book added successfully!', 'success');
      addBookForm.reset();
      loadMyBooks();
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      addBookBtn.disabled = false;
      addBookBtn.textContent = 'Add Book to Collection';
    }
  });

  // Initial load
  loadMyBooks();
});

// Delete book action
async function handleDeleteBook(bookId, bookTitle) {
  const confirmed = confirm(`Are you sure you want to delete "${bookTitle}"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    const res = await apiFetch(`/books/${bookId}`, {
      method: 'DELETE'
    });

    showMessage(res.message || 'Book deleted successfully', 'success');

    // Remove book card from UI or reload
    const card = document.getElementById(`book-card-${bookId}`);
    if (card) {
      card.remove();
    }
    // Update count
    const countBadge = document.getElementById('my-books-count');
    const remainingCards = document.querySelectorAll('#my-books-container .book-card');
    if (countBadge) {
      countBadge.textContent = `${remainingCards.length} ${remainingCards.length === 1 ? 'book' : 'books'}`;
    }
    if (remainingCards.length === 0) {
      document.getElementById('my-books-container').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <h3>No books added yet</h3>
          <p>Use the form on the left to add your first book to BookLoop!</p>
        </div>
      `;
    }
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
