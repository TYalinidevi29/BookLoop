/**
 * BookLoop - My Requests Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  const tabSentBtn = document.getElementById('tab-sent-btn');
  const tabReceivedBtn = document.getElementById('tab-received-btn');
  const sentSection = document.getElementById('sent-requests-section');
  const receivedSection = document.getElementById('received-requests-section');

  const sentBody = document.getElementById('sent-requests-body');
  const receivedBody = document.getElementById('received-requests-body');

  const sentCount = document.getElementById('sent-count');
  const receivedCount = document.getElementById('received-count');

  // Tab switching logic
  tabSentBtn.addEventListener('click', () => {
    tabSentBtn.className = 'btn btn-primary btn-sm';
    tabReceivedBtn.className = 'btn btn-outline btn-sm';
    sentSection.style.display = 'block';
    receivedSection.style.display = 'none';
  });

  tabReceivedBtn.addEventListener('click', () => {
    tabReceivedBtn.className = 'btn btn-primary btn-sm';
    tabSentBtn.className = 'btn btn-outline btn-sm';
    receivedSection.style.display = 'block';
    sentSection.style.display = 'none';
  });

  // Load sent requests
  async function loadSentRequests() {
    try {
      const data = await apiFetch('/requests/my-requests');
      const requests = data.requests || [];
      sentCount.textContent = requests.length;

      if (requests.length === 0) {
        sentBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 40px;">
              <div class="empty-state-icon">📤</div>
              <h3 style="margin-bottom:6px;">No requests sent yet</h3>
              <p style="color:var(--text-muted);margin-bottom:12px;">Browse books shared by others and request one!</p>
              <a href="browse.html" class="btn btn-primary btn-sm">Browse Books</a>
            </td>
          </tr>
        `;
        return;
      }

      sentBody.innerHTML = requests.map(req => {
        const bookTitle = req.book ? req.book.title : '(Book removed)';
        const bookCategory = req.book ? req.book.category : '-';
        const ownerName = req.owner ? req.owner.name : 'Unknown';
        const dateStr = new Date(req.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const statusClass = req.status === 'Accepted'
          ? 'badge-accepted'
          : req.status === 'Rejected'
            ? 'badge-rejected'
            : 'badge-pending';

        return `
          <tr>
            <td><strong>${escapeHtml(bookTitle)}</strong></td>
            <td><span class="badge" style="background:#e0e7ff;color:#3730a3;">${escapeHtml(bookCategory)}</span></td>
            <td>👤 ${escapeHtml(ownerName)}</td>
            <td>
              <span class="badge ${statusClass}">
                ${escapeHtml(req.status)}
              </span>
            </td>
            <td>${dateStr}</td>
          </tr>
        `;
      }).join('');

    } catch (error) {
      sentBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--danger); padding: 30px;">
            Error loading requests: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  // Load received requests (incoming requests for the user's books)
  async function loadReceivedRequests() {
    try {
      const data = await apiFetch('/requests/received');
      const requests = data.requests || [];
      receivedCount.textContent = requests.length;

      if (requests.length === 0) {
        receivedBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 40px;">
              <div class="empty-state-icon">📥</div>
              <h3 style="margin-bottom:6px;">No incoming requests</h3>
              <p style="color:var(--text-muted);">When other readers request your books, they will appear here.</p>
            </td>
          </tr>
        `;
        return;
      }

      receivedBody.innerHTML = requests.map(req => {
        const bookTitle = req.book ? req.book.title : '(Book removed)';
        const requesterName = req.requester ? req.requester.name : 'Unknown';
        const requesterEmail = req.requester ? req.requester.email : '-';

        const statusClass = req.status === 'Accepted'
          ? 'badge-accepted'
          : req.status === 'Rejected'
            ? 'badge-rejected'
            : 'badge-pending';

        return `
          <tr>
            <td><strong>${escapeHtml(bookTitle)}</strong></td>
            <td>👤 ${escapeHtml(requesterName)}</td>
            <td>✉️ ${escapeHtml(requesterEmail)}</td>
            <td><span class="badge ${statusClass}">${escapeHtml(req.status)}</span></td>
            <td>
              ${
                req.status === 'Pending'
                  ? `
                    <div style="display:flex;gap:6px;">
                      <button
                        class="btn btn-secondary btn-sm"
                        onclick="handleUpdateStatus('${req._id}', 'Accepted')">
                        Accept
                      </button>
                      <button
                        class="btn btn-danger-outline btn-sm"
                        onclick="handleUpdateStatus('${req._id}', 'Rejected')">
                        Reject
                      </button>
                    </div>
                  `
                  : `<span style="font-size:0.85rem;color:var(--text-muted);">Resolved</span>`
              }
            </td>
          </tr>
        `;
      }).join('');

    } catch (error) {
      receivedBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--danger); padding: 30px;">
            Error loading received requests: ${error.message}
          </td>
        </tr>
      `;
    }
  }

  // Initial load
  loadSentRequests();
  loadReceivedRequests();
});

// Update request status (Accept / Reject)
async function handleUpdateStatus(requestId, newStatus) {
  const confirmed = confirm(`Are you sure you want to mark this request as ${newStatus}?`);
  if (!confirmed) return;

  try {
    const res = await apiFetch(`/requests/${requestId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    showMessage(res.message || `Request marked as ${newStatus}`, 'success');

    // Reload both tabs
    setTimeout(() => {
      window.location.reload();
    }, 600);
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
