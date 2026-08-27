/**
 * LilyPad ERP - Global Real-Time Notification & Dashboard Ticket Feed System
 */

(function () {
    "use strict";

    const STORAGE_NOTIF_KEY = "lilypad_notifications_data";
    const STORAGE_TICKETS_KEY = "lilypad_tickets_data";

    // Initial default seed tickets matching Spiceworks + LilyPad capabilities
    const defaultTickets = [
        {
            id: "10",
            uid: 10,
            formattedUid: "#10",
            title: "Antari 2000 Elite Silkscreens, Cartons, User Manuals",
            description: "Finalize silkscreen vector artwork, outer carton master dieline specifications, and multi-language user manual prints for Antari 2000 Elite production release.",
            status: "In Progress",
            priority: "High",
            categoryName: "Packaging & Technical Docs",
            linkedProduct: "Antari 2000 Elite",
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
            reporterName: "Mark Henderson (Packaging Lead)",
            assigneeName: "Scott Karan",
            watchers: ["Scott Karan", "Sarah Connor", "Alex Morgan"],
            formData: {
                artworkRevision: "Rev C.2 (Approved for 2-color screen)",
                cartonDimensions: "480 x 320 x 220 mm (5-ply corrugated)",
                manualLanguages: "EN, ES, FR",
                complianceApproval: "Yes"
            },
            attachments: [
                { id: "f1", name: "Antari_2000_Elite_Silkscreen_Artwork_v2.ai", size: "6.2 MB", uploader: "Mark Henderson", uploadedAt: "Yesterday", icon: "ti-file-vector" },
                { id: "f2", name: "Master_Carton_Dieline_Spec_RevB.pdf", size: "3.4 MB", uploader: "Mark Henderson", uploadedAt: "Yesterday", icon: "ti-file-type-pdf" },
                { id: "f3", name: "Antari_2000_Elite_User_Manual_Draft.pdf", size: "12.8 MB", uploader: "Sarah Connor", uploadedAt: "3 hours ago", icon: "ti-file-text" }
            ],
            expenses: [
                { id: "e1", item: "Silkscreen Film Printing Plates (2-color)", vendor: "Apex Print Works", po: "PO-88412", amount: 240.00 },
                { id: "e2", item: "Carton Proof Sample Run (50 units)", vendor: "PackCraft Global", po: "PO-88419", amount: 175.00 }
            ],
            history: [
                { action: "Ticket Created & Assigned to Scott Karan", by: "Mark Henderson", time: "Yesterday" },
                { action: "Attached Master_Carton_Dieline_Spec_RevB.pdf", by: "Mark Henderson", time: "Yesterday" },
                { action: "Attached Antari_2000_Elite_User_Manual_Draft.pdf", by: "Sarah Connor", time: "3 hours ago" },
                { action: "Logged 1.5 hrs on proof review", by: "Scott Karan", time: "1 hour ago" }
            ],
            comments: [
                { author: "Mark Henderson", text: "Silkscreen dielines match the chassis CAD dimensions. Need final sign-off before vendor plate exposure.", isInternal: false, time: "Yesterday" },
                { author: "Scott Karan", text: "Chassis hole alignments verified against engineering drawings. Approved for sample run.", isInternal: true, time: "2 hours ago" }
            ],
            workLogs: [
                { hours: 1.5, note: "Dimensional verification of silkscreen markings and carton dieline", loggedAt: "2 hours ago" },
                { hours: 1.0, note: "User manual electrical diagram review", loggedAt: "3 hours ago" }
            ],
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: "1",
            uid: 1001,
            formattedUid: "LP-1001",
            title: "MacBook Pro M3 Workstation Provisioning",
            description: "Setup Apple M3 Silicon workstation with developer tools, Docker Desktop, and SSH certificates.",
            status: "To-Do",
            priority: "Normal",
            categoryName: "IT & Hardware Request",
            linkedProduct: "Enterprise ERP Server Node X1",
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
            reporterName: "Sarah Connor",
            assigneeName: "Scott Karan",
            watchers: ["Scott Karan", "David Miller"],
            formData: { hardwareItem: "MacBook Pro 16\"", department: "Engineering", assetTag: "LP-MAC-1092" },
            attachments: [{ id: "f4", name: "Software_Checklist.pdf", size: "420 KB", uploader: "Sarah Connor", uploadedAt: "1 day ago", icon: "ti-file-type-pdf" }],
            history: [{ action: "Ticket Created", by: "Sarah Connor", time: "1 day ago" }],
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: "2",
            uid: 1002,
            formattedUid: "LP-1002",
            title: "Acme Logistics ERP Onboarding & DB Provisioning",
            description: "External client onboarding for 50 initial warehouse operator seats with database migration.",
            status: "In Progress",
            priority: "Urgent",
            categoryName: "Client ERP Setup & Onboarding",
            linkedProduct: "LilyPad Solar Telemetry Gateway",
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
            reporterName: "Robert Johnson",
            assigneeName: "Alex Morgan",
            watchers: ["Alex Morgan", "Scott Karan"],
            formData: { clientCompany: "Acme Logistics Inc.", userSeats: 50, migrationNeeded: "Yes" },
            attachments: [{ id: "f5", name: "Acme_Legacy_Data_Schema.csv", size: "2.8 MB", uploader: "Robert Johnson", uploadedAt: "2 days ago", icon: "ti-file-spreadsheet" }],
            history: [{ action: "Status moved to In Progress", by: "Alex Morgan", time: "1 day ago" }],
            createdAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    // Seed notifications
    const defaultNotifications = [
        {
            id: "notif_10",
            title: "Artwork Proof Attached: #10",
            description: "Master Carton Dieline & Silkscreen v2 uploaded by Mark Henderson for Antari 2000 Elite.",
            ticketId: "10",
            timestamp: Date.now() - 1800000,
            read: false,
            type: "file_attached"
        },
        {
            id: "notif_1",
            title: "Ticket Assigned: LP-1001",
            description: "MacBook Pro M3 Workstation assigned to Scott Karan.",
            ticketId: "1",
            timestamp: Date.now() - 7200000,
            read: true,
            type: "assigned"
        }
    ];

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
            if (!container) return;

            const tickets = this.getTickets();
            let filtered = tickets;

            if (filter === 'mine') {
                filtered = tickets.filter(t => t.assigneeName === 'Scott Karan');
            } else if (filter === 'urgent') {
                filtered = tickets.filter(t => t.priority === 'Urgent' || t.priority === 'High');
            }

            if (!filtered.length) {
                container.innerHTML = `
                    <div class="col-12 text-center py-4 text-muted">
                        <i class="ti ti-clipboard-check fs-36 d-block mb-2" style="opacity:0.4;"></i>
                        <p class="mb-0 fs-13">No tickets found for this filter.</p>
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
