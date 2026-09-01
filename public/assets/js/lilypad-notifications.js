/**
 * LilyPad ERP - Global Real-Time Notification & Dashboard Ticket Feed System
 */

(function () {
    "use strict";

    const NOTIF_POLL_MS = 25000;

    const LilypadNotifications = {
        cachedNotifications: [],
        seenIds: new Set(),
        seenIdsInitialized: false,

        // Local-only "you just did X" confirmation toast (e.g. "Ticket Created").
        // Not persisted, not tied to the real cross-user notification feed below.
        addNotification: function (notif) {
            const localNotif = {
                title: notif.title || "Ticket Notification",
                message: notif.description || "",
                ticketId: notif.ticketId || null
            };
            this.showToast(localNotif);
            this.animateBell();
            return localNotif;
        },

        fetchNotifications: async function () {
            try {
                const res = await fetch('/api/v1/lilypad/notifications');
                if (!res.ok) return;
                const result = await res.json();
                if (!result.success) return;

                this.cachedNotifications = result.data || [];

                if (!this.seenIdsInitialized) {
                    // First load: remember what's already there, don't toast for it.
                    this.cachedNotifications.forEach(n => this.seenIds.add(n._id));
                    this.seenIdsInitialized = true;
                } else {
                    this.cachedNotifications
                        .filter(n => !this.seenIds.has(n._id))
                        .forEach(n => {
                            this.seenIds.add(n._id);
                            this.showToast(n);
                            this.animateBell();
                        });
                }

                this.renderBell();
            } catch (e) {
                console.error("Error fetching notifications:", e);
            }
        },

        markAsRead: async function (id, e) {
            if (e) e.stopPropagation();
            try {
                await fetch(`/api/v1/lilypad/notifications/${id}/read`, { method: 'PUT' });
                await this.fetchNotifications();
            } catch (e) {
                console.error("Error marking notification as read:", e);
            }
        },

        markAllAsRead: async function (e) {
            if (e) e.preventDefault();
            try {
                await fetch('/api/v1/lilypad/notifications/read-all', { method: 'PUT' });
                await this.fetchNotifications();
            } catch (e) {
                console.error("Error marking all notifications as read:", e);
            }
        },

        clearNotification: async function (id, e) {
            if (e) e.stopPropagation();
            try {
                await fetch(`/api/v1/lilypad/notifications/${id}`, { method: 'DELETE' });
                await this.fetchNotifications();
            } catch (e) {
                console.error("Error clearing notification:", e);
            }
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
            toast.style.cssText = 'background: #111827; border: 1px solid var(--bs-primary); z-index: 99999; max-width: 380px; animation: slideInUp 0.3s ease; cursor: pointer;';
            toast.innerHTML = `
                <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="background:var(--bs-primary); width:38px; height:38px;">
                    <i class="ti ti-bell fs-18 text-white"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1 text-white fs-14 fw-bold">${notif.title}</h6>
                    <p class="mb-0 fs-12 text-light" style="opacity:0.85;">${notif.message || ''}</p>
                </div>
                <button type="button" class="btn-close btn-close-white ms-auto p-1" onclick="document.getElementById('lilypad-notif-toast').remove()"></button>
            `;

            toast.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-close')) {
                    LilypadNotifications.navigateToTicket(notif.ticketId, notif._id);
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
            const list = this.cachedNotifications;
            const unreadCount = list.filter(n => !n.read).length;

            const badges = document.querySelectorAll('.notification-badge, #notificationBadge, [data-notif-badge]');
            badges.forEach(badge => {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
                    badge.classList.remove('d-none');
                    badge.style.cssText = 'display:flex !important; position:absolute; top:-4px; right:-4px; background:var(--bs-primary); color:white; font-size:11px; font-weight:700; width:18px; height:18px; border-radius:50%; align-items:center; justify-content:center; border:2px solid #ffffff; box-shadow:0 2px 6px rgba(var(--bs-primary-rgb), 0.4);';
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
                    const timeAgo = this.formatTimeAgo(new Date(notif.createdAt).getTime());
                    const unreadStyle = notif.read ? '' : 'background-color: rgba(var(--bs-primary-rgb), 0.08); border-left: 3px solid var(--bs-primary);';

                    html += `
                        <div class="dropdown-item notification-item py-2 px-3 text-wrap border-bottom position-relative"
                             style="cursor: pointer; transition: background 0.15s ease; ${unreadStyle}"
                             onclick="LilypadNotifications.navigateToTicket('${notif.ticketId}', '${notif._id}')">
                            <div class="d-flex align-items-start gap-2">
                                <div class="position-relative flex-shrink-0 mt-1">
                                    <div class="rounded-circle text-white d-flex align-items-center justify-content-center" style="background:var(--bs-primary); width:34px; height:34px; font-size:14px;">
                                        <i class="ti ti-at"></i>
                                    </div>
                                    ${!notif.read ? '<span class="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"></span>' : ''}
                                </div>
                                <div class="flex-grow-1 min-w-0">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <p class="mb-0 fw-bold fs-13 text-dark text-truncate">${notif.title}</p>
                                        <span class="fs-11 text-muted ms-2">${timeAgo}</span>
                                    </div>
                                    <p class="mb-1 text-muted fs-12 text-wrap" style="line-height:1.35;">${notif.message || ''}</p>
                                    <div class="d-flex align-items-center justify-content-between mt-1">
                                        <span class="badge bg-soft-success text-success fs-10 px-2 py-1 rounded-pill fw-semibold">
                                            <i class="ti ti-arrow-right me-1"></i>Open in Operations
                                        </span>
                                        <div class="notification-action d-flex align-items-center gap-1" onclick="event.stopPropagation()">
                                            ${!notif.read ? `
                                                <button class="btn btn-sm p-0 text-muted" title="Mark as Read" onclick="LilypadNotifications.markAsRead('${notif._id}', event)">
                                                    <i class="ti ti-check fs-14 text-success"></i>
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-sm p-0 text-muted" title="Dismiss" onclick="LilypadNotifications.clearNotification('${notif._id}', event)">
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

        init: function () {
            this.fetchNotifications();

            setInterval(() => this.fetchNotifications(), NOTIF_POLL_MS);

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

    document.addEventListener('DOMContentLoaded', function () {
        LilypadNotifications.init();
    });

})();

