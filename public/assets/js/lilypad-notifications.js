/**
 * LilyPad ERP - Global Real-Time Notification & Dashboard Ticket Feed System
 */

(function () {
    "use strict";

    const STORAGE_NOTIF_KEY = "lilypad_notifications_v2";
    const STORAGE_TICKETS_KEY = "lilypad_tickets_v2";

    // Clean initial production arrays (no test tickets or dummy notifications)
    const defaultTickets = [];
    const defaultNotifications = [];

    const LilypadNotifications = {
        currentFilter: "mine",

        getTickets: function () {
            try {
                const data = localStorage.getItem(STORAGE_TICKETS_KEY);
                if (!data) {
                    localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(defaultTickets));
                    return defaultTickets;
                }
                return JSON.parse(data);
            } catch (e) {
                return defaultTickets;
            }
        },

        saveTickets: function (list) {
            try {
                localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(list));
                this.renderDashboardWidget();
            } catch (e) {
                console.error("Error saving tickets:", e);
            }
        },

        getNotifications: function () {
            try {
                const data = localStorage.getItem(STORAGE_NOTIF_KEY);
                if (!data) {
                    localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(defaultNotifications));
                    return defaultNotifications;
                }
                return JSON.parse(data);
            } catch (e) {
                return defaultNotifications;
            }
        },

        saveNotifications: function (list) {
            try {
                localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(list));
                this.renderBell();
            } catch (e) {
                console.error("Error saving notifications:", e);
            }
        },

        addNotification: function (notif) {
            const list = this.getNotifications();
            const newNotif = {
                id: "notif_" + Date.now(),
                title: notif.title || "Ticket Notification",
                description: notif.description || "",
                ticketId: notif.ticketId || "10",
                timestamp: Date.now(),
                read: false,
                type: notif.type || "created"
            };
            list.unshift(newNotif);
            this.saveNotifications(list);
            this.showToast(newNotif);
            this.animateBell();
            return newNotif;
        },

        markAsRead: function (id, e) {
            if (e) e.stopPropagation();
            const list = this.getNotifications();
            const item = list.find(n => n.id === id);
            if (item) {
                item.read = true;
                this.saveNotifications(list);
            }
        },

        markAllAsRead: function (e) {
            if (e) e.preventDefault();
            const list = this.getNotifications();
            list.forEach(n => n.read = true);
            this.saveNotifications(list);
        },

        clearNotification: function (id, e) {
            if (e) e.stopPropagation();
            let list = this.getNotifications();
            list = list.filter(n => n.id !== id);
            this.saveNotifications(list);
        },

        navigateToTicket: function (ticketId, notifId) {
            if (notifId) {
                this.markAsRead(notifId);
            }

            if (window.location.pathname.includes("tickets")) {
                if (window.openTicketDrawer) {
                    window.openTicketDrawer(ticketId);
                } else {
                    const ticketRow = document.querySelector(`[data-ticket-id="${ticketId}"]`) || document.getElementById(`ticket-${ticketId}`);
                    if (ticketRow) {
                        ticketRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } else {
                window.location.href = `/tickets?ticket=${encodeURIComponent(ticketId)}`;
            }
        },

        animateBell: function () {
            const bell = document.querySelector('#notificationBellIcon, .ti-bell, .ti-bell-check');
            if (bell) {
                bell.classList.add('animate-ring');
                setTimeout(() => bell.classList.remove('animate-ring'), 2000);
            }
        },

        showToast: function (notif) {
            const existingToast = document.getElementById('lilypad-notif-toast');
            if (existingToast) existingToast.remove();

            const toast = document.createElement('div');
            toast.id = 'lilypad-notif-toast';
            toast.className = 'toast-notification position-fixed bottom-0 end-0 m-4 p-3 rounded-3 shadow-lg text-white d-flex align-items-center gap-3';
            toast.style.cssText = 'background: #111827; border: 1px solid #047d24; z-index: 99999; max-width: 380px; animation: slideInUp 0.3s ease; cursor: pointer;';
            toast.innerHTML = `
                <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="background:#047d24; width:38px; height:38px;">
                    <i class="ti ti-bell fs-18 text-white"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1 text-white fs-14 fw-bold">${notif.title}</h6>
                    <p class="mb-0 fs-12 text-light" style="opacity:0.85;">${notif.description}</p>
                </div>
                <button type="button" class="btn-close btn-close-white ms-auto p-1" onclick="document.getElementById('lilypad-notif-toast').remove()"></button>
            `;

            toast.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-close')) {
                    LilypadNotifications.navigateToTicket(notif.ticketId, notif.id);
                }
            });

            document.body.appendChild(toast);
            setTimeout(() => {
                if (toast && toast.parentNode) toast.remove();
            }, 6000);
        },

        formatTimeAgo: function (timestamp) {
            const seconds = Math.floor((Date.now() - timestamp) / 1000);
            if (seconds < 60) return "Just now";
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
        },

        renderBell: function () {
            const list = this.getNotifications();
            const unreadCount = list.filter(n => !n.read).length;

            const badges = document.querySelectorAll('.notification-badge, #notificationBadge, [data-notif-badge]');
            badges.forEach(badge => {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
                    badge.classList.remove('d-none');
                    badge.style.cssText = 'display:flex !important; position:absolute; top:-4px; right:-4px; background:#047d24; color:white; font-size:11px; font-weight:700; width:18px; height:18px; border-radius:50%; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(4,125,36,0.4);';
                } else {
                    badge.style.display = 'none';
                }
            });

            const dropdownContainers = document.querySelectorAll('.notification-body, #notificationListContainer');
            dropdownContainers.forEach(container => {
                if (list.length === 0) {
                    container.innerHTML = `
                        <div class="p-4 text-center text-muted">
                            <i class="ti ti-bell-off fs-32 d-block mb-2 text-muted" style="opacity:0.5;"></i>
                            <p class="mb-0 fs-13">No notifications right now</p>
                        </div>
                    `;
                    return;
                }

                let html = '';
                list.forEach(notif => {
                    const timeAgo = this.formatTimeAgo(notif.timestamp);
                    const unreadStyle = notif.read ? '' : 'background-color: rgba(4, 125, 36, 0.06); border-left: 3px solid #047d24;';
                    
                    html += `
                        <div class="dropdown-item notification-item py-2 px-3 text-wrap border-bottom position-relative" 
                             style="cursor: pointer; transition: background 0.15s ease; ${unreadStyle}" 
                             onclick="LilypadNotifications.navigateToTicket('${notif.ticketId}', '${notif.id}')">
                            <div class="d-flex align-items-start gap-2">
                                <div class="position-relative flex-shrink-0 mt-1">
                                    <div class="rounded-circle text-white d-flex align-items-center justify-content-center" style="background:#047d24; width:34px; height:34px; font-size:14px;">
                                        <i class="ti ti-ticket"></i>
                                    </div>
                                    ${!notif.read ? '<span class="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"></span>' : ''}
                                </div>
                                <div class="flex-grow-1 min-w-0">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <p class="mb-0 fw-bold fs-13 text-dark text-truncate">${notif.title}</p>
                                        <span class="fs-11 text-muted ms-2">${timeAgo}</span>
                                    </div>
                                    <p class="mb-1 text-muted fs-12 text-wrap" style="line-height:1.35;">${notif.description}</p>
                                    <div class="d-flex align-items-center justify-content-between mt-1">
                                        <span class="badge bg-soft-success text-success fs-10 px-2 py-1 rounded-pill fw-semibold">
                                            <i class="ti ti-arrow-right me-1"></i>Open in Operations
                                        </span>
                                        <div class="notification-action d-flex align-items-center gap-1" onclick="event.stopPropagation()">
                                            ${!notif.read ? `
                                                <button class="btn btn-sm p-0 text-muted" title="Mark as Read" onclick="LilypadNotifications.markAsRead('${notif.id}', event)">
                                                    <i class="ti ti-check fs-14 text-success"></i>
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-sm p-0 text-muted" title="Dismiss" onclick="LilypadNotifications.clearNotification('${notif.id}', event)">
                                                <i class="ti ti-x fs-14"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = html;
            });
        },

        renderDashboardWidget: function (filter = this.currentFilter) {
            this.currentFilter = filter;
            const container = document.getElementById('dashboardTicketsListContainer');
            const tickets = this.getTickets();

            // Update Header KPI Counters
            const kpiTodo = document.getElementById('dashKpiTodo');
            const kpiInProgress = document.getElementById('dashKpiInProgress');
            const kpiUrgent = document.getElementById('dashKpiUrgent');
            const kpiComplete = document.getElementById('dashKpiComplete');

            if (kpiTodo) kpiTodo.textContent = tickets.filter(t => t.status === 'To-Do').length;
            if (kpiInProgress) kpiInProgress.textContent = tickets.filter(t => t.status === 'In Progress').length;
            if (kpiUrgent) kpiUrgent.textContent = tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;
            if (kpiComplete) kpiComplete.textContent = tickets.filter(t => t.status === 'Complete' || t.status === 'Resolved').length;

            if (!container) return;

            let filtered = tickets;
            if (filter === 'urgent') {
                filtered = tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High');
            }

            if (!filtered.length) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <div class="rounded-circle d-inline-flex p-3 mb-3" style="background:#f0fdf4; color:#047d24;">
                            <i class="ti ti-ticket-off fs-36"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">No Active Tickets in Queue</h5>
                        <p class="text-muted fs-13 mb-3" style="max-width: 480px; margin: 0 auto;">All operational requests are clear. When tickets are submitted via web form, email gateway, or internal team, they will stream here in real time.</p>
                        <a href="tickets.html" class="btn btn-primary btn-sm rounded-pill px-4 shadow-sm mt-2">
                            <i class="ti ti-plus me-1"></i> Create First Ticket
                        </a>
                    </div>
                `;
                return;
            }

            let html = '';
            filtered.slice(0, 6).forEach(t => {
                const priorityClass = t.priority === 'Urgent' ? 'danger' : (t.priority === 'High' ? 'warning' : 'info');
                const statusClass = t.status === 'To-Do' ? 'success' : (t.status === 'In Progress' ? 'warning' : (t.status === 'Blocked' ? 'danger' : 'success'));
                
                const metaTags = Object.entries(t.formData || {})
                    .slice(0, 2)
                    .map(([k, v]) => `<span class="badge bg-light text-muted border fs-10 me-1"><strong>${k}:</strong> ${v}</span>`)
                    .join('');

                const productTag = t.linkedProduct && t.linkedProduct !== 'General Asset / None'
                    ? `<span class="badge bg-soft-primary text-primary fs-10"><i class="ti ti-box me-1"></i>${t.linkedProduct}</span>`
                    : '';

                const filesTag = (t.attachments && t.attachments.length)
                    ? `<span class="badge bg-light text-dark border fs-10"><i class="ti ti-paperclip me-1"></i>${t.attachments.length} files</span>`
                    : '';

                html += `
                    <div class="col-xl-4 col-md-6 d-flex">
                        <div class="card flex-fill border rounded-3 p-3 position-relative shadow-none" 
                             style="cursor: pointer; transition: all 0.2s ease; border-color: var(--bs-border-color, #e2e8f0);"
                             onclick="LilypadNotifications.navigateToTicket('${t.id}')"
                             onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='#047d24';"
                             onmouseout="this.style.transform='none'; this.style.borderColor='var(--bs-border-color, #e2e8f0)';">
                            
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <span class="badge bg-dark text-white fw-bold fs-11 px-2 py-1 rounded-pill">
                                    ${t.formattedUid || '#' + t.uid}
                                </span>
                                <div class="d-flex align-items-center gap-1">
                                    <span class="badge bg-soft-${priorityClass} text-${priorityClass} fs-10 px-2 py-1 rounded-pill fw-semibold">
                                        ${t.priority}
                                    </span>
                                    <span class="badge bg-soft-${statusClass} text-${statusClass} fs-10 px-2 py-1 rounded-pill fw-semibold">
                                        ${t.status}
                                    </span>
                                </div>
                            </div>

                            <h6 class="fw-bold fs-13 mb-1 text-dark text-truncate" title="${t.title}">${t.title}</h6>
                            <div class="d-flex align-items-center gap-1 mb-2">
                                ${productTag}
                                ${filesTag}
                            </div>
                            <p class="text-muted fs-12 mb-2 text-truncate" style="line-height:1.4;">${t.description}</p>
                            
                            <div class="mb-2">
                                ${metaTags}
                            </div>

                            <div class="d-flex align-items-center justify-content-between pt-2 border-top mt-auto fs-12">
                                <span class="text-muted d-flex align-items-center">
                                    <i class="ti ti-user me-1 fs-13 text-primary"></i>
                                    <strong class="text-dark">${t.assigneeName}</strong>
                                </span>
                                <span class="text-success fw-semibold fs-11 d-flex align-items-center">
                                    Open &rarr;
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        },

        init: function () {
            this.renderBell();
            this.renderDashboardWidget();

            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_NOTIF_KEY) {
                    this.renderBell();
                }
                if (e.key === STORAGE_TICKETS_KEY) {
                    this.renderDashboardWidget();
                }
            });

            const urlParams = new URLSearchParams(window.location.search);
            const targetTicket = urlParams.get('ticket');
            if (targetTicket && window.location.pathname.includes('tickets')) {
                setTimeout(() => {
                    if (window.openTicketDrawer) {
                        window.openTicketDrawer(targetTicket);
                    }
                }, 400);
            }
        }
    };

    window.LilypadNotifications = LilypadNotifications;
    window.filterDashboardTickets = function (filter, btn) {
        if (btn) {
            document.querySelectorAll('#dashboardTicketFilterPills .nav-link').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
        LilypadNotifications.renderDashboardWidget(filter);
    };

    document.addEventListener('DOMContentLoaded', function () {
        LilypadNotifications.init();
    });

})();

