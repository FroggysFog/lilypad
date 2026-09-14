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
  var chatSearchQuery = ''

  // A fixed persona-color palette (same idea Teams uses) so a given
  // person's avatar color is stable across the list and every message
  // bubble, without needing to know anything about the person ahead of
  // time - just hash their name into one of these.
  var PERSONA_COLORS = ['#c239b3', '#7160e8', '#5b5fc7', '#0078d4', '#038387', '#498205', '#986f0b', '#c93b1d', '#8764b8']

  // Cheap phrase-matching (same tier choice as emailWaitingOnService.js's
  // looksLikeRequest - a regex list, not an LLM call) since chat messages
  // are far higher-frequency than email and a "does this look like
  // something to do" heuristic doesn't need much more than that. False
  // positives just mean an unused button, not a wrongly-created task, so
  // erring toward over-flagging is the right tradeoff here.
  var TASK_PATTERNS = [
    /\bcan you\b/i,
    /\bcould you\b/i,
    /\bplease (?:send|confirm|review|check|update|fix|call|email|create|make|add|remove|schedule|follow up)\b/i,
    /\bdon'?t forget\b/i,
    /\bmake sure\b/i,
    /\bneed (?:you|this) to\b/i,
    /\bby (?:tomorrow|today|eod|end of day|monday|tuesday|wednesday|thursday|friday|next week)\b/i,
    /\?\s*$/m
  ]

  function looksLikeTaskText (text) {
    return TASK_PATTERNS.some(function (p) { return p.test(text) })
  }

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

  // Microsoft Teams' own brand palette, applied only within this panel -
  // the rest of LilyPad stays on its own teal - so the chat surface reads
  // as "Teams" the way the team already recognizes it, per feedback that
  // this should look as close to real Teams as practical.
  var TEAMS_PURPLE = '#5b5fc7'

  function ensureStylesInjected () {
    if (document.getElementById('lpTeamsChatStyles')) return
    var style = document.createElement('style')
    style.id = 'lpTeamsChatStyles'
    style.textContent =
      '#lilypadTeamsChatPanel { font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; }' +
      '.lp-teams-chat-row { border-bottom: 1px solid #f0f0f0; }' +
      '.lp-teams-chat-row:hover { background: #f5f5f5; }' +
      '.lp-teams-chat-row.lp-teams-row-active { background: #ebebf9; }' +
      '.lp-teams-chat-row.lp-teams-row-active:hover { background: #ebebf9; }' +
      '.lp-teams-search-input { padding-left: 30px; border-radius: 16px; background: #f5f5f5; border: 1px solid transparent; }' +
      '.lp-teams-search-input:focus { background: #fff; border-color: ' + TEAMS_PURPLE + '; box-shadow: none; }' +
      '.lp-teams-icon-btn { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }' +
      '.lp-teams-bubble { padding: 8px 12px; border-radius: 14px; font-size: 13px; word-break: break-word; max-width: 100%; background: #f3f2f1; color: #242424; display: inline-block; }' +
      '.lp-teams-bubble-mine { background: ' + TEAMS_PURPLE + '; color: #fff; }' +
      '.lp-teams-quick-task-btn { border: none; background: #fff; color: ' + TEAMS_PURPLE + '; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.15); opacity: 0.55; flex-shrink: 0; cursor: pointer; padding: 0; transition: opacity .15s, background .15s, color .15s; }' +
      '.lp-teams-quick-task-btn:hover { opacity: 1; background: ' + TEAMS_PURPLE + '; color: #fff; }' +
      '.lp-teams-quick-task-btn.lp-teams-task-added { opacity: 1; background: #107c10; color: #fff; cursor: default; }' +
      '#lpTeamsSendForm .form-control { border-radius: 20px 0 0 20px; background: #f5f5f5; border: none; }' +
      '#lpTeamsSendForm .btn { border-radius: 0 20px 20px 0; background: ' + TEAMS_PURPLE + '; border-color: ' + TEAMS_PURPLE + '; }' +
      '.lp-teams-accent { color: ' + TEAMS_PURPLE + ' !important; }' +
      '.lp-teams-btn-accent { background: ' + TEAMS_PURPLE + ' !important; border-color: ' + TEAMS_PURPLE + ' !important; }'
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
        time: formatTime(m.createdDateTime),
        looksLikeTask: looksLikeTaskText(text)
      }
    }).filter(Boolean)
  }

  function groupMessages (normalized) {
    var groups = []
    normalized.forEach(function (m) {
      var last = groups[groups.length - 1]
      var item = { text: m.text, time: m.time, looksLikeTask: m.looksLikeTask }
      if (last && last.senderId === m.senderId) {
        last.items.push(item)
      } else {
        groups.push({ senderId: m.senderId, senderName: m.senderName, isMine: m.isMine, items: [item] })
      }
    })
    return groups
  }

  /**
   * The quick-task button sits on the outside edge of its own bubble (left
   * of a "mine" bubble, right of someone else's) - always present at low
   * opacity rather than hover-only, since a hover affordance is invisible
   * on touch. data-task-text round-trips through an escaped HTML attribute
   * (same pattern as data-chat-id elsewhere in this file) rather than a
   * closure, since groupHtml/messageItemHtml only ever produce strings.
   */
  function messageItemHtml (item, isMine) {
    var bodyHtml = escapeHtml(item.text).replace(/\n/g, '<br>')
    var bubble = '<div class="lp-teams-bubble' + (isMine ? ' lp-teams-bubble-mine' : '') + '">' + bodyHtml + '</div>'
    var taskBtn = item.looksLikeTask
      ? '<button type="button" class="lp-teams-quick-task-btn" title="Add as a task" data-task-text="' + escapeHtml(item.text) + '"><i class="ti ti-plus"></i></button>'
      : ''
    return (
      '<div class="d-flex align-items-end gap-1' + (isMine ? ' justify-content-end' : '') + ' mb-1">' +
        (isMine ? taskBtn + bubble : bubble + taskBtn) +
      '</div>'
    )
  }

  function groupHtml (group) {
    var bubbles = group.items.map(function (item, idx) {
      var isLast = idx === group.items.length - 1
      return (
        messageItemHtml(item, group.isMine) +
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

  function wireQuickTaskButtons (container) {
    container.querySelectorAll('.lp-teams-quick-task-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { addQuickTask(btn) })
    })
  }

  /**
   * Lands in the same Task Manager queue as everything else (see
   * dashboard.html's quick-add-a-task, same endpoint) rather than a
   * separate chat-only task list. Marks the button "added" permanently
   * for this render instead of reverting it, since re-adding the exact
   * same message as a second task isn't useful.
   */
  async function addQuickTask (btn) {
    if (btn.classList.contains('lp-teams-task-added')) return
    var text = btn.getAttribute('data-task-text') || ''
    if (!text) return
    btn.disabled = true
    try {
      var res = await fetch('/api/v1/lilypad/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: text.length > 200 ? text.slice(0, 200) + '...' : text,
          notes: 'From Teams chat with ' + currentChatName
        })
      })
      var result = await res.json()
      if (!result.success) throw new Error(result.error)
      btn.classList.add('lp-teams-task-added')
      btn.innerHTML = '<i class="ti ti-check"></i>'
      btn.title = 'Added to Tasks'
    } catch (err) {
      btn.disabled = false
      alert(err.message || 'Unable to add task.')
    }
  }

  function renderMessagesPane () {
    var container = document.getElementById('lpTeamsMessages')
    container.innerHTML = loadOlderButtonHtml() + renderMessagesHtml(loadedMessages)
    wireLoadOlderButton(container)
    wireQuickTaskButtons(container)
    return container
  }

  // --- Chat list --------------------------------------------------------

  function chatListItemHtml (chat) {
    var name = chat.displayName || 'Teams conversation'
    var preview = chat.lastMessagePreview ? messageBodyToText(chat.lastMessagePreview.body && chat.lastMessagePreview.body.content) : ''
    var time = chat.lastMessagePreview ? formatTime(chat.lastMessagePreview.createdDateTime) : ''
    return (
      '<div class="d-flex align-items-center gap-2 p-2 lp-teams-chat-row" data-chat-id="' + escapeHtml(chat.id) + '" style="cursor:pointer;">' +
        avatarHtml(name, 40) +
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
    var filtered = chatSearchQuery
      ? currentChats.filter(function (c) { return (c.displayName || '').toLowerCase().indexOf(chatSearchQuery) !== -1 })
      : currentChats

    if (!filtered.length) {
      container.innerHTML = '<p class="text-muted fs-13 mb-0 text-center p-3">' + (currentChats.length ? 'No matching conversations.' : 'No Teams conversations found.') + '</p>'
      return
    }
    container.innerHTML = filtered.map(chatListItemHtml).join('')
    container.querySelectorAll('.lp-teams-chat-row').forEach(function (row) {
      if (row.dataset.chatId === currentChatId) row.classList.add('lp-teams-row-active')
      row.addEventListener('click', function () { openConversation(row.dataset.chatId) })
    })
  }

  /**
   * Two-pane layout (list always visible on the left, active conversation
   * on the right) instead of the old single-column view that swapped
   * between a list screen and a conversation screen - matches how the
   * real Teams desktop client is actually laid out.
   */
  function updateConversationHeader (chatName) {
    var header = document.getElementById('lpTeamsConversationHeader')
    header.innerHTML = chatName
      ? '<div class="d-flex align-items-center gap-2">' + avatarHtml(chatName, 32) + '<strong class="fs-13">' + escapeHtml(chatName) + '</strong></div>'
      : '<span class="fs-13 text-muted">Select a conversation to view messages.</span>'
  }

  async function openConversation (chatId) {
    var chat = currentChats.filter(function (c) { return c.id === chatId })[0]
    currentChatName = (chat && chat.displayName) || 'Teams conversation'
    updateConversationHeader(currentChatName)
    renderChatList()
    await loadMessages(chatId)
  }

  function panelMarkup () {
    return (
      '<div class="offcanvas offcanvas-end" tabindex="-1" id="lilypadTeamsChatPanel" style="width:700px;">' +
        '<div class="offcanvas-header border-bottom py-2">' +
          '<h6 class="offcanvas-title fw-bold mb-0 d-flex align-items-center gap-2"><i class="ti ti-brand-teams lp-teams-accent"></i> Chat <span class="fs-11 text-muted fw-normal ms-1" id="lpTeamsStatus">Checking connection...</span></h6>' +
          '<div class="d-flex align-items-center gap-1">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" id="lpTeamsPopoutBtn" title="Open in its own window"><i class="ti ti-external-link"></i></button>' +
            '<button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>' +
          '</div>' +
        '</div>' +
        '<div class="offcanvas-body d-flex flex-column p-0" style="min-height:0;">' +
          '<div id="lpTeamsDisconnected" class="text-center py-4 px-3">' +
            '<i class="ti ti-brand-teams fs-36 lp-teams-accent"></i>' +
            '<h6 class="fw-bold mt-2">Connect Microsoft 365</h6>' +
            '<p class="text-muted fs-13">Connect your Microsoft 365 account to view and send Teams chat messages - the same connection also powers your Calendar and Email.</p>' +
            '<a class="btn btn-primary btn-sm lp-teams-btn-accent" href="/auth/microsoft-calendar/connect"><i class="ti ti-plug-connected me-1"></i> Connect Microsoft 365</a>' +
          '</div>' +

          '<div id="lpTeamsConnectedArea" class="d-flex flex-fill" style="display:none; min-height:0;">' +
            '<div class="d-flex flex-column border-end" style="width:280px; flex-shrink:0; min-height:0;">' +
              '<div class="d-flex align-items-center gap-2 px-2 pt-2 pb-1">' +
                '<div class="flex-fill position-relative">' +
                  '<i class="ti ti-search" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#a19f9d; font-size:14px;"></i>' +
                  '<input type="text" class="form-control form-control-sm lp-teams-search-input" id="lpTeamsSearchInput" placeholder="Search chats">' +
                '</div>' +
                '<button type="button" class="btn btn-sm btn-light lp-teams-icon-btn" id="lpTeamsRefreshBtn" title="Refresh"><i class="ti ti-refresh"></i></button>' +
              '</div>' +
              '<div id="lpTeamsChatList" class="flex-fill px-1" style="overflow-y:auto;"></div>' +
              '<div class="p-2 border-top text-center">' +
                '<span class="fs-11 text-muted">Manage this connection from Calendar or Email settings.</span>' +
              '</div>' +
            '</div>' +
            '<div class="d-flex flex-column flex-fill" style="min-width:0; min-height:0;">' +
              '<div id="lpTeamsConversationHeader" class="p-2 px-3 border-bottom" style="min-height:52px; display:flex; align-items:center;">' +
                '<span class="fs-13 text-muted">Select a conversation to view messages.</span>' +
              '</div>' +
              '<div id="lpTeamsMessages" class="flex-fill p-3" style="overflow-y:auto; min-height:0;"></div>' +
              '<div class="p-2 border-top">' +
                '<form id="lpTeamsSendForm" class="input-group">' +
                  '<input id="lpTeamsMessageInput" class="form-control" placeholder="Type a message..." autocomplete="off" required>' +
                  '<button class="btn btn-primary" type="submit"><i class="ti ti-send"></i><span class="visually-hidden">Send message</span></button>' +
                '</form>' +
              '</div>' +
            '</div>' +
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
    document.getElementById('lpTeamsSendForm').addEventListener('submit', sendMessage)
    document.getElementById('lpTeamsPopoutBtn').addEventListener('click', popOut)
    document.getElementById('lpTeamsSearchInput').addEventListener('input', function (e) {
      chatSearchQuery = e.target.value.trim().toLowerCase()
      renderChatList()
    })
  }

  function popOut () {
    var url = 'chat-popout.html' + (currentChatId ? '?chatId=' + encodeURIComponent(currentChatId) : '')
    var popup = window.open(url, 'lilypadTeamsChatPopout', 'width=860,height=640,resizable=yes,scrollbars=yes')
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
      document.getElementById('lpTeamsConnectedArea').style.display = connected ? 'flex' : 'none'
      if (connected) {
        statusEl.textContent = 'Connected'
        loadChats()
      } else {
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
