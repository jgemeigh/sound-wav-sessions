(function (root) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const button = (attribute, id, label, style = 'ghost') => `<button class="mini-button ${style}" type="button" ${attribute}="${escape(id)}">${label}</button>`;

  function render(newsletters, editingId = '') {
    if (!newsletters.length) return '<article class="admin-list-item"><p>No newsletters saved yet.</p></article>';
    const current = newsletters.find(item => item.is_current) || newsletters[0];
    return newsletters.map(item => {
      const isCurrent = item.id === current.id;
      const locked = !!item.broadcast_locked_at;
      const editing = item.id === editingId;
      const status = item.sent_at
        ? `Last broadcast ${new Date(item.sent_at).toLocaleDateString()} to ${escape(item.recipients_count ?? 0)} subscribers.`
        : 'Not broadcast yet.';
      const editActions = editing
        ? button('data-save-newsletter-id', item.id, 'Save', '') + button('data-cancel-newsletter-id', item.id, 'Cancel')
        : button('data-edit-newsletter-id', item.id, 'Edit', '');
      const broadcastActions = locked ? '<span class="current-tag">Broadcast locked</span>' : isCurrent
        ? button('data-broadcast-newsletter-id', item.id, 'Broadcast') + button('data-test-broadcast-newsletter-id', item.id, 'Test broadcast') + button('data-reconnect-gmail', '', 'Reconnect Gmail') : '';
      const currentAction = isCurrent ? '' : button('data-set-current-newsletter-id', item.id, 'Set current');
      const lockAction = `<button class="mini-button ghost" type="button" data-lock-newsletter-id="${escape(item.id)}" data-lock-value="${!locked}">${locked ? 'Unlock broadcast' : 'Lock broadcast'}</button>`;
      const content = editing
        ? `<label>Subject<input type="text" data-newsletter-subject value="${escape(item.subject)}"></label><label>Message<textarea rows="6" data-newsletter-body>${escape(item.body)}</textarea></label>`
        : `<p><strong>${escape(item.subject)}</strong>${isCurrent ? ' <span class="current-tag">Current</span>' : ''}</p><p>${escape(item.body)}</p>`;
      const body = `${content}<p>${status}</p><div class="list-actions">${editActions}${broadcastActions}${currentAction}${lockAction}${button('data-delete-newsletter-id', item.id, 'Delete', 'danger')}</div>`;
      return editing
        ? `<article class="admin-list-item" data-newsletter-inline-id="${escape(item.id)}"><div class="inline-editor">${body}</div></article>`
        : `<article class="admin-list-item">${body}</article>`;
    }).join('');
  }
  const api = { render };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SoundWavNewsletters = api;
})(typeof window !== 'undefined' ? window : globalThis);
