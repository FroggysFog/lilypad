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
 * Talks to /api/microsoft-teams/* (server-side backed by each user's
 * own per-user Microsoft 365 connection - see microsoftTeams.js and
 * microsoftCalendarService.js - so everyone sees their own chats, not
 * one shared identity). Originally replaced a modal on tickets.html.
 * Laid out as a list-of-conversations view that drills into a
 * conversation view (with a back button), the same shape real Teams
 * uses in a narrow width, rather than cramming a two-column layout
 * into a 420px panel.
 */
(function () {
  'use strict'

  var currentChats = []
  var meId = null
  var currentChatId = null
  var currentChatName = ''
  var currentNextLink = null
  var loadedMessages = []

  // A fixed persona-color palette (same idea Teams uses) so a given
  // person's avatar color is stable across the list and every message
  // bubble, without needing to know anything about the person ahead of
  // time - just hash their name into one of these.
  var PERSONA_COLORS = ['#c239b3', '#7160e8', '#5b5fc7', '#0078d4', '#038387', '#498205', '#986f0b', '#c93b1d', '#8764b8']

  function escapeHtml (value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]
    })
  }

  /**
   * Graph message bodies are HTML ('<p>hi &nbsp;there</p>') - Teams
   * itself renders that; a plain chat bubble shouldn't. Converts block
   * breaks to newlines, strips the remaining tags, then decodes entities
   * via a detached <textarea> (its content model is RCDATA, so this
   * decodes &nbsp;/&amp;/etc. without ever parsing or executing any
   * markup) - the result is later passed through escapeHtml() before it
   * ever reaches real page HTML, so nothing here renders untrusted markup.
   */
  function messageBodyToText (html) {
    var withBreaks = String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
    var stripped = withBreaks.replace(/<[^>]+>/g, '')
    var ta = document.createElement('textarea')
    ta.innerHTML = stripped
    return ta.value.trim()
  }

  function initialsFor (name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0] }).join('').toUpperCase()
  }

  function colorForName (name) {
    var str = String(name || '')
    var hash = 0
    for (var i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0
    return PERSONA_COLORS[Math.abs(hash) % PERSONA_COLORS.length]
  }

  function avatarHtml (name, size) {
    var px = size || 32
    return '<div class="rounded-circle text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:' + px + 'px; height:' + px + 'px; font-size:' + Math.round(px * 0.4) + 'px; font-weight:600; background:' + colorForName(name) + ';">' + escapeHtml(initialsFor(name)) + '</div>'
  }

  function formatTime (iso) {
    return iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
  }

  function ensureStylesInjected () {
    if (document.getElementById('lpTeamsChatStyles')) return
    var style = document.createElement('style')
    style.id = 'lpTeamsChatStyles'
    style.textContent = '.lp-teams-chat-row:hover { background: #f3f2f1; }'
    document.head.appendChild(style)
  }

  // --- Message normalizing/grouping (consecutive messages from the same
  // sender collapse under one avatar/name, same as Teams) ---------------

  function normalizeMessages (messages) {
    return messages.map(function (m) {
      if (m.messageType && m.messageType !== 'message') return null
      var text = messageBodyToText(m.body && m.body.content)
      if (!text) return null
      var senderId = (m.from && m.from.user && m.from.user.id) || (m.from && m.from.application && m.from.application.id) || 'unknown'
      var senderName = (m.from && m.from.user && m.from.user.displayName) || (m.from && m.from.application && m.from.application.displayName) || 'Teams user'
      return {
        isMine: Boolean(meId) && senderId === meId,
        senderId: senderId,
        senderName: senderName,
        text: text,
        time: formatTime(m.createdDateTime)
      }
    }).filter(Boolean)
  }

  function groupMessages (normalized) {
    var groups = []
    normalized.forEach(function (m) {
      var last = groups[groups.length - 1]
      if (last && last.senderId === m.senderId) {
        last.items.push({ text: m.text, time: m.time })
      } else {
        groups.push({ senderId: m.senderId, senderName: m.senderName, isMine: m.isMine, items: [{ text: m.text, time: m.time }] })
      }
    })
    return groups
  }

  function groupHtml (group) {
    var bg = group.isMine ? 'rgba(var(--bs-primary-rgb), 0.14)' : '#f3f2f1'
    var bubbles = group.items.map(function (item, idx) {
      var bodyHtml = escapeHtml(item.text).replace(/\n/g, '<br>')
      var isLast = idx === group.items.length - 1
      return (
        '<div class="p-2 px-3 rounded-3 mb-1 d-inline-block" style="background:' + bg + '; font-size:13px; word-break:break-word; max-width:100%;">' + bodyHtml + '</div>' +
        (isLast ? '<div class="fs-10 text-muted' + (group.isMine ? ' text-end' : '') + '">' + escapeHtml(item.time) + '</div>' : '')
      )
    }).join('')

    if (group.isMine) {
      return '<div class="d-flex flex-column align-items-end mb-2">' + bubbles + '</div>'
    }

    return (
      '<div class="d-flex align-items-start gap-2 mb-2">' +
        avatarHtml(group.senderName, 28) +
        '<div class="d-flex flex-column align-items-start" style="max-width:78%; min-width:0;">' +
          '<div class="fs-11 fw-semibold text-dark mb-1">' + escapeHtml(group.senderName) + '</div>' +
          bubbles +
        '</div>' +
      '</div>'
    )
  }

  function renderMessagesHtml (messages) {
    var groups = groupMessages(normalizeMessages(messages))
    if (!groups.length) return '<p class="text-muted fs-13 mb-0 text-center">No messages in this conversation.</p>'
    return groups.map(groupHtml).join('')
  }

  function loadOlderButtonHtml () {
    if (!currentNextLink) return ''
    return '<div class="text-center mb-2"><button type="button" class="btn btn-sm btn-outline-secondary" id="lpTeamsLoadOlderBtn">Load older messages</button></div>'
  }

  function wireLoadOlderButton (container) {
    var btn = container.querySelector('#lpTeamsLoadOlderBtn')
    if (btn) btn.addEventListener('click', loadOlderMessages)
  }

  function renderMessagesPane () {
    var container = document.getElementById('lpTeamsMessages')
    container.innerHTML = loadOlderButtonHtml() + renderMessagesHtml(loadedMessages)
    wireLoadOlderButton(container)
    return container
  }

  // --- Chat list --------------------------------------------------------

  function chatListItemHtml (chat) {
    var name = chat.displayName || 'Teams conversation'
    var preview = chat.lastMessagePreview ? messageBodyToText(chat.lastMessagePreview.body && chat.lastMessagePreview.body.content) : ''
    var time = chat.lastMessagePreview ? formatTime(chat.lastMessagePreview.createdDateTime) : ''
    return (
      '<div class="d-flex align-items-center gap-2 p-2 lp-teams-chat-row" data-chat-id="' + escapeHtml(chat.id) + '" style="cursor:pointer; border-radius:8px;">' +
        avatarHtml(name, 38) +
        '<div class="flex-fill" style="min-width:0;">' +
          '<div class="d-flex align-items-center justify-content-between">' +
            '<span class="fs-13 fw-semibold text-dark text-truncate">' + escapeHtml(name) + '</span>' +
            (time ? '<span class="fs-10 text-muted flex-shrink-0 ms-1">' + escapeHtml(time) + '</span>' : '') +
          '</div>' +
          (preview ? '<div class="fs-12 text-muted text-truncate">' + escapeHtml(preview) + '</div>' : '') +
        '</div>' +
      '</div>'
    )
  }

  function renderChatList () {
    var container = document.getElementById('lpTeamsChatList')
    if (!currentChats.length) {
      container.innerHTML = '<p class="text-muted fs-13 mb-0 text-center p-3">No Teams conversations found.</p>'
      return
    }
    container.innerHTML = currentChats.map(chatListItemHtml).join('')
    container.querySelectorAll('.lp-teams-chat-row').forEach(function (row) {
      row.addEventListener('click', function () { openConversation(row.dataset.chatId) })
    })
  }

  // --- View switching (list <-> conversation, mirrors how Teams itself
  // behaves at this width instead of cramming two columns in) ----------

  function showListView () {
    currentChatId = null
    document.getElementById('lpTeamsListView').style.display = 'flex'
    document.getElementById('lpTeamsConversationView').style.display = 'none'
    document.getElementById('lpTeamsHeaderTitle').textContent = 'Chat'
    document.getElementById('lpTeamsBackBtn').style.display = 'none'
    document.getElementById('lpTeamsPopoutBtn').style.display = 'none'
  }

  function showConversationView (chatName) {
    document.getElementById('lpTeamsListView').style.display = 'none'
    document.getElementById('lpTeamsConversationView').style.display = 'flex'
    document.getElementById('lpTeamsHeaderTitle').textContent = chatName
    document.getElementById('lpTeamsBackBtn').style.display = ''
    document.getElementById('lpTeamsPopoutBtn').style.display = ''
  }

  async function openConversation (chatId) {
    var chat = currentChats.filter(function (c) { return c.id === chatId })[0]
    currentChatName = (chat && chat.displayName) || 'Teams conversation'
    showConversationView(currentChatName)
    await loadMessages(chatId)
  }

  function panelMarkup () {
    return (
      '<div class="offcanvas offcanvas-end" tabindex="-1" id="lilypadTeamsChatPanel" style="width:420px;">' +
        '<div class="offcanvas-header border-bottom py-2">' +
          '<div class="d-flex align-items-center gap-2 flex-fill" style="min-width:0;">' +
            '<button type="button" class="btn btn-sm btn-light" id="lpTeamsBackBtn" style="display:none;" title="Back to chats"><i class="ti ti-arrow-left"></i></button>' +
            '<div>' +
              '<h6 class="offcanvas-title fw-bold mb-0 d-flex align-items-center gap-2"><i class="ti ti-brand-teams text-primary"></i> <span id="lpTeamsHeaderTitle">Chat</span></h6>' +
              '<span class="fs-11 text-muted" id="lpTeamsStatus">Checking connection...</span>' +
            '</div>' +
          '</div>' +
          '<div class="d-flex align-items-center gap-1">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" id="lpTeamsPopoutBtn" style="display:none;" title="Open in its own window"><i class="ti ti-external-link"></i></button>' +
            '<button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>' +
          '</div>' +
        '</div>' +
        '<div class="offcanvas-body d-flex flex-column p-0" style="min-height:0;">' +
          '<div id="lpTeamsDisconnected" class="text-center py-4 px-3">' +
            '<i class="ti ti-brand-teams fs-36 text-primary"></i>' +
            '<h6 class="fw-bold mt-2">Connect Microsoft 365</h6>' +
            '<p class="text-muted fs-13">Connect your Microsoft 365 account to view and send Teams chat messages - the same connection also powers your Calendar and Email.</p>' +
            '<a class="btn btn-primary btn-sm" href="/auth/microsoft-calendar/connect"><i class="ti ti-plug-connected me-1"></i> Connect Microsoft 365</a>' +
          '</div>' +

          '<div id="lpTeamsListView" class="flex-fill d-flex flex-column" style="display:none; min-height:0;">' +
            '<div class="px-2 pt-2">' +
              '<button type="button" class="btn btn-sm btn-light w-100 mb-1" id="lpTeamsRefreshBtn"><i class="ti ti-refresh me-1"></i> Refresh</button>' +
            '</div>' +
            '<div id="lpTeamsChatList" class="flex-fill px-1" style="overflow-y:auto;"></div>' +
            '<div class="p-2 border-top text-center">' +
              '<span class="fs-11 text-muted">Manage this connection from Calendar or Email settings.</span>' +
            '</div>' +
          '</div>' +

          '<div id="lpTeamsConversationView" class="flex-fill d-flex flex-column p-3" style="display:none; min-height:0;">' +
            '<div id="lpTeamsMessages" class="flex-fill mb-2" style="overflow-y:auto; min-height:0;"></div>' +
            '<form id="lpTeamsSendForm" class="input-group">' +
              '<input id="lpTeamsMessageInput" class="form-control" placeholder="Type a message..." autocomplete="off" required>' +
              '<button class="btn btn-primary" type="submit"><i class="ti ti-send"></i><span class="visually-hidden">Send message</span></button>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>'
    )
  }

  function injectPanel () {
    if (document.getElementById('lilypadTeamsChatPanel')) return
    ensureStylesInjected()
    var wrapper = document.createElement('div')
    wrapper.innerHTML = panelMarkup()
    while (wrapper.firstChild) document.body.appendChild(wrapper.firstChild)

    document.getElementById('lpTeamsRefreshBtn').addEventListener('click', loadChats)
    document.getElementById('lpTeamsBackBtn').addEventListener('click', showListView)
    document.getElementById('lpTeamsSendForm').addEventListener('submit', sendMessage)
    document.getElementById('lpTeamsPopoutBtn').addEventListener('click', popOut)
  }

  function popOut () {
    var url = 'chat-popout.html' + (currentChatId ? '?chatId=' + encodeURIComponent(currentChatId) : '')
    var popup = window.open(url, 'lilypadTeamsChatPopout', 'width=420,height=640,resizable=yes,scrollbars=yes')
    // Popping out moves the conversation into its own window - closing
    // the embedded panel avoids showing (and having to keep in sync) the
    // same conversation in two places at once.
    if (popup) {
      var el = document.getElementById('lilypadTeamsChatPanel')
      window.bootstrap.Offcanvas.getOrCreateInstance(el).hide()
    }
  }

  async function checkStatus () {
    var statusEl = document.getElementById('lpTeamsStatus')
    try {
      var res = await fetch('/api/microsoft-teams/status')
      var result = await res.json()
      if (!result.success) throw new Error(result.error || 'Unable to check Teams status')
      var connected = result.data.connected
      meId = result.data.meId || null
      document.getElementById('lpTeamsDisconnected').style.display = connected ? 'none' : 'block'
      if (connected) {
        showListView()
        statusEl.textContent = 'Connected'
        loadChats()
      } else {
        document.getElementById('lpTeamsListView').style.display = 'none'
        document.getElementById('lpTeamsConversationView').style.display = 'none'
        statusEl.textContent = result.data.configured ? 'Not connected' : 'Not configured'
      }
    } catch (err) {
      statusEl.textContent = err.message
    }
  }

  async function loadChats () {
    try {
      var res = await fetch('/api/microsoft-teams/chats')
      var result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to load Teams chats')
      currentChats = result.data
      renderChatList()
    } catch (err) {
      document.getElementById('lpTeamsChatList').innerHTML = '<p class="text-danger fs-13 mb-0 p-2">' + escapeHtml(err.message) + '</p>'
    }
  }

  async function loadMessages (chatId) {
    if (!chatId) return
    currentChatId = chatId
    currentNextLink = null
    loadedMessages = []
    var container = document.getElementById('lpTeamsMessages')
    container.innerHTML = '<p class="text-muted fs-13 text-center">Loading...</p>'
    try {
      var res = await fetch('/api/microsoft-teams/chats/' + encodeURIComponent(chatId) + '/messages')
      var result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to load Teams messages')
      currentNextLink = result.data.nextLink
      loadedMessages = result.data.messages
      renderMessagesPane()
      container.scrollTop = container.scrollHeight
    } catch (err) {
      container.innerHTML = '<p class="text-danger fs-13 mb-0">' + escapeHtml(err.message) + '</p>'
    }
  }

  async function loadOlderMessages () {
    if (!currentChatId || !currentNextLink) return
    var container = document.getElementById('lpTeamsMessages')
    var btn = document.getElementById('lpTeamsLoadOlderBtn')
    if (btn) { btn.disabled = true; btn.textContent = 'Loading...' }
    try {
      var params = new URLSearchParams({ nextLink: currentNextLink })
      var res = await fetch('/api/microsoft-teams/chats/' + encodeURIComponent(currentChatId) + '/messages?' + params.toString())
      var result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to load older messages')
      currentNextLink = result.data.nextLink
      loadedMessages = result.data.messages.concat(loadedMessages)
      var previousHeight = container.scrollHeight
      renderMessagesPane()
      // Keep the view anchored on what was already visible instead of
      // jumping to the top of the newly-prepended history.
      container.scrollTop = container.scrollHeight - previousHeight
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Load older messages' }
      alert(err.message)
    }
  }

  async function sendMessage (event) {
    event.preventDefault()
    var input = document.getElementById('lpTeamsMessageInput')
    var content = input.value.trim()
    if (!currentChatId || !content) return
    try {
      var res = await fetch('/api/microsoft-teams/chats/' + encodeURIComponent(currentChatId) + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
      })
      var result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || 'Unable to send Teams message')
      input.value = ''
      loadMessages(currentChatId)
    } catch (err) {
      alert(err.message)
    }
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
  // and lets a popped-out chat window (chat-popout.html) call back into
  // its opener to reopen this panel when the popup window closes.
  window.lilypadOpenTeamsChat = openPanel
})()
