/**
 * LilyPad ERP - Quick Email Viewer (modal)
 * A self-contained "read and act on one email thread" popup, callable
 * from anywhere as window.lilypadOpenEmailViewer(graphMessageId) -
 * built so dashboard widgets that reference a specific email (Priority
 * Conversations, Suggested Tasks) can let someone read/reply/forward/
 * archive/delete it without leaving the page to go to email.html.
 *
 * Talks to the exact same /api/v1/lilypad/email/* endpoints email.html
 * uses - this is a second, smaller UI over the same mailbox actions,
 * not a parallel feature. Injected once (like lilypad-teams-chat.js)
 * and wired up via addEventListener, no inline onclick, so it can sit
 * alongside a page's own unrelated inline script safely.
 */
(function () {
  'use strict'

  let currentThreadMessages = []
  let replyMode = null // 'reply' | 'replyAll' | 'forward'
  let replyAttachments = []

  function escapeHtml (value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]
    })
  }

  function ensureStylesInjected () {
    if (document.getElementById('lilypadEmailViewerStyles')) return
    const style = document.createElement('style')
    style.id = 'lilypadEmailViewerStyles'
    style.textContent =
      '#lpEmailViewerModal .lp-ev-thread-frame { width:100%; height:50vh; min-height:320px; border:none; }' +
      '#lpEmailViewerModal .lp-ev-thread-item.is-collapsed .lp-ev-thread-body { display:none; }' +
      '#lpEmailViewerModal .lp-ev-thread-item-header { cursor:pointer; background:#f8fafc; }' +
      '#lpEmailViewerModal .lp-ev-reply-body { min-height:100px; max-height:220px; overflow-y:auto; border:1px solid #dee2e6; border-radius:6px; padding:8px; }' +
      '#lpEmailViewerModal .lp-ev-reply-body:empty::before { content: attr(data-placeholder); color:#94a3b8; }'
    document.head.appendChild(style)
  }

  function modalMarkup () {
    return (
      '<div class="modal fade" id="lpEmailViewerModal" tabindex="-1">' +
        '<div class="modal-dialog modal-lg modal-dialog-scrollable">' +
          '<div class="modal-content">' +
            '<div class="modal-header py-2">' +
              '<h6 class="modal-title fw-bold" id="lpEmailViewerTitle">Loading...</h6>' +
              '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
            '</div>' +
            '<div class="modal-body" id="lpEmailViewerBody">' +
              '<div class="text-center text-muted py-5"><span class="spinner-border spinner-border-sm me-1"></span> Loading message...</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    )
  }

  function injectModal () {
    if (document.getElementById('lpEmailViewerModal')) return
    ensureStylesInjected()
    const wrapper = document.createElement('div')
    wrapper.innerHTML = modalMarkup()
    document.body.appendChild(wrapper.firstChild)
  }

  function getModalInstance () {
    return window.bootstrap.Modal.getOrCreateInstance(document.getElementById('lpEmailViewerModal'))
  }

  async function lilypadOpenEmailViewer (graphMessageId) {
    if (!graphMessageId) return
    injectModal()
    currentThreadMessages = []
    replyMode = null
    replyAttachments = []

    document.getElementById('lpEmailViewerTitle').textContent = 'Loading...'
    document.getElementById('lpEmailViewerBody').innerHTML = '<div class="text-center text-muted py-5"><span class="spinner-border spinner-border-sm me-1"></span> Loading message...</div>'
    getModalInstance().show()

    try {
      const threadRes = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(graphMessageId) + '/thread')
      const threadResult = await threadRes.json()
      if (!threadResult.success) throw new Error(threadResult.error)

      if (threadResult.data.length) {
        currentThreadMessages = threadResult.data
      } else {
        const soloRes = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(graphMessageId))
        const soloResult = await soloRes.json()
        if (!soloResult.success) throw new Error(soloResult.error)
        currentThreadMessages = [soloResult.data]
      }
      renderViewer()
    } catch (err) {
      document.getElementById('lpEmailViewerBody').innerHTML = '<div class="text-danger fs-13">' + escapeHtml(err.message) + '</div>'
    }
  }

  function renderMessageBodyInto (container, msg) {
    if (msg.bodyHtml) {
      const iframe = document.createElement('iframe')
      iframe.className = 'lp-ev-thread-frame'
      iframe.setAttribute('sandbox', '')
      container.appendChild(iframe)
      iframe.srcdoc = msg.bodyHtml
    } else {
      const pre = document.createElement('pre')
      pre.className = 'fs-13 mb-0'
      pre.style.cssText = 'white-space:pre-wrap; font-family:inherit;'
      pre.textContent = msg.bodyText || ''
      container.appendChild(pre)
    }
  }

  function entityBadgeMarkup (link) {
    const valueLabel = typeof link.snapshotValue === 'number' ? ' | $' + link.snapshotValue.toLocaleString() : ''
    const statusLabel = link.snapshotStatus ? ' | ' + link.snapshotStatus : ''
    return '<span class="badge bg-soft-primary text-primary fs-11 d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill">' +
      escapeHtml(link.snapshotLabel) + escapeHtml(statusLabel) + escapeHtml(valueLabel) +
      '<i class="ti ti-x" style="cursor:pointer;" data-dismiss-link="' + escapeHtml(link._id) + '" title="Dismiss"></i>' +
    '</span>'
  }

  async function loadEntityBadges (messageId) {
    const container = document.getElementById('lpEvEntityBadges')
    if (!container) return
    try {
      const res = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(messageId) + '/entity-links')
      const result = await res.json()
      container.innerHTML = (result.success ? result.data : []).map(entityBadgeMarkup).join('')
      container.querySelectorAll('[data-dismiss-link]').forEach((el) => {
        el.addEventListener('click', () => dismissEntityBadge(el.getAttribute('data-dismiss-link'), el.closest('.badge')))
      })
    } catch (err) {
      // Non-fatal - badges are a convenience, not core to reading/replying.
    }
  }

  async function dismissEntityBadge (linkId, badgeEl) {
    if (badgeEl) badgeEl.style.opacity = '0.4'
    try {
      const res = await fetch('/api/v1/lilypad/email/entity-links/' + encodeURIComponent(linkId) + '/dismiss', { method: 'POST' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      if (badgeEl) badgeEl.remove()
    } catch (err) {
      if (badgeEl) badgeEl.style.opacity = ''
    }
  }

  async function loadQuickSummary (latest) {
    const box = document.getElementById('lpEvQuickSummary')
    const text = document.getElementById('lpEvQuickSummaryText')
    if (!box || !text) return
    box.style.display = ''

    if (latest.triageSummary) {
      text.textContent = latest.triageSummary
      return
    }

    text.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Summarizing...'
    try {
      const res = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(latest.id) + '/summarize-now', { method: 'POST' })
      const result = await res.json()
      if (!result.success || !result.data || !result.data.summary) throw new Error((result.error) || 'No summary available.')
      if (currentThreadMessages[currentThreadMessages.length - 1].id !== latest.id) return
      text.textContent = result.data.summary
      latest.triageSummary = result.data.summary
    } catch (err) {
      text.textContent = 'No summary available for this email.'
    }
  }

  function renderViewer () {
    const body = document.getElementById('lpEmailViewerBody')
    const latest = currentThreadMessages[currentThreadMessages.length - 1]
    document.getElementById('lpEmailViewerTitle').textContent = latest.subject || '(no subject)'

    const itemsHtml = currentThreadMessages.map((msg, idx) => {
      const isLast = idx === currentThreadMessages.length - 1
      const fromLabel = (msg.from && (msg.from.name || msg.from.address)) || 'You'
      return (
        '<div class="lp-ev-thread-item border rounded-3 mb-2 ' + (isLast ? '' : 'is-collapsed') + '" data-thread-idx="' + idx + '">' +
          '<div class="lp-ev-thread-item-header p-2 px-3 d-flex align-items-center justify-content-between rounded-3">' +
            '<div class="d-flex align-items-center gap-2" style="min-width:0;">' +
              '<strong class="fs-13 text-truncate">' + escapeHtml(fromLabel) + '</strong>' +
              '<span class="fs-11 text-muted flex-shrink-0">' + escapeHtml(msg.receivedDateTime ? new Date(msg.receivedDateTime).toLocaleString() : '') + '</span>' +
            '</div>' +
            '<i class="ti ti-chevron-down"></i>' +
          '</div>' +
          '<div class="lp-ev-thread-body p-3" data-thread-body="' + idx + '"></div>' +
        '</div>'
      )
    }).join('')

    body.innerHTML =
      '<div class="d-flex align-items-center justify-content-end gap-1 mb-2">' +
        '<button type="button" class="btn btn-sm btn-outline-primary" id="lpEvReplyBtn"><i class="ti ti-arrow-back-up me-1"></i>Reply</button>' +
        '<button type="button" class="btn btn-sm btn-outline-primary" id="lpEvReplyAllBtn"><i class="ti ti-arrow-back-up-double me-1"></i>Reply All</button>' +
        '<button type="button" class="btn btn-sm btn-outline-secondary" id="lpEvForwardBtn"><i class="ti ti-arrow-forward-up me-1"></i>Forward</button>' +
        '<button type="button" class="btn btn-sm btn-outline-secondary" id="lpEvArchiveBtn" title="Archive"><i class="ti ti-archive"></i></button>' +
        '<button type="button" class="btn btn-sm btn-outline-danger" id="lpEvDeleteBtn" title="Delete"><i class="ti ti-trash"></i></button>' +
      '</div>' +
      '<div id="lpEvEntityBadges" class="d-flex flex-wrap gap-1 mb-2"></div>' +
      '<div id="lpEvQuickSummary" class="alert alert-soft-primary py-2 px-3 mb-2 fs-13 d-flex align-items-start gap-2" style="display:none;">' +
        '<i class="ti ti-sparkles mt-1 flex-shrink-0"></i>' +
        '<div class="flex-grow-1" style="min-width:0;">' +
          '<div class="d-flex align-items-center justify-content-between gap-2">' +
            '<div class="fw-semibold">Quick Summary</div>' +
          '</div>' +
          '<div id="lpEvQuickSummaryText" class="text-muted mb-2"></div>' +
          '<form id="lpEvQuickResponseForm" class="d-flex gap-2">' +
            '<input type="text" id="lpEvQuickResponseInput" class="form-control form-control-sm" placeholder="Quick response...">' +
            '<button type="submit" class="btn btn-sm btn-primary flex-shrink-0" title="Send"><i class="ti ti-send"></i></button>' +
          '</form>' +
        '</div>' +
      '</div>' +
      '<div id="lpEvThreadItems">' + itemsHtml + '</div>' +
      '<div id="lpEvInlineReplyBar" style="display:none;" class="border-top pt-3 mt-2">' +
        '<div class="d-flex align-items-center gap-2 mb-2">' +
          '<span class="badge bg-soft-primary text-primary" id="lpEvReplyModeLabel">Reply</span>' +
          '<input type="text" id="lpEvForwardTo" class="form-control form-control-sm" placeholder="To: name@company.com, ..." style="display:none; max-width:360px;">' +
        '</div>' +
        '<div id="lpEvReplyBody" class="lp-ev-reply-body" contenteditable="true" data-placeholder="Write a reply..."></div>' +
        '<div class="d-flex align-items-center flex-wrap gap-2 mt-2">' +
          '<label for="lpEvReplyAttachmentInput" class="btn btn-sm btn-outline-secondary mb-0"><i class="ti ti-paperclip me-1"></i>Attach</label>' +
          '<input type="file" id="lpEvReplyAttachmentInput" multiple style="display:none;">' +
          '<div id="lpEvReplyAttachmentList" class="d-flex flex-wrap gap-1"></div>' +
        '</div>' +
        '<div class="d-flex justify-content-end gap-2 mt-2">' +
          '<button type="button" class="btn btn-sm btn-light" id="lpEvReplyCancelBtn">Cancel</button>' +
          '<button type="button" class="btn btn-sm btn-primary" id="lpEvReplySendBtn"><i class="ti ti-send me-1"></i> Send</button>' +
        '</div>' +
      '</div>'

    currentThreadMessages.forEach((msg, idx) => {
      renderMessageBodyInto(body.querySelector('[data-thread-body="' + idx + '"]'), msg)
    })
    loadEntityBadges(latest.id)
    loadQuickSummary(latest)

    body.querySelectorAll('.lp-ev-thread-item-header').forEach((header) => {
      header.addEventListener('click', () => header.closest('.lp-ev-thread-item').classList.toggle('is-collapsed'))
    })

    document.getElementById('lpEvReplyBtn').addEventListener('click', () => startReply('reply'))
    document.getElementById('lpEvReplyAllBtn').addEventListener('click', () => startReply('replyAll'))
    document.getElementById('lpEvForwardBtn').addEventListener('click', () => startReply('forward'))
    document.getElementById('lpEvReplyCancelBtn').addEventListener('click', () => { document.getElementById('lpEvInlineReplyBar').style.display = 'none' })
    document.getElementById('lpEvReplySendBtn').addEventListener('click', sendInlineReply)
    document.getElementById('lpEvReplyAttachmentInput').addEventListener('change', onReplyAttachmentsChosen)
    document.getElementById('lpEvArchiveBtn').addEventListener('click', archiveCurrentEmail)
    document.getElementById('lpEvDeleteBtn').addEventListener('click', deleteCurrentEmail)
    document.getElementById('lpEvQuickResponseForm').addEventListener('submit', sendQuickResponse)
  }

  function renderReplyAttachmentList () {
    const list = document.getElementById('lpEvReplyAttachmentList')
    if (!list) return
    list.innerHTML = replyAttachments.map((file, idx) =>
      '<span class="badge bg-soft-secondary text-secondary fs-11 d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill">' +
        escapeHtml(file.name) +
        '<i class="ti ti-x" style="cursor:pointer;" data-remove-attachment="' + idx + '"></i>' +
      '</span>'
    ).join('')
    list.querySelectorAll('[data-remove-attachment]').forEach((el) => {
      el.addEventListener('click', () => {
        replyAttachments.splice(Number(el.getAttribute('data-remove-attachment')), 1)
        renderReplyAttachmentList()
      })
    })
  }

  function onReplyAttachmentsChosen (evt) {
    replyAttachments = replyAttachments.concat(Array.from(evt.target.files || []))
    evt.target.value = ''
    renderReplyAttachmentList()
  }

  function startReply (mode) {
    replyMode = mode
    const bar = document.getElementById('lpEvInlineReplyBar')
    const label = document.getElementById('lpEvReplyModeLabel')
    const toInput = document.getElementById('lpEvForwardTo')
    const editBody = document.getElementById('lpEvReplyBody')
    label.textContent = mode === 'reply' ? 'Reply' : mode === 'replyAll' ? 'Reply All' : 'Forward'
    toInput.style.display = mode === 'forward' ? '' : 'none'
    toInput.value = ''
    editBody.innerHTML = ''
    replyAttachments = []
    renderReplyAttachmentList()
    bar.style.display = ''
    editBody.focus()
  }

  async function sendInlineReply () {
    const latest = currentThreadMessages[currentThreadMessages.length - 1]
    const editBody = document.getElementById('lpEvReplyBody')
    const comment = editBody.innerHTML.trim()
    if (!comment) return
    const sendBtn = document.getElementById('lpEvReplySendBtn')
    sendBtn.disabled = true
    try {
      const formData = new FormData()
      formData.append('comment', comment)
      replyAttachments.forEach((file) => formData.append('attachments', file))

      if (replyMode === 'forward') {
        const toRecipients = document.getElementById('lpEvForwardTo').value.split(',').map((s) => s.trim()).filter(Boolean)
        if (!toRecipients.length) { alert('Add at least one recipient to forward to.'); sendBtn.disabled = false; return }
        formData.append('toRecipients', JSON.stringify(toRecipients))
        const res = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(latest.id) + '/forward', { method: 'POST', body: formData })
        const result = await res.json()
        if (!result.success) throw new Error(result.error)
      } else {
        formData.append('replyAll', replyMode === 'replyAll' ? 'true' : 'false')
        const res = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(latest.id) + '/reply', { method: 'POST', body: formData })
        const result = await res.json()
        if (!result.success) throw new Error(result.error)
      }
      replyAttachments = []
      await lilypadOpenEmailViewer(latest.id)
      if (window.lilypadRefreshEmailWidgets) window.lilypadRefreshEmailWidgets()
    } catch (err) {
      alert(err.message || 'Unable to send.')
      sendBtn.disabled = false
    }
  }

  async function sendQuickResponse (evt) {
    evt.preventDefault()
    const input = document.getElementById('lpEvQuickResponseInput')
    const content = input.value.trim()
    if (!content) return

    const latest = currentThreadMessages[currentThreadMessages.length - 1]
    const sendBtn = evt.target.querySelector('button[type="submit"]')
    sendBtn.disabled = true
    try {
      const formData = new FormData()
      formData.append('comment', escapeHtml(content).replace(/\n/g, '<br>'))
      formData.append('replyAll', 'false')
      const res = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(latest.id) + '/reply', { method: 'POST', body: formData })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      input.value = ''
      await lilypadOpenEmailViewer(latest.id)
      if (window.lilypadRefreshEmailWidgets) window.lilypadRefreshEmailWidgets()
    } catch (err) {
      alert(err.message || 'Unable to send.')
    } finally {
      sendBtn.disabled = false
    }
  }

  async function archiveCurrentEmail () {
    const latest = currentThreadMessages[currentThreadMessages.length - 1]
    try {
      const res = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(latest.id) + '/move', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destination: 'archive' })
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      getModalInstance().hide()
      if (window.lilypadRefreshEmailWidgets) window.lilypadRefreshEmailWidgets()
    } catch (err) {
      alert(err.message || 'Unable to archive.')
    }
  }

  async function deleteCurrentEmail () {
    const latest = currentThreadMessages[currentThreadMessages.length - 1]
    if (!confirm('Delete this email?')) return
    try {
      const res = await fetch('/api/v1/lilypad/email/messages/' + encodeURIComponent(latest.id), { method: 'DELETE' })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      getModalInstance().hide()
      if (window.lilypadRefreshEmailWidgets) window.lilypadRefreshEmailWidgets()
    } catch (err) {
      alert(err.message || 'Unable to delete.')
    }
  }

  window.lilypadOpenEmailViewer = lilypadOpenEmailViewer
})()
