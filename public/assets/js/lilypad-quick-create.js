/**
 * LilyPad ERP - Global Quick Create
 * Replaces the static "New Ticket" topbar button (identical, duplicated
 * across every page's <header>) with a single "New" dropdown offering
 * quick pop-up entry for the four things people create constantly:
 * tickets, tasks, leads, and a fast email. Each opens a small modal
 * that posts straight to the existing create endpoints - no page
 * navigation needed for a quick capture.
 *
 * Injected the same way lilypad-nav.js's top tab row is: found and
 * appended at script-load time, no per-page markup required beyond the
 * existing <script> include.
 */
(function () {
  'use strict'

  function escapeHtml (value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]
    })
  }

  // Plain-text quick-compose body -> minimal safe HTML for the Graph
  // send call (which expects bodyHtml) - escape first, then turn
  // newlines into <br> so line breaks the user typed actually show up.
  function textToSafeHtml (value) {
    return escapeHtml(value).replace(/\n/g, '<br>')
  }

  function notify (message) {
    if (window.LilypadNotifications && typeof window.LilypadNotifications.addNotification === 'function') {
      window.LilypadNotifications.addNotification({ title: 'Created', message: message })
    }
  }

  const MODALS_HTML = `
    <div class="modal fade" id="qcTicketModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold"><i class="ti ti-ticket me-1 text-primary"></i>New Ticket</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="qcTicketError" class="alert alert-danger fs-13 py-2 px-3 mb-3" style="display:none;"></div>
            <div class="mb-3">
              <label class="form-label fs-13 fw-semibold">Title</label>
              <input type="text" id="qcTicketTitle" class="form-control" placeholder="Brief summary">
            </div>
            <div class="mb-3">
              <label class="form-label fs-13 fw-semibold">Description</label>
              <textarea id="qcTicketDescription" class="form-control" rows="3" placeholder="What's going on?"></textarea>
            </div>
            <div class="mb-0">
              <label class="form-label fs-13 fw-semibold">Priority</label>
              <select id="qcTicketPriority" class="form-select">
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="qcTicketSaveBtn">Create Ticket</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="qcTaskModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold"><i class="ti ti-list-check me-1 text-primary"></i>New Task</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="qcTaskError" class="alert alert-danger fs-13 py-2 px-3 mb-3" style="display:none;"></div>
            <div class="mb-3">
              <label class="form-label fs-13 fw-semibold">Title</label>
              <input type="text" id="qcTaskTitle" class="form-control" placeholder="What needs doing?">
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label fs-13 fw-semibold">Due Date</label>
                <input type="date" id="qcTaskDueDate" class="form-control">
              </div>
              <div class="col-6">
                <label class="form-label fs-13 fw-semibold">Priority</label>
                <select id="qcTaskPriority" class="form-select">
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div class="mb-0">
              <label class="form-label fs-13 fw-semibold">Notes</label>
              <textarea id="qcTaskNotes" class="form-control" rows="2" placeholder="Optional details"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="qcTaskSaveBtn">Create Task</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="qcLeadModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold"><i class="ti ti-user-plus me-1 text-primary"></i>New Lead</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="qcLeadError" class="alert alert-danger fs-13 py-2 px-3 mb-3" style="display:none;"></div>
            <div class="mb-3">
              <label class="form-label fs-13 fw-semibold">Name</label>
              <input type="text" id="qcLeadName" class="form-control" placeholder="Full name">
            </div>
            <div class="row g-2 mb-0">
              <div class="col-6">
                <label class="form-label fs-13 fw-semibold">Company</label>
                <input type="text" id="qcLeadCompany" class="form-control">
              </div>
              <div class="col-6">
                <label class="form-label fs-13 fw-semibold">Phone</label>
                <input type="text" id="qcLeadPhone" class="form-control">
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label fs-13 fw-semibold">Email</label>
              <input type="email" id="qcLeadEmail" class="form-control">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="qcLeadSaveBtn">Create Lead</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="qcEmailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold"><i class="ti ti-mail me-1 text-primary"></i>New Email</h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="qcEmailError" class="alert alert-danger fs-13 py-2 px-3 mb-3" style="display:none;"></div>
            <div class="mb-3">
              <label class="form-label fs-13 fw-semibold">To</label>
              <input type="text" id="qcEmailTo" class="form-control" placeholder="name@company.com, another@company.com">
            </div>
            <div class="mb-3">
              <label class="form-label fs-13 fw-semibold">Subject</label>
              <input type="text" id="qcEmailSubject" class="form-control">
            </div>
            <div class="mb-0">
              <label class="form-label fs-13 fw-semibold">Message</label>
              <textarea id="qcEmailBody" class="form-control" rows="4"></textarea>
            </div>
            <p class="fs-12 text-muted mt-2 mb-0">For attachments, formatting, or CC, use the full compose window in Email.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="qcEmailSaveBtn"><i class="ti ti-send me-1"></i>Send</button>
          </div>
        </div>
      </div>
    </div>
  `

  const DROPDOWN_HTML = `
    <div class="dropdown">
      <button class="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 py-2 text-white shadow-sm fw-semibold rounded-pill dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 13px;">
        <i class="ti ti-plus fs-16"></i><span>New</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item d-flex align-items-center gap-2" href="javascript:void(0);" data-quick-create="ticket"><i class="ti ti-ticket text-primary"></i> New Ticket</a></li>
        <li><a class="dropdown-item d-flex align-items-center gap-2" href="javascript:void(0);" data-quick-create="task"><i class="ti ti-list-check text-primary"></i> New Task</a></li>
        <li><a class="dropdown-item d-flex align-items-center gap-2" href="javascript:void(0);" data-quick-create="lead"><i class="ti ti-user-plus text-primary"></i> New Lead</a></li>
        <li><a class="dropdown-item d-flex align-items-center gap-2" href="javascript:void(0);" data-quick-create="email"><i class="ti ti-mail text-primary"></i> New Email</a></li>
      </ul>
    </div>
  `

  function showModalError (elId, message) {
    const el = document.getElementById(elId)
    if (!el) return
    el.textContent = message
    el.style.display = message ? '' : 'none'
  }

  function hideModal (modalId) {
    const el = document.getElementById(modalId)
    const inst = el && window.bootstrap && bootstrap.Modal.getInstance(el)
    if (inst) inst.hide()
  }

  function openModal (modalId) {
    const el = document.getElementById(modalId)
    if (!el || !window.bootstrap) return
    bootstrap.Modal.getOrCreateInstance(el).show()
  }

  async function submitJson (url, body, errElId) {
    showModalError(errElId, '')
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const result = await res.json()
    if (!result.success) throw new Error(result.error || 'Something went wrong.')
    return result.data
  }

  function wireTicketModal () {
    const btn = document.getElementById('qcTicketSaveBtn')
    btn.addEventListener('click', async () => {
      const title = document.getElementById('qcTicketTitle').value.trim()
      const description = document.getElementById('qcTicketDescription').value.trim()
      const priority = document.getElementById('qcTicketPriority').value
      if (!title || !description) {
        showModalError('qcTicketError', 'Title and description are both required.')
        return
      }
      btn.disabled = true
      try {
        await submitJson('/api/v1/lilypad/tickets', { title, description, priority }, 'qcTicketError')
        document.getElementById('qcTicketTitle').value = ''
        document.getElementById('qcTicketDescription').value = ''
        hideModal('qcTicketModal')
        notify('Ticket "' + title + '" created.')
      } catch (err) {
        showModalError('qcTicketError', err.message)
      } finally {
        btn.disabled = false
      }
    })
  }

  function wireTaskModal () {
    const btn = document.getElementById('qcTaskSaveBtn')
    btn.addEventListener('click', async () => {
      const title = document.getElementById('qcTaskTitle').value.trim()
      const dueDate = document.getElementById('qcTaskDueDate').value
      const priority = document.getElementById('qcTaskPriority').value
      const notes = document.getElementById('qcTaskNotes').value.trim()
      if (!title) {
        showModalError('qcTaskError', 'Title is required.')
        return
      }
      btn.disabled = true
      try {
        await submitJson('/api/v1/lilypad/tasks', { title, notes, dueDate: dueDate || null, priority }, 'qcTaskError')
        document.getElementById('qcTaskTitle').value = ''
        document.getElementById('qcTaskNotes').value = ''
        document.getElementById('qcTaskDueDate').value = ''
        hideModal('qcTaskModal')
        notify('Task "' + title + '" created.')
      } catch (err) {
        showModalError('qcTaskError', err.message)
      } finally {
        btn.disabled = false
      }
    })
  }

  function wireLeadModal () {
    const btn = document.getElementById('qcLeadSaveBtn')
    btn.addEventListener('click', async () => {
      const name = document.getElementById('qcLeadName').value.trim()
      const company = document.getElementById('qcLeadCompany').value.trim()
      const phone = document.getElementById('qcLeadPhone').value.trim()
      const email = document.getElementById('qcLeadEmail').value.trim()
      if (!name) {
        showModalError('qcLeadError', 'Name is required.')
        return
      }
      btn.disabled = true
      try {
        await submitJson('/api/v1/lilypad/customers', { name, company, phone, email }, 'qcLeadError')
        document.getElementById('qcLeadName').value = ''
        document.getElementById('qcLeadCompany').value = ''
        document.getElementById('qcLeadPhone').value = ''
        document.getElementById('qcLeadEmail').value = ''
        hideModal('qcLeadModal')
        notify('Lead "' + name + '" created.')
      } catch (err) {
        showModalError('qcLeadError', err.message)
      } finally {
        btn.disabled = false
      }
    })
  }

  function wireEmailModal () {
    document.getElementById('qcEmailSaveBtn').addEventListener('click', async () => {
      const btn = document.getElementById('qcEmailSaveBtn')
      const toRecipients = document.getElementById('qcEmailTo').value.split(',').map((s) => s.trim()).filter(Boolean)
      const subject = document.getElementById('qcEmailSubject').value.trim()
      const bodyText = document.getElementById('qcEmailBody').value
      if (!toRecipients.length) {
        showModalError('qcEmailError', 'Add at least one recipient.')
        return
      }
      btn.disabled = true
      try {
        const draft = await submitJson('/api/v1/lilypad/email/drafts', {
          subject,
          bodyHtml: textToSafeHtml(bodyText),
          toRecipients,
          ccRecipients: []
        }, 'qcEmailError')
        const res = await fetch('/api/v1/lilypad/email/drafts/' + encodeURIComponent(draft.id) + '/send', { method: 'POST' })
        const result = await res.json()
        if (!result.success) throw new Error(result.error || 'Unable to send.')

        document.getElementById('qcEmailTo').value = ''
        document.getElementById('qcEmailSubject').value = ''
        document.getElementById('qcEmailBody').value = ''
        hideModal('qcEmailModal')
        notify('Email sent to ' + toRecipients.join(', ') + '.')
      } catch (err) {
        showModalError('qcEmailError', err.message)
      } finally {
        btn.disabled = false
      }
    })
  }

  function injectQuickCreate () {
    const header = document.querySelector('header.navbar-header')
    if (!header) return

    // The static "New Ticket" link is identical, duplicated boilerplate
    // across every page's header - find it precisely scoped to the
    // topbar (not any page-content button that happens to share the
    // same href, e.g. dashboard.html's own New Ticket shortcut).
    const oldLink = header.querySelector('a[href="tickets.html?action=new"]')
    const container = oldLink && oldLink.closest('.header-item')
    if (!container) return

    container.innerHTML = DROPDOWN_HTML

    const modalsWrapper = document.createElement('div')
    modalsWrapper.innerHTML = MODALS_HTML
    document.body.appendChild(modalsWrapper)

    wireTicketModal()
    wireTaskModal()
    wireLeadModal()
    wireEmailModal()

    container.querySelectorAll('[data-quick-create]').forEach((item) => {
      item.addEventListener('click', () => {
        const kind = item.getAttribute('data-quick-create')
        openModal('qc' + kind.charAt(0).toUpperCase() + kind.slice(1) + 'Modal')
      })
    })
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectQuickCreate)
    } else {
      injectQuickCreate()
    }
  }
})()
