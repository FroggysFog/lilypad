/**
 * LilyPad ERP - Global Microsoft Teams Chat Panel
 * Injected into every page the same way theme-script.js injects its
 * settings offcanvas - one script include gets every page a right-side
 * Teams chat panel without duplicating markup 29 times. Everything here
 * is wrapped in an IIFE and wired up via addEventListener (no inline
 * onclick, no top-level let/const) specifically so this can sit
 * alongside each page's own unrelated inline script without any risk of
 * a global name collision.
 *
 * Talks to the same shared, single-connection Teams integration that
 * already existed as a modal on tickets.html (/api/microsoft-teams/*) -
 * this replaces that modal rather than duplicating it.
 */
(function () {
  'use strict'

  var currentChats = []

  function escapeHtml (value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]
    })
  }

  function panelMarkup () {
    return (
      '<div class="offcanvas offcanvas-end" tabindex="-1" id="lilypadTeamsChatPanel" style="width:420px;">' +
        '<div class="offcanvas-header border-bottom">' +
          '<div>' +
            '<h5 class="offcanvas-title fw-bold d-flex align-items-center gap-2"><i class="ti ti-brand-teams text-primary"></i> Teams Chat</h5>' +
            '<span class="fs-12 text-muted" id="lpTeamsStatus">Checking connection...</span>' +
          '</div>' +
          '<div class="d-flex align-items-center gap-1">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" id="lpTeamsPopoutBtn" title="Open in its own window"><i class="ti ti-external-link"></i></button>' +
            '<button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>' +
          '</div>' +
        '</div>' +
        '<div class="offcanvas-body d-flex flex-column p-3">' +
          '<div id="lpTeamsDisconnected" class="text-center py-4">' +
            '<i class="ti ti-brand-teams fs-36 text-primary"></i>' +
            '<h6 class="fw-bold mt-2">Connect Microsoft Teams</h6>' +
            '<p class="text-muted fs-13">Connect the shared Microsoft account to view and send Teams chat messages.</p>' +
            '<a class="btn btn-primary btn-sm" href="/auth/microsoft/connect"><i class="ti ti-plug-connected me-1"></i> Connect Teams</a>' +
          '</div>' +
          '<div id="lpTeamsConnected" class="d-flex flex-column flex-fill" style="display:none; min-height:0;">' +
            '<div class="d-flex align-items-center gap-2 mb-2">' +
              '<select id="lpTeamsChatSelect" class="form-select form-select-sm"></select>' +
              '<button type="button" class="btn btn-sm btn-outline-secondary" id="lpTeamsRefreshBtn" title="Refresh chats"><i class="ti ti-refresh"></i></button>' +
            '</div>' +
            '<div id="lpTeamsMessages" class="border rounded-2 p-2 mb-2 flex-fill" style="overflow-y:auto; background:#f8fafc; min-height:0;"></div>' +
            '<form id="lpTeamsSendForm" class="input-group">' +
              '<input id="lpTeamsMessageInput" class="form-control" placeholder="Write a Teams message..." autocomplete="off" required>' +
              '<button class="btn btn-primary" type="submit"><i class="ti ti-send"></i><span class="visually-hidden">Send message</span></button>' +
            '</form>' +
            '<button type="button" class="btn btn-sm btn-link text-danger mt-2 align-self-start px-0" id="lpTeamsDisconnectBtn"><i class="ti ti-plug-x me-1"></i> Disconnect</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    )
  }

  function injectPanel () {
    if (document.getElementById('lilypadTeamsChatPanel')) return
    var wrapper = document.createElement('div')
    wrapper.innerHTML = panelMarkup()
    while (wrapper.firstChild) document.body.appendChild(wrapper.firstChild)

    document.getElementById('lpTeamsRefreshBtn').addEventListener('click', loadChats)
    document.getElementById('lpTeamsChatSelect').addEventListener('change', function (e) { loadMessages(e.target.value) })
    document.getElementById('lpTeamsSendForm').addEventListener('submit', sendMessage)
    document.getElementById('lpTeamsDisconnectBtn').addEventListener('click', disconnect)
    document.getElementById('lpTeamsPopoutBtn').addEventListener('click', popOut)
  }

  function popOut () {
    var chatId = document.getElementById('lpTeamsChatSelect').value
    var url = 'chat-popout.html' + (chatId ? '?chatId=' + encodeURIComponent(chatId) : '')
    window.open(url, 'lilypadTeamsChatPopout', 'width=420,height=640,resizable=yes,scrollbars=yes')
  }

  async function checkStatus () {
    var statusEl = document.getElementById('lpTeamsStatus')
    try {
      var res = await fetch('/api/microsoft-teams/status')
      var result = await res.json()
      if (!result.success) throw new Error(result.error || 'Unable to check Teams status')
      var connected = result.data.connected
      document.getElementById('lpTeamsDisconnected').style.display = connected ? 'none' : 'block'
      document.getElementById('lpTeamsConnected').style.display = connected ? 'flex' : 'none'
      statusEl.textContent = connected
        ? 'Connected to the shared Microsoft account'
        : (result.data.configured ? 'Connect a shared Microsoft account to continue' : 'Add Microsoft Entra environment variables to enable Teams')
      if (connected) loadChats()
    } catch (err) {
      statusEl.textContent = err.message
    }
  }

  async function loadChats () {
    var select = document.getElementById('lpTeamsChatSelect')
    try {
      var res = await fetch('/api/microsoft-teams/chats')
      var result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to load Teams chats')
      currentChats = result.data
      select.innerHTML = currentChats.map(function (chat) {
        return '<option value="' + chat.id + '">' + escapeHtml(chat.topic || chat.chatType || 'Teams conversation') + '</option>'
      }).join('')
      if (currentChats.length) await loadMessages(currentChats[0].id)
      else document.getElementById('lpTeamsMessages').innerHTML = '<p class="text-muted fs-13 mb-0">No Teams conversations found.</p>'
    } catch (err) {
      document.getElementById('lpTeamsMessages').innerHTML = '<p class="text-danger fs-13 mb-0">' + escapeHtml(err.message) + '</p>'
    }
  }

  async function loadMessages (chatId) {
    if (!chatId) return
    var container = document.getElementById('lpTeamsMessages')
    try {
      var res = await fetch('/api/microsoft-teams/chats/' + encodeURIComponent(chatId) + '/messages')
      var result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to load Teams messages')
      container.innerHTML = result.data.map(function (message) {
        var from = (message.from && message.from.user && message.from.user.displayName) || 'Teams user'
        var body = (message.body && message.body.content) || ''
        return '<div class="mb-3"><strong class="fs-12">' + escapeHtml(from) + '</strong><div class="fs-13 mt-1">' + escapeHtml(body) + '</div></div>'
      }).join('') || '<p class="text-muted fs-13 mb-0">No messages in this conversation.</p>'
      container.scrollTop = container.scrollHeight
    } catch (err) {
      container.innerHTML = '<p class="text-danger fs-13 mb-0">' + escapeHtml(err.message) + '</p>'
    }
  }

  async function sendMessage (event) {
    event.preventDefault()
    var chatId = document.getElementById('lpTeamsChatSelect').value
    var input = document.getElementById('lpTeamsMessageInput')
    var content = input.value.trim()
    if (!chatId || !content) return
    try {
      var res = await fetch('/api/microsoft-teams/chats/' + encodeURIComponent(chatId) + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
      })
      var result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to send Teams message')
      input.value = ''
      loadMessages(chatId)
    } catch (err) {
      alert(err.message)
    }
  }

  async function disconnect () {
    await fetch('/api/microsoft-teams/disconnect', { method: 'POST' })
    checkStatus()
  }

  function openPanel () {
    injectPanel()
    var el = document.getElementById('lilypadTeamsChatPanel')
    window.bootstrap.Offcanvas.getOrCreateInstance(el).show()
    checkStatus()
  }

  function injectToggle () {
    // The topbar already has an inert "chat.html" message icon on some
    // pages (that page was never built) - repurpose it instead of adding
    // a second, redundant icon next to it.
    var existingLink = document.querySelector('a[href="chat.html"]')
    if (existingLink) {
      existingLink.setAttribute('href', 'javascript:void(0);')
      existingLink.title = 'Microsoft Teams Chat'
      existingLink.addEventListener('click', function (e) { e.preventDefault(); openPanel() })
      return
    }

    // #light-dark-mode is the one topbar element every page consistently
    // has (unlike the notification bell, which only the fuller topbar
    // pages include) - anchoring off it works whether a page uses the
    // full header-item cluster or the lean one calendar.html/tasks.html
    // use.
    var darkModeBtn = document.getElementById('light-dark-mode')
    var anchorItem = darkModeBtn ? darkModeBtn.closest('.header-item') : null
    var container = anchorItem ? anchorItem.parentElement : (darkModeBtn && darkModeBtn.parentElement)
    if (!container) return

    var btnWrapper = document.createElement(anchorItem ? 'div' : 'span')
    if (anchorItem) btnWrapper.className = 'header-item'
    btnWrapper.innerHTML = '<div class="dropdown me-2"><a href="javascript:void(0);" class="btn topbar-link" id="lilypadTeamsChatToggleBtn" title="Microsoft Teams Chat"><i class="ti ti-brand-teams"></i></a></div>'
    var insertBefore = anchorItem || darkModeBtn
    container.insertBefore(btnWrapper, insertBefore)
    document.getElementById('lilypadTeamsChatToggleBtn').addEventListener('click', openPanel)
  }

  document.addEventListener('DOMContentLoaded', injectToggle)

  // The one deliberate global: lets a page's own markup (e.g. tickets.html's
  // "Teams Chat" header button) open the same panel via a plain onclick,
  // without needing its own copy of any of the logic above.
  window.lilypadOpenTeamsChat = openPanel
})()
